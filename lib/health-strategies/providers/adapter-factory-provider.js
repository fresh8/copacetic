/**
 * Provides a configurable provider for creating an adapter
 * @param {Object<String, Adapter>} adapters
 */
module.exports = (adapters) => {
  /**
   * @param {Injector} injector
   * @return {Function} Configuration function that provides an injector
   * for an adapter factory function
   */
  return (injector) => {
    const supportedClients = Object.keys(adapters)

    /**
     * @return {Function} Factory function that provides an adapter
     */
    return () => {
      const dependency = injector.provideAny(supportedClients, false)

      return adapters[dependency.name](dependency.exported)
    }
  }
}
