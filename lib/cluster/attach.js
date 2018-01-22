const EVENT_NAMES = [
  "ASK_MASTER_HEALTH"
].reduce((memo, name) => {
  memo[name] = name
  return memo
}, {})

function addWorker(copacetic, worker, attachOptions) {
  try {
    copacetic.registerDependency({
      name: worker.id,
      level: attachOptions.dependency.level,
      strategy: { type: 'copacetic' }
    })
  } catch(e) {
    if(!e.message || e.message.indexOf('already registered') == -1) {
      throw e
    }
    //was already registered, ignore safely
  }
}

function attachToClusterFactory(injector) {
  const clusterMessages = injector.provideOne('cluster-messages')
  const cluster = injector.provideOne('cluster')

  const attachToCluster = function attachToCluster(copacetic, attachOpts = {}) {

    attachOpts.dependency = attachOpts.dependency || {}
    attachOpts.dependency.level = attachOpts.dependency.level || 'HARD'

    if(copacetic.eventEmitterMode) {
      throw new Error("Cluster feature not available in event emitter mode")
    }

    if(cluster.isMaster) {
      for (const id in cluster.workers) {
        addWorker(copacetic, cluster.workers[id], attachOpts)
      }

      cluster.on('online', worker => addWorker(copacetic, worker, attachOpts))
      cluster.on('disconnect', (worker) => {
        copacetic.deregisterDependency(worker.id)
      })

      clusterMessages.on(EVENT_NAMES.ASK_MASTER_HEALTH, (data, callback) => {
        copacetic.checkAll()
          .then(() => {
            callback(copacetic.healthReport)
          })
          //Sadly no `.catch` as cluster-messages doesn't really offer error handling. Better to leave as UnhandledPromiseRejection rather than stick an arbitrary console.error that won't match the logger format of parent service
      })
    } else {
      copacetic.checkCluster = () => {
        return new Promise((resolve, reject) => {
          clusterMessages.send(EVENT_NAMES.ASK_MASTER_HEALTH, {}, resolve) //same comment as above about error handling
        })
      }
    }
  }
  attachToCluster.EVENT_NAMES = EVENT_NAMES
  return attachToCluster
}
attachToClusterFactory.EVENT_NAMES = EVENT_NAMES
module.exports = attachToClusterFactory
