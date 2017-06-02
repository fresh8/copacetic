/**
 * @constructs Express middleware to serve the health of your dependencies
 * @param {Copacetic} copacetic
 * @param {Integer} [interval] how regular services will be checked
 * @param {Array<String>} [services] if provided, only these servies will be polled
 * @param {Boolean} [parallel=true] check in sequence, or parallel
 * @param {String} [schedule=start] schedule the next check as soon as a poll starts, or wait
 * until it ends
 */
module.exports = ({ copacetic, interval, services, parallel, schedule, verbose = true }) => {
  if (interval) {
    if (services) {
      copacetic.poll({ services, interval, parallel, schedule })
    } else {
      copacetic.pollAll({ interval, parallel, schedule })
    }
  }

  if (verbose) {
    return (req, res) => {
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
