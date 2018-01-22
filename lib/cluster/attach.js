const constants = require('./constants.js')

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

  /**
   * Register the cluster processes with copacetic.
   * If `cluster.isMaster` it will add all `workers` as dependencies and will be able to report their health.
   * Otherwise setup listeners so the worker know to reply to teh master process. You can get the full health of the cluster from the worker process by calling `Copacetic.checkCLuster()`.
   * @param {Copacetic} the instance of Copacetic the cluster should attach to.
   * @param {[Object]} Options for attaching. Only supports dependency.level.
   * @example
   * const healthChecker = new Copacetic()
   * Copacetic.cluster.attach(healthChecker, { dependency: { level: 'HARD' } })
   */
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

      clusterMessages.on(constants.EVENT_NAMES.ASK_MASTER_HEALTH, (data, callback) => {
        copacetic.checkAll()
          .then(() => {
            callback(copacetic.healthReport)
          })
          //Sadly no `.catch` as cluster-messages doesn't really offer error handling. Better to leave as UnhandledPromiseRejection rather than stick an arbitrary console.error that won't match the logger format of parent service
      })
    } else {
      copacetic.checkCluster = () => {
        return new Promise((resolve, reject) => {
          clusterMessages.send(constants.EVENT_NAMES.ASK_MASTER_HEALTH, {}, resolve) //same comment as above about error handling
        })
      }

      clusterMessages.on(`${constants.EVENT_NAMES.MASTER_ASKING_HEALTH}${cluster.worker.id}`, (data, callback) => {
        copacetic.checkAll()
          .then(() => {
            callback(copacetic.healthReport)
          }) //same comment as above about error handling
      })
    }
  }
  return attachToCluster
}
module.exports = attachToClusterFactory
