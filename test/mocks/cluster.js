const EventEmitter = require('events')

// One this this might deserve to be extracted into another library
class ClusterMock extends EventEmitter {
  constructor (config) {
    super()

    this.isMaster = config.isMaster
    this.masterListeners = config.masterListeners

    if (config.workers) {
      this.workers = (config.workers || []).reduce((hash, worker) => {
        hash[worker.id] = new Worker(worker, this)
        return hash
      }, {})
    }

    if (config.worker) {
      this.worker = new Worker(config.worker, this)
    }
  }

  mockNewWorker (config) {
    this.workers[config.id] = new Worker(config)
    this.emit('fork', this.workers[config.id])
    this.emit('online', this.workers[config.id])
  }

  mockWorkerDeath (id) {
    this.emit('disconnect', this.workers[id])
    this.emit('exit', this.workers[id])
    delete this.workers[id]
  }

  callListener (eventName, cb) {
    if (!this.listeners || !this.listeners[eventName]) {
      throw new Error('Unknown listener')
    }
    this.listeners[eventName](cb)
  }
}

class Worker extends EventEmitter {
  constructor (config, master) {
    super()

    Object.assign(this, config)
    this.master = master
  }

  send (message, handle, callback) {
    if (!callback) {
      callback = handle
    }
    this.master.callListener(message, callback)
  }
}

module.exports = function (clusterConfig) {
  return new ClusterMock(clusterConfig)
}
