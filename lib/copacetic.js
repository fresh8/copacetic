const EventEmitter = require('events')

const precond = require('precond')
const isObject = require('lodash.isobject')
const humanInterval = require('human-interval')

const promiseAllSilent = require('./util/promise-all-silent')
const promiseSeriesSilent = require('./util/promise-series-silent')
const Dependency = require('./dependency')

/**
 * @class
 * @classdesc Responsible for the scheduling of health checks on registered dependencies
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
   * @return {Boolean} if a hard dependency is unavailable your service becomes unhealthy
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
   * @return {Dependency|Undefined}
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
   * registers a dependency that can be health checked
   * @param {Object} opts - the configuration for a dependency
   * @return {Health}
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
   * deregisters a dependency
   * @param {String} name the name used to identify a dependency
   * @return {Health}
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
   * utility function for polling all dependencies
   * @param {String} [interval='5 seconds']
   * @param {Boolean} [parallel=true]
   * @param {String} [schedule='start']
   * @return {Health}
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
   * polls, at some interval, the registered dependencies
   * @param {Array<Oject>} dependencies [{ name, retries }]
   * @param {String} [interval='5 seconds']
   * @param {Boolean} [parallel=true]
   * @param {String} [schedule='start']
   * @return {Health}
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
   * utility function for checking all dependencies
   * @return {Health}
   */
  checkAll (parallel) {
    const dependencies = this.dependencyNames.map(s => ({
      name: this.getDependency(s).name,
      retries: 1
    }))

    return this.check({ dependencies, parallel })
  }

  /**
   * @param {String} [name] if provided, a single dependency will be checked
   * @param {Array<String>} [dependencies] if provided, an array of dependencies will be checked
   * @param {Integer} [retries=1] how many times should a dependency be checked, until it
   * is deemed unhealthy
   * @param {Boolean} [parallel=true] if opts.dependencies is provided, dependencies can either be
   * checked in parallel or in series
   */
  check ({ name, dependencies, retries = 1, parallel = true } = {}) {
    precond.checkIsNumber(retries, 'retries must be an integer')

    if (name) {
      this
        ._checkOne(name, retries)
        .then(s => this.emit('healthy', s))
        .catch(s => this.emit('unhealthy', s))
    }

    if (dependencies) {
      this
        ._checkMany(dependencies, parallel)
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

module.exports = Copacetic
