const constants = require('../../../cluster/constants')

/**
 * @class
 * @classdesc An adapter for the cluster-messages message broker.
 * https://npmjs.com/cluster-messages
 */
class ClusterMessagesAdapter {
  constructor (ClusterMessages) {
    this.ClusterMessages = ClusterMessages
  }

  init (options = {}) {
    this.timeout = options.timeout || 5000
    this.messenger = new this.ClusterMessages({metaKey: 'copacetic'})
  }

  /**
   * Check the health of another worker.
   * @param {worker} The worker to check
   * @return {DependencyHealth}
   */
  checkHealth (worker) {
    return new Promise((resolve, reject) => {
      setTimeout(
        () => reject(new Error('Message to worker timed out')),
        this.timeout
      )
      if (!worker || !worker.id) {
        return reject(new Error('Missing worker id'))
      }
      this.messenger.send(
        `${constants.EVENT_NAMES.MASTER_ASKING_HEALTH}${worker.id}`,
        {},
        resolve
      )
    })
  }
}
module.exports = ClusterMessages => new ClusterMessagesAdapter(ClusterMessages)
