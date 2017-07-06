/**
 * Provides a configurable provider for creating a health strategy
 * @param {Strategy} strategy
 * @param {Function} AdapterFactory
 */
module.exports = (Strategy, AdapterFactory) => {
  /**
   * @param {Injector} injector
   * @return {Function} Factory function for creating a health strategy
   */
  return (injector) => {
    const Adapter = AdapterFactory(injector)

    /**
     * @param {Function} [adapter] - () => Adapter
     * @param {Object} [opts] - Configiuration for an adapter
     * @return {Strategy}
     */
    return (adapter = Adapter(), opts) => Strategy(adapter, opts)
  }
}
