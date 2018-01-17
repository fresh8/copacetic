module.exports = function factory(clusterMock) {
  return {
    send(eventName, data, callback) {
      if(clusterMock.isMaster) {
        for(let worker of clusterMock.workers) {
          callback(worker[`on${eventName}`](data))
        }
      } else {
          callback(clusterMock.master[`on${eventName}`](data))
      }
    }
  }
}
