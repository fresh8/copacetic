/**
 * provides a configurable factory that creates some health strategy
 * @param {Strategy} strategy
 * @param {Function} AdapterFactory
 */
module.exports = (Strategy, AdapterFactory) => {
  /**
   * @param {Injector} injector
   * @return {Function} factory function for creating a health strategy
   */
  return (injector) => {
    const Adapter = AdapterFactory(injector)

    return (adapter = Adapter(), opts) => new Strategy(adapter, opts)
  }
}
