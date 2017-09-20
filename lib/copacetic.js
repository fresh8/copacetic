const EventEmitter = require('events')

const precond = require('precond')
const isObject = require('lodash.isobject')
const cloneDeep = require('lodash.clonedeep')
const humanInterval = require('human-interval')

const promiseAllSilent = require('./util/promise-all-silent')
const promiseSeriesSilent = require('./util/promise-series-silent')

module.exports = (Dependency) => {
  /**
   * @class
   * @extends EventEmitter
   */
  class Copacetic extends EventEmitter {
    /**
     * @param {String} [name=''] The name of your service
     */
    constructor (name = '', eventEmitterMode = true) {
      super()

      this.isPolling = false
      this.name = name
      this.eventEmitterMode = eventEmitterMode
      this.dependencyNames = []
      this.dependencyIndex = {}
    }

    /**
     * @return {Boolean} Copacetic is healthy when all hard dependencies are healthy
     */
    get isHealthy () {
      return !this
        .dependencyNames.map(s => this.getDependency(s).healthSummary)
        .some(health => health.level === 'HARD' && health.healthy === false)
    }

    /**
     * @return {Array<DependencyHealth>} Health information on all dependencies
     */
    get healthInfo () {
      return this.dependencyNames.map(s => this.getDependency(s).healthSummary)
    }

    /**
     * @param {Dependency|String} dependency
     * @return {Dependency}
     */
    getDependency (dependency) {
      if (isObject(dependency)) {
        return this.dependencyIndex[dependency.name]
      }

      return this.dependencyIndex[dependency]
    }

    /**
     * @param {Dependency|String} dependency
     * @return {Boolean} Whether the dependency has been registered
     */
    isDependencyRegistered (dependency) {
      return !!this.getDependency(dependency)
    }

    /**
     * Adds a dependency to a Copacetic instance
     * @param {Object} opts The configuration for a dependency
     * @return {Copacetic}
     */
    registerDependency (opts) {
      const dependency = Dependency(opts)

      precond.checkState(
        this.isDependencyRegistered(dependency) === false,
        `Dependency ${dependency.name} was already registered`
      )

      this.dependencyNames.push(dependency.name)
      this.dependencyIndex[dependency.name] = dependency

      return this
    }

    /**
     * Removes a dependency from a Copacetic instance
     * @param {String} name The name used to identify a dependency
     * @return {Copacetic}
     */
    deregisterDependency (dependency) {
      const resolved = this.getDependency(dependency)

      precond.checkIsDef(
        resolved,
        `Tried to deregister dependency, but dependency is not registered`
      )
      resolved.cleanup()

      delete this.dependencyIndex[resolved.name]
      this.dependencyNames = this.dependencyNames.filter(n => n !== resolved.name)

      return this
    }

    /**
     * Polls the health of all registered dependencies
     * @param {String} [interval='5 seconds']
     * @param {Boolean} [parallel=true]
     * @param {String} [schedule='start']
     * @return {Copacetic}
     */
    pollAll ({ interval, parallel, schedule } = {}) {
      this.poll({ dependencies: 'all', interval, parallel, schedule })

      return this
    }

    /**
     * Polls the health of a set of dependencies
     * @example
     * copacetic.poll({
     *   dependencies: [
     *     { name: 'my-dep' },
     *     { name: 'my-other-dep', retries: 2, maxDelay: '2 seconds' }
     *   ],
     *   schedule: 'end',
     *   interval: '1 minute 30 seconds'
     * })
     * .on('health', (serviceHealth, stop) => {
     *   // Do something with the result
     *   // [{ name: String, health: Boolean, level: HARD/SOFT, lastCheck: Date }]
     *   // stop polling
     *   stop()
     * })
     * @example
     * copacetic.poll({ name: 'my-dependency' })
     * .on('health', () => { ... Do something })
     * @fires Copacetic#health
     * @param {String} [name] The identifier of a single dependency to be checked
     * @param {Array<Object>} [dependencies] An explicit set of dependencies to be polled
     * @param {String} [interval='5 seconds']
     * @param {Boolean} [parallel=true] Kick of health checks in parallel or series
     * @param {String} [schedule='start'] Schedule the next check to start (interval - ms) | ms
     * @return {Copacetic}
     */
    poll ({
      name,
      dependencies,
      interval = '5 seconds',
      maxDelay = '30 seconds',
      parallel = true,
      schedule = 'start'
    } = {}) {
      const intervalMs = humanInterval(interval)
      const start = process.hrtime()
      const _check = name
        ? () => this._checkOne(name, 1, humanInterval(maxDelay))
        : (_dependencies) => this._checkMany(_dependencies, parallel)

      const loop = () => {
        let _dependencies = []

        if (dependencies === 'all') {
          _dependencies = this.dependencyNames.map(s => ({
            name: this.getDependency(s).name,
            retries: 1
          }))
        } else {
          _dependencies = dependencies
        }

        _check(_dependencies)
          .catch(e => e)
          .then((res) => {
            this.emit('health', res, this.stop.bind(this))

            const delay = schedule === 'start'
              ? intervalMs - (process.hrtime(start)[1] * 1e-6)
              : intervalMs

            if (this.isPolling !== false) {
              this.pollTimeout = setTimeout(loop, delay)
            } else {
              this.emit('stopped')
            }
          })
      }

      this.isPolling = true
      loop()

      return this
    }

    /**
     * stops polling registered dependencies
     */
    stop () {
      this.isPolling = false
      clearTimeout(this.pollTimeout)
    }

    /**
     * Checks the health of all registered dependencies
     * @param {Boolean} [parallel=true] Kick of health checks in parallel or series
     * @return {Copacetic}
     */
    checkAll (parallel) {
      const dependencies = this.dependencyNames.map(s => ({
        name: this.getDependency(s).name,
        retries: 1
      }))

      return this.check({ dependencies, parallel })
    }

    /**
     * Checks the health of a set, or single dependency
     * @example
     * copacetic.check({ name: 'my-dependency' })
     * @example
     * copacetic.check({ name: 'my-dependency', retries: 5 })
     * .on('healthy', serviceHealth => { ... Do stuff })
     * .on('unhealthy', serviceHealth => { ... Handle degraded state })
     * @example
     * copacetic.check({ dependencies: [
     *   { name: 'my-dep' },
     *   { name: 'my-other-dep', retries: 2, maxDelay: '1 second' }
     * ] })
     * .on('health', (servicesHealth) => {
     *   // Do something with the result
     *   // [{ name: String, health: Boolean, level: HARD/SOFT, lastCheck: Date }]
     * })
     * @example
     * copacetic.check({ name: 'my-dependency' })
     * .then((health) => { ... Do Stuff })
     * .catch((err) => { ... Handle degraded state })
     * @fires Copacetic#health
     * @fires Copacetic#healthy
     * @fires Copacetic#unhealthy
     * @param {String} [name] The identifier of a single dependency to be checked
     * @param {Array<Object>} [dependencies] An explicit set of dependencies to be checked
     * @param {Integer} [retries=1] How many times should a dependency be checked, until it
     * is deemed unhealthy
     * @param {Boolean} [parallel=true] Kick of health checks in parallel or series
     * @return {Copacetic}
     */
    check ({ name, dependencies, retries = 1, maxDelay = '30 seconds', parallel = true } = {}) {
      precond.checkIsNumber(retries, 'retries must be an integer')

      const doCheck = name
        ? () => this._checkOne(name, retries, humanInterval(maxDelay))
        : () => this._checkMany(dependencies, parallel)

      if (!this.eventEmitterMode) {
        return doCheck()
      }

      if (name) {
        doCheck()
          /**
           * Health information on a single dependency
           *
           * @event Copacetic#healthy
           * @type {HealthInfo}
           */
          .then(s => this.emit('healthy', s))
          /**
           * Health information on a single dependency
           *
           * @event Copacetic#unhealthy
           * @type {HealthInfo}
           */
          .catch(s => this.emit('unhealthy', s))
      }

      if (dependencies) {
        doCheck()
          /**
           * Health information on a set of dependencies
           *
           * @event Copacetic#health
           * @type {Array<HealthInfo>}
           */
          .then(s => this.emit('health', s))
      }

      return this
    }

    /**
     * Convenience method that waits for a single, or set of dependencies
     * to become healthy. Calling this means copacetic will keep re-checking
     * indefinitely until the dependency(s) become healthy. If you want more
     * control, use .check().
     * @example
     * // wait indefinitely
     * copacetic.waitFor({ name: 'my-dependency'})
     * .on('healthy', serviceHealth => { ... Do stuff })
     * @example
     * // give up after 5 tries
     * copacetic.waitFor({ name: 'my-dependency', retries: 5})
     * .on('healthy', serviceHealth => { ... Do stuff })
     * @param {Object} opts - options accepted by check()
     */
    waitFor (opts = {}) {
      const _opts = cloneDeep(opts)

      if (opts.dependencies) {
        _opts.dependencies = _opts.dependencies.map((d) => ({
          name: d.name,
          retries: 0,
          maxDelay: d.maxDelay || 0
        }))

        return this.check(_opts)
      }

      _opts.retries = 0

      return this.check(_opts)
    }

    /**
     * @param {String} name The name used to identify a dependency
     * @param {Integer} maxDelay The maximum interval of time to wait when retrying
     * @return {Promise}
     */
    _checkOne (name, retries, maxDelay) {
      precond.checkState(
        this.isDependencyRegistered(name) === true,
        `Tried to check dependency - ${name}, but dependency is not registered`
      )

      return this
        .getDependency(name)
        .check(retries, maxDelay)
    }

    /**
     * Checks an array of dependencies in parallel or sequantially
     * @param {Array<Dependency>} dependencies
     * @param {Boolean} parallel
     * @return {Promise}
     */
    _checkMany (dependencies, parallel) {
      if (parallel) {
        return promiseAllSilent(
          dependencies.map(s => this._checkOne(s.name, s.retries, s.maxDelay))
        )
      }

      return promiseSeriesSilent(
        dependencies.map(s => this._checkOne(s.name, s.retries, s.maxDelay))
      )
    }
  }

  return (name, mode) => new Copacetic(name, mode)
}
