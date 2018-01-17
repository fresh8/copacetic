/**
 * An adapter for the cluster-messages message broker
 * https://npmjs.com/cluster-messages
 * @class
 */
class ClusterMessagesAdapter {
  constructor (ClusterMessages) {
    this.ClusterMessages = ClusterMessages //TODO would be good to build clustermessage ourselves to pass on metaKey...
  }

  getHealth() {
    return new Promise((resolve, reject) => {
      this.ClusterMessages.send(
        'GetHealth',
        {id: 'blurb'}, //TODO blurb should be the unique identifier that the worker will recognise
        resolve
      )
    })
  }
}
module.exports = ClusterMessages => new ClusterMessagesAdapter(ClusterMessages)
