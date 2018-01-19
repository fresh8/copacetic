module.exports = function attachToClusterFactory(injector) {
  const clusterMessages = injector.provideOne('cluster-messages')
  const cluster = injector.provideOne('cluster')

  return function attachToCluster(copacetic) {
    if(cluster.isMaster) {
      for (const id in cluster.workers) {
        const worker = cluster.workers[id]
        copacetic.registerDependency({
          name: id,
          level: 'todo', //TODO this should be configurable
          strategy: { type: 'copacetic' }
        })
      }
    }
  }
}
