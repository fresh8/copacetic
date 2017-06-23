/// <reference types="node" />

/**
 * contains all of your service's dependencies and provides scheduling
 * options for checking those dependencies
 */
interface Copacetic extends NodeJS.EventEmitter {
  /**
   * The name of your service. This is output in the express
   * middleware when verbose is true
   */
  name: string,

  /**
   * Whether dependencies are currently being polled
   */

  isPolling: boolean,

  /**
   * True when there are no hard dependency failures
   */
  isHealthy: boolean,

  /**
   * Health information on all registered services
   */
  healthInfo: Array<copacetic.Health>,

  /**
   * Returns a registered dependency
   * Examples:
   *
   *  // With a name
   *  copacetic.getDependency('database')
   *
   *  // With a dependency
   *  copacetic.getDependency(dep)
   */
  getDependency (dependency: copacetic.Dependency|string): copacetic.Dependency,

  /**
   * Checks if a dependency exists
   * Examples:
   *
   *  // With a name
   *  copacetic.isDependencyRegistered('database')
   *
   *  // With a dependency
   *  copacetic.isDependencyRegistered(dep)
   */
  isDependencyRegistered (dependency: copacetic.Dependency|string): copacetic.Dependency,

  /**
   * Adds a dependency to a copacetic instance
   * Examples:
   *
   * copacetic.registerDependency({ name: 'database', url: 'memes.com' })
   *
   * copacetic.registerDependency({ name: 'cache', strategy: { type: 'redis' } })
   *
   * copacetic
   *  .registerDependency
   *  ({ name: 'service', strategy: { type: 'redis', adapter } })
   */
  registerDependency (options: copacetic.DependencyOptions): Copacetic,

  /**
   * Removes a dependency from a copacetic instance
   * Examples:
   *
   *  // With a name
   *  copacetic.deregisterDependency('database')
   *
   *  // With a dependency
   *  copacetic.deregisterDependency(dep)
   */
  deregisterDependency (dependency: copacetic.Dependency|string): Copacetic,

  /**
   * Polls the health of all registered dependencies
   */
  pollAll (options: {
    /**
     * The rate at which dependencies will be polled, of the format
     * '5 seconds', '1m minute 20 seconds' etc.
     */
    interval?: string,
    /**
     * check the health of dependencies in sequence, or parallel
     */
    parallel?: boolean,
    /**
     * schedule the next check as soon as a poll starts, or wait
     */
    schedule?: string
  }): Copacetic,

  /**
   * Polls the health of a set of dependencies
   * Example:
   *
   *  copacetic.poll({
   *    dependencies: [
   *      { name: 'database', retries: 2 },
   *      { name: 'cache' }
   *    ],
   *    interval: '1 minute 30 seconds'
   *    parallel: false
   *  })
   */
  poll (options: {
    /**
     * An explicit set of dependencies to be health checked
     */
    dependencies: Array<
      {
        /** the name used when registering the dependency **/
        name: string,
        /** the number of times to retry a health check, before marking as unhealthy **/
        retries?: number
      }
    >,
    /**
     * The rate at which dependencies will be polled, of the format
     * '5 seconds', '1m minute 20 seconds' etc.
     */
    interval: string,
    /**
     * check the health of dependencies in sequence, or parallel
     */
    parallel?: boolean,
    /**
     * schedule the next check as soon as a poll starts, or wait
     */
    schedule?: string
  }): Copacetic,

  /**
   * stops polling dependencies
   */
  stop (): void,

  /**
   * Checks the health of all registered dependencies
   * Example:
   *
   *  copacetic.checkAll(false)
   */
  checkAll (parallel: boolean): Copacetic,

  /**
   * Checks the health of a single dependency
   * Example:
   *
   *  copacetic.check({ name: 'database' })
   *  copacetic.check({ name: 'cache', retries: 2 })
   */
  check(options: {
    name: string,
    retries?: number
  }): Copacetic

  /**
   * Checks the health of a set of dependencies
   * Example:
   *
   *  copacetic.check({
   *    dependencies: [
   *      { name: 'database', retries: 2 },
   *      { name: 'cache' }
   *    ],
   *    parallel: false
   *  })
   *
   */
  check(options: {
    dependencies: Array<{ name: string, retries?: number }> ,
    retries?: number
    parallel?: boolean
  }): Copacetic
}


declare function copacetic(
  /**
   * The name of your service. This is output in the express
   * middleware when verbose is true
   */
  name?: string,
): Copacetic

declare namespace copacetic {
  /**
   * holds information about the health of a dependency, and executes strategies for
   * checking a dependency's health
   */
  interface Dependency {
    /**
     * The identifier used for the dependency
     */
    name: string,

    /**
     * The relationship between a service and dependency
     */
    level: dependencyLevel,

    /**
     * Whether the dependency passed a health check
     */
    healthy: boolean,

    /**
     * The method used for checking a dependencies health
     */
    healthStrategy: HealthStrategy,

    /**
     * How a health strategy will delay itself before executing again
     */
    backoffStrategy: BackoffStrategy,

    /**
     * The description of a dependency's health
     */
    healthSummary: Health,

    /**
     * sets a dependency's status to healthy
     */
    onHealthy (): void,

    /**
     * sets a dependency's status to unhealthy
     */
    onUnhealthy (): void,

    /**
     * performs any cleanup needed
     */
    cleanup (): void,

    check (
      /**
       * The number of times a dependency's health will be checked
       * before giving up
       */
      retries?: number
    ): Promise<Health>,
  }

  /**
   * The description of a dependency's health
   */
   export interface Health {
    /**
     * The name of the dependency that this health report belongs to
     */
    name: string,
    /**
     * Whether the dependency passed a health check
     */
    healthy: boolean,
    /**
     * The relationship between a service and dependency
     */
    level: dependencyLevel,
    /**
     * The last time the dependency was health checked
     */
    lastChecked: Date
  }

  /**
   * A method for checking a dependencies health
   */
  export interface HealthStrategy {
    new (
      /**
       * How long to wait until giving up. of the format
       * '5 seconds', '1m minute 20 seconds' etc.
       */
      timeout: string
    ) : HealthStrategy

    /**
     * Check a dependency's health
     * Example:
     *
     * dependency
     *  .check('my-resource', '5 seconds')
     *  .then(() => { ... do something now it's healthy })
     *  .then(() => { ... handle degraded state })
     */
    check (
      /**
       * The resource accessed when checking the health of a dependency
       */
      url: string,
      /**
       * How long to wait until giving up. of the format
       * '5 seconds', '1m minute 20 seconds' etc.
       */
      timeout: string
    ) : Promise<boolean|Error>

    /**
     * Perform any cleanup operation, if needed, when a dependency
     * is no longer in used
     * Example:
     *
     * dependency
     *  .cleanup()
     *  .then(() => { ... cleanup went OK })
     *  .then(() => { ... cleanup failed })
     */
    cleanup (...args: any[]) : Promise<boolean|Error>
  }

  /**
   * Some function that returns a promise
   */
  export interface BackOffCallable {
    () : Promise<boolean|Error>
  }

  /**
   * A way of delaying some callable. Returns a promise after X
   * retries
   */
  export interface BackoffStrategy {
    new(
      /** the number of times execute will try the callable before giving up **/
      maxRetries: number
    ) : BackoffStrategy

    /**
     * execute some function, retrying some set number of times before failing
     */
    execute (callable: BackOffCallable) : Promise<boolean|Error>
  }

  /**
   * Options used for creating a health strategy via the
   * HealthStrategy factory
   */
  export interface HealthStrategyOptions {
    /**
     * The type of health strategy to use, i.e. http, mongodb, redis
     */
    type: string,
    /**
     * The configuration options for the type of strategy you want to use
     * i.e. timeout
     */
    opts?: object,
    /**
     * A custom adapter to use for a health strategy, i.e. you may want to use some
     * library/database driver copacetic doesn't support out of the box
     */
    adapter?: Function
  }

  /**
   * Options used for registering a new dependency
   */
  export interface DependencyOptions {
    /**
     * Configuration options for a health strategy
     */
    strategy?: HealthStrategyOptions,
    /**
     * The relationship between a service and dependency
     */
    level?: dependencyLevel,
    /**
     * The identifier used for a dependency
     */
    name: string,
    /**
     * The resource accessed when checking the health of a dependency
     */
    url: string
  }

  /**
   * Options for using the express middleware
   */
  export interface MiddlewareOptions {
    /**
     * The instance of copacetic that will serve health information
     */
    copacetic: Copacetic,
    /**
     * The rate at which dependencies will be polled, of the format
     * '5 seconds', '1m minute 20 seconds' etc.
     */
    interval?: string,
    /**
     * An explicit set of dependencies to be health checked
     */
    dependencies?: Array<copacetic.Dependency>,
    /**
     * check the health of dependencies in sequence, or parallel
     */
    parallel?: boolean,
    /**
     * schedule the next check as soon as a poll starts, or wait
     */
    schedule?: string,
    /**
     * When true the middleware will output all health information
     * for the registered dependencies. If not verbose, only a status code
     * will be returned
     */
    verbose?: boolean
  }

  /**
   * Describes the relationship between your service and a dependency
   */
  export enum dependencyLevel {
    /** your service cannot function when a hard dependency is unavailable **/
    HARD,
    /** your service can still run, even if this dependency is unavailable **/
    SOFT
  }
  /**
   * express middleware for a copacetic instance
   */
  export function Middleware(options: MiddlewareOptions): Function

  /**
   * factory function for providing different health strategies
   */
  export function HealthStrategy(options: HealthStrategyOptions): Function
}

export = copacetic
