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
        for(const id in clusterMock.workers) {
          const worker = clusterMock.workers[id]
          const listener = worker[`on${eventName}`]
          if(!listener) {
            continue
          }
          callback(listener(data))
        }
      } else {
        clusterMock.masterListeners[`on${eventName}`](data, callback)
      }
    }

    on(eventName, listener) {
      if(clusterMock.isMaster) {
        if(!clusterMock.masterListeners) {
          clusterMock.masterListeners = {}
        }
        clusterMock.masterListeners[`on${eventName}`] = listener
      }
    }
  }
}
