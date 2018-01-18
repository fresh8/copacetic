/**
 * An adapter for the cluster-messages message broker
 * https://npmjs.com/cluster-messages
 * @class
 */
class ClusterMessagesAdapter {
  constructor (ClusterMessages) {
    this.ClusterMessages = ClusterMessages
  }

  init() {
    this.messenger = new this.ClusterMessages({ metaKey: 'copacetic'})
  }

  checkHealth(worker) {
    return new Promise((resolve, reject) => {
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
