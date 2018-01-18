module.exports = function factory(clusterMock, options) {
  return class ClusterMessagesMock {
    constructor(options) {
    }

    send(eventName, data, callback) {
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
