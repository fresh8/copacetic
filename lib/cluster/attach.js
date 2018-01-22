const EVENT_NAMES = [
  "ASK_MASTER_HEALTH"
].reduce((memo, name) => {
  memo[name] = name
  return memo
}, {})

function addWorker(copacetic, worker) {
  try {
    copacetic.registerDependency({
      name: worker.id,
      level: 'todo', //TODO this should be configurable
      strategy: { type: 'copacetic' }
    })
  } catch(e) {
    if(!e.message || e.message.indexOf('already registered') == -1) {
      throw e
    }
    //was already registered, ignore safely
  }
}

module.exports = function attachToClusterFactory(injector) {
  const clusterMessages = injector.provideOne('cluster-messages')
  const cluster = injector.provideOne('cluster')

  const attachToCluster = function attachToCluster(copacetic) {

    if(copacetic.eventEmitterMode) {
      throw new Error("Cluster feature not available in event emitter mode")
    }

    if(cluster.isMaster) {
      for (const id in cluster.workers) {
        addWorker(copacetic, cluster.workers[id])
      }

      cluster.on('online', addWorker.bind(null, copacetic))
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
    }
  }
  attachToCluster.EVENT_NAMES = EVENT_NAMES
  return attachToCluster
}
