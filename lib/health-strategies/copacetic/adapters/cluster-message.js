/**
 * An adapter for the cluster-messages message broker
 * https://npmjs.com/cluster-messages
 * @class
 */
class ClusterMessagesAdapter {
  constructor (ClusterMessages) {
    this.ClusterMessages = ClusterMessages
  }

  init(options = {}) {
    this.timeout = options.timeout || 5000
    this.messenger = new this.ClusterMessages({ metaKey: 'copacetic'})
  }

  checkHealth(worker) {
    return new Promise((resolve, reject) => {
      setTimeout(
        () => reject(new Error("Message to worker timed out")),
        this.timeout
      )
      if(!worker || !worker.id) {
        return reject(new Error("Missing worker id"))
      }
      this.messenger.send(
        `GetHealth${worker.id}`,
        {},
        resolve
      )
    })
  }
}
module.exports = ClusterMessages => new ClusterMessagesAdapter(ClusterMessages)
