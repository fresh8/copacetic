/**
 * @constructs Express middleware to serve the health of your dependencies
 * @param {Copacetic} copacetic
 * @param {Integer} [interval] How regular services will be checked
 * @param {Array<Object>} [dependencies] An explicit set of dependencies to be polled
 * @param {Boolean} [parallel=true] Check in sequence, or parallel
 * @param {String} [schedule=start] Schedule the next check as soon as a poll starts, or wait
 * until it ends
 */
module.exports = ({ copacetic, interval, dependencies, parallel, schedule, verbose = true }) => {
  if (interval) {
    if (dependencies) {
      copacetic.poll({ dependencies, interval, parallel, schedule })
    } else {
      copacetic.pollAll({ interval, parallel, schedule })
    }
  }

  if (verbose) {
    return (req, res) => {
      /**
       * Health information about your service
       * @typedef {Object} Copacetic~HealthResponse
       * @property {String} Name - the name of your service
       * @property {Boolean} Healthy
       * @property {Array<HealthInfo>}
       */
      return res.json({
        name: copacetic.name || 'service',
        healthy: copacetic.isHealthy,
        dependencies: copacetic.healthInfo
      })
    }
  }

  return (req, res) => {
    return res.sendStatus(copacetic.isHealthy ? 200 : 503)
  }
}
