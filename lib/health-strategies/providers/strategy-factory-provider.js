/**
 * provides a configurable provider for creating a health strategy
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

    /**
     * @param {Function} [adapter] - () => Adapter
     * @param {Object} [opts] - configiuration for an adapter
     * @return {Strategy}
     */
    return (adapter = Adapter(), opts) => new Strategy(adapter, opts)
  }
}
