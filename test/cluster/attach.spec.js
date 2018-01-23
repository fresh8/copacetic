const { assert, expect } = require('chai')

const constants = require('../../lib/cluster/constants')
const injectorFactory = require('../../lib/util/injector')
const makeAttach = require('../../lib/cluster/attach')
const makeCopacetic = require('../../lib/copacetic')
const makeClusterMock = require('../mocks/cluster')
const makeClusterMessageMock = require('../mocks/cluster-message')

function fakeDependencyAdapter (worker) {
  worker.cleanup = () => {}
  worker.check = () => { return Promise.resolve(worker) }
  worker.healthSummary = {
    name: worker.name,
    level: worker.level,
    isHealthy: true
  }
  return worker
}

function mockForCluster (cluster, buildOpts) {
  const mockedCluster = makeClusterMock(cluster)
  const modules = {
    cluster: mockedCluster,
    'cluster-messages': makeClusterMessageMock(mockedCluster)
  }

  const injector = injectorFactory((name) => {
    return modules[name]
  })

  const copacetic = makeCopacetic(fakeDependencyAdapter)('Mocked', (buildOpts || {}).promiseMode === false)
  return { attach: makeAttach(injector), cluster: mockedCluster, copacetic }
}

describe('Cluster Attach', () => {
  it('exposes a factory', () => {
    assert.isDefined(makeAttach)
    expect(makeAttach).to.be.a('function')
  })

  it('builds a function', () => {
    expect(mockForCluster({}).attach).to.be.a('function')
  })

  describe('master', () => {
    it('should reject being attached to a copacetic not in Promise mode', () => {
      const { attach, copacetic } = mockForCluster({ isMaster: true }, {promiseMode: false})
      expect(attach.bind(attach, copacetic)).to.throw('emitter')
    })

    it('should automatically add workers as dependencies', () => {
      const { attach, copacetic } = mockForCluster({
        isMaster: true,
        workers: [{id: 1, healthSummary: 'healthy'}, {id: 2, healthSummary: 'not healthy'}]
      })
      attach(copacetic)
      const health = copacetic.healthInfo
      expect(health.length).to.equal(2)
    })

    it('should automatically add new workers as they get ready', () => {
      const { attach, cluster, copacetic } = mockForCluster({ isMaster: true, workers: [] })

      attach(copacetic)

      cluster.mockNewWorker({id: 1})
      expect(copacetic.healthInfo.length).to.equal(1)
    })

    it("shouldn't duplicate existing workers", () => {
      // this is in case the first loop on cluster.workers is finished processing before all of those workers emit the `online` event
      const { attach, cluster, copacetic } = mockForCluster({ isMaster: true, workers: [] })

      attach(copacetic)

      cluster.mockNewWorker({id: 1})
      cluster.mockNewWorker({id: 1})
      expect(copacetic.healthInfo.length).to.equal(1)
    })

    it('should remove workers when they die', () => {
      const { attach, copacetic, cluster } = mockForCluster({
        isMaster: true,
        workers: [
          {id: 1, healthSummary: 'healthy'},
          {id: 2, healthSummary: 'not healthy'}
        ]
      })
      attach(copacetic)
      cluster.mockWorkerDeath(1)
      expect(copacetic.healthInfo.length).to.equal(1)
    })

    it('should add an IPC listener to respond to workers asking health', () => {
      const { attach, copacetic, cluster } = mockForCluster({
        isMaster: true,
        workers: [
          {id: 1, healthSummary: 'healthy'}
        ]
      })
      const {clusterMessages} = attach(copacetic)

      cluster.isMaster = false

      return new Promise((resolve, reject) => {
        try {
          clusterMessages.send(constants.EVENT_NAMES.ASK_MASTER_HEALTH, {}, health => {
            try {
              assert.isDefined(health)
              assert.isDefined(health.isHealthy)
              assert.isDefined(health.dependencies)
              resolve()
            } catch (e) {
              reject(e)
            }
          })
        } catch (e) {
          reject(e)
        }
      })
    })

    describe('Dependency level', () => {
      it('defaults dependency level', () => {
        const { attach, copacetic } = mockForCluster({
          isMaster: true,
          workers: [
            {id: 1, healthSummary: 'healthy'}
          ]
        })
        attach(copacetic)
        expect(copacetic.dependencyIndex['1'].level).to.equal('HARD')
      })

      it('supports configurable dependency level', () => {
        const { attach, copacetic } = mockForCluster({
          isMaster: true,
          workers: [
            {id: 1, healthSummary: 'healthy'}
          ]
        })
        attach(copacetic, {dependency: {level: 'Unicorn'}})
        expect(copacetic.dependencyIndex['1'].level).to.equal('Unicorn')
      })
    })
  })

  describe('worker', () => {
    it('should expose a function to ask master what the health of the entire cluster is', () => {
      const { attach, copacetic } = mockForCluster({
        isMaster: false,
        worker: {id: 1},
        masterListeners: {
          [`on${constants.EVENT_NAMES.ASK_MASTER_HEALTH}`]: (data, notACallback) => { // `notACallback` is totally a callback but it avoids the linter complaint.
            notACallback({isHealthy: true})
          }
        }
      })
      attach(copacetic)

      assert.isDefined(copacetic.checkCluster)
      expect(copacetic.checkCluster).to.be.a('function')
      const health = copacetic.checkCluster()
      expect(health).to.be.a('promise')

      return new Promise((resolve, reject) => {
        health.then(result => {
          try {
            assert.isDefined(result.isHealthy)
            resolve()
          } catch (e) {
            reject(e)
          }
        })
        .catch(reject)
      })
    })

    it("should register listener for master's health enquiry", () => {
      const { attach, copacetic, cluster } = mockForCluster({
        isMaster: false,
        worker: {id: 1}
      })

      const {clusterMessages} = attach(copacetic)

      cluster.isMaster = true

      return new Promise((resolve, reject) => {
        try {
          clusterMessages.send(`${constants.EVENT_NAMES.MASTER_ASKING_HEALTH}1`, {}, health => {
            try {
              assert.isDefined(health)
              assert.isDefined(health.isHealthy)
              assert.isDefined(health.dependencies)
              resolve()
            } catch (e) {
              reject(e)
            }
          })
        } catch (e) {
          reject(e)
        }
      })
    })
  })
})
