const EventEmitter = require('events')

const precond = require('precond')
const isObject = require('lodash.isobject')
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
     * @param {String} [name=''] - the name of your service
     */
    constructor (name = '') {
      super()

      this.isPolling = false
      this.name = name
      this.dependencyNames = []
      this.dependencyIndex = {}
    }

    /**
     * @return {Boolean} Copacetic is healthy when all hard dependencies are healthy
     */
    get isHealthy () {
      return !this
        .dependencyNames.map(s => this.getDependency(s).healthSummary)
        .some(health => health.dependency === 'HARD' && health.healthy === false)
    }

    /**
     * @return {Array<DependencyHealth>} health information on all dependencies
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
     * @return {Boolean} whether the dependency has been registered
     */
    isDependencyRegistered (dependency) {
      return !!this.getDependency(dependency)
    }

    /**
     * adds a dependency to a Copacetic instance
     * @param {Object} opts - the configuration for a dependency
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
     * removes a dependency from a Copacetic instance
     * @param {String} name the name used to identify a dependency
     * @return {Copacetic}
     */
    deregisterDependency (name) {
      precond.checkState(
        this.isDependencyRegistered(name) === true,
        `Tried to deregister dependency - ${name}, but dependency is not registered`
      )

      this.getDependency(name).cleanup()
      delete this.dependencyIndex[name]
      this.dependencyNames = this.dependencyNames.filter(n => n !== name)

      return this
    }

    /**
     * polls the health of all registered dependencies
     * @param {String} [interval='5 seconds']
     * @param {Boolean} [parallel=true]
     * @param {String} [schedule='start']
     * @return {Copacetic}
     */
    pollAll ({ interval, parallel, schedule } = {}) {
      const dependencies = this.dependencyNames.map(s => ({
        name: this.getDependency(s).name,
        retries: 1
      }))

      this.poll({ dependencies, interval, parallel, schedule })

      return this
    }

    /**
     * polls the health of a set of dependencies
     * @example
     * copacetic.poll({
     *   dependencies: [
     *     { name: 'my-dep' },
     *     { name: 'my-other-dep', retries: 2 }
     *   ],
     *   schedule: 'end',
     *   interval: '1 minute 30 seconds'
     * })
     * .on('health', (serviceHealth) => {
     *   // do something with the result
     *   // [{ name: String, health: Boolean, level: HARD/SOFT, lastCheck: Date }]
     * })
     * @fires Copacetic#health
     * @param {Array<Object>} [dependencies] an explicit set of dependencies to be polled
     * @param {String} [interval='5 seconds']
     * @param {Boolean} [parallel=true] kick of health checks in parallel or series
     * @param {String} [schedule='start'] schedule the next check to start (interval - ms) | ms
     * @return {Copacetic}
     */
    poll ({ dependencies, interval = '5 seconds', parallel = true, schedule = 'start' } = {}) {
      const intervalMs = humanInterval(interval)
      const start = process.hrtime()

      const loop = () => {
        this._checkMany(dependencies, parallel)
          .then((res) => {
            this.emit('health', res)
            const delay = schedule === 'start'
              ? intervalMs - (process.hrtime(start)[1] * 1e-6)
              : intervalMs

            if (this.isPolling !== false) {
              this.poll = setTimeout(loop, delay)
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
    }

    /**
     * checks the health of all registered dependencies
     * @param {Boolean} [parallel=true] kick of health checks in parallel or series
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
     * checks the health of a set, or single dependency
     * @example
     * copacetic.check({ name: 'my-dependency' })
     * @example
     * copacetic.check({ name: 'my-dependency', retries: 5 })
     * .on('healthy', serviceHealth => { // do stuff })
     * .on('unhealthy', serviceHealth => { // handle degraded state })
     * @example
     * copacetic.check({ dependencies: [
     *   { name: 'my-dep' },
     *   { name: 'my-other-dep', retries: 2 }
     * ] })
     * .on('health', (servicesHealth) => {
     *   // do something with the result
     *   // [{ name: String, health: Boolean, level: HARD/SOFT, lastCheck: Date }]
     * })
     * @fires Copacetic#health
     * @fires Copacetic#healthy
     * @fires Copacetic#unhealthy
     * @param {String} [name] the identifier of a single dependency to be checked
     * @param {Array<Object>} [dependencies] an explicit set of dependencies to be checked
     * @param {Integer} [retries=1] how many times should a dependency be checked, until it
     * is deemed unhealthy
     * @param {Boolean} [parallel=true] kick of health checks in parallel or series
     * @return {Copacetic}
     */
    check ({ name, dependencies, retries = 1, parallel = true } = {}) {
      precond.checkIsNumber(retries, 'retries must be an integer')

      if (name) {
        this
          ._checkOne(name, retries)
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
        this
          ._checkMany(dependencies, parallel)
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
     * @param {String} name the name used to identify a dependency
     * @return {Promise}
     */
    _checkOne (name, retries) {
      precond.checkState(
        this.isDependencyRegistered(name) === true,
        `Tried to check dependency - ${name}, but dependency is not registered`
      )

      return this
        .getDependency(name)
        .check(retries)
    }

    /**
     * checks an array of dependencies in parallel or sequantially
     * @param {Array<Dependency>} dependencies
     * @param {Boolean} parallel
     * @return {Promise}
     */
    _checkMany (dependencies, parallel) {
      if (parallel) {
        return promiseAllSilent(
          dependencies.map(s => this._checkOne(s.name, s.retries))
        )
      }

      return promiseSeriesSilent(
        dependencies.map(s => this._checkOne(s.name, s.retries))
      )
    }
  }

  return name => new Copacetic(name)
}
