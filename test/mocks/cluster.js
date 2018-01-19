const EventEmitter = require('events')

//One this this might deserve to be extracted into another library
class ClusterMock extends EventEmitter {
  constructor(config) {
    super()

    Object.assign(this, config)

    this.workers = (config.workers || []).reduce((hash, worker) => {
      hash[worker.id] = new Worker(worker)
      return hash
    }, {})
  }

  mockNewWorker(config) {
    this.workers[config.id] = new Worker(config)
    this.emit('fork', this.workers[config.id])
    this.emit('online', this.workers[config.id])
  }

  mockWorkerDeath(id) {
    this.emit('disconnect', this.workers[id])
    this.emit('exit', this.workers[id])
    delete this.workers[id]
  }
}

class Worker extends EventEmitter {
  constructor(config) {
    super()

    Object.assign(this, config)
  }
}

module.exports = function(clusterConfig) {
  return new ClusterMock(clusterConfig)
}
