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

  return function attachToCluster(copacetic) {
    if(cluster.isMaster) {
      for (const id in cluster.workers) {
        addWorker(copacetic, cluster.workers[id])
      }

      cluster.on('online', addWorker.bind(null, copacetic))
      cluster.on('disconnect', (worker) => {
        copacetic.deregisterDependency(worker.id)
      })
    }
  }
}
