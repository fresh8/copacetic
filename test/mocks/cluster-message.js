module.exports = function factory(clusterMock, clusterMockOptions = {}) {
  return class ClusterMessagesMock {
    constructor(options) {
      this.options = options
    }

    send(eventName, data, callback) {
      if(clusterMockOptions.playDead) {
        return
      }

      if(clusterMock.isMaster) {
        for(let worker of clusterMock.workers) {
          const listener = worker[`on${eventName}`]
          if(!listener) {
            continue
          }
          callback(listener(data))
        }
      } else {
        callback(clusterMock.master[`on${eventName}`](data))
      }
    }
  }
}
