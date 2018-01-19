const { assert, expect } = require('chai')

const injectorFactory = require('../../lib/util/injector')
const makeAttach = require('../../lib/cluster/attach')
const makeCopacetic = require('../../lib/copacetic')
const makeClusterMock = require('../mocks/cluster')
const makeClusterMessageMock = require('../mocks/cluster-message')

function fakeAdapter(worker) {
  worker.cleanup = () => {} 
  return worker
}

function mockForCluster(cluster) {
  const mockedCluster = makeClusterMock(cluster)
  const modules = {
    cluster: mockedCluster,
    'cluster-messages': makeClusterMessageMock(cluster)
  }

  const injector = injectorFactory((name) => {
    return modules[name]
  })

  const copacetic = makeCopacetic(fakeAdapter)("Mocked")
  return { attach: makeAttach(injector), cluster: mockedCluster, copacetic }
}

describe('Cluster Attach', () => {
  it("exposes a factory", () => {
    assert.isDefined(makeAttach)
    expect(makeAttach).to.be.a('function')
  })

  it("builds a function", () => {
    expect(mockForCluster({}).attach).to.be.a('function')
  })

  describe("master", () => {
    it("should automatically add workers as dependencies", () => {
      const { attach, copacetic } = mockForCluster({
        isMaster: true,
        workers: [{id: 1, healthSummary: "healthy"}, {id: 2, healthSummary: "not healthy"}]
      })
      attach(copacetic)
      const health = copacetic.healthInfo
      expect(health.length).to.equal(2)
    })

    it("should automatically add new workers as they get ready", () => {
      const { attach, cluster, copacetic } = mockForCluster({ isMaster: true, workers: []})

      attach(copacetic)

      cluster.mockNewWorker({id: 1})
      expect(copacetic.healthInfo.length).to.equal(1)
    })

    it("shouldn't duplicate existing workers", () => {
      //this is in case the first loop on cluster.workers is finished processing before all of those workers emit the `online` event
      const { attach, cluster, copacetic } = mockForCluster({ isMaster: true, workers: []})

      attach(copacetic)

      cluster.mockNewWorker({id: 1})
      cluster.mockNewWorker({id: 1})
      expect(copacetic.healthInfo.length).to.equal(1)
    })

    it("should remove workers when they die", () => {
      const { attach, copacetic, cluster } = mockForCluster({
        isMaster: true,
        workers: [
          {id: 1, healthSummary: "healthy"},
          {id: 2, healthSummary: "not healthy"}
        ]
      })
      attach(copacetic)
      cluster.mockWorkerDeath(1)
      expect(copacetic.healthInfo.length).to.equal(1)
    })

    //TODO figure out how to test this and implement it.
    //it("should add an IPC listener to respond to workers asking health", () => {
    //  const { attach, copacetic, cluster } = mockForCluster({
    //    isMaster: true,
    //    workers: [
    //      {id: 1, healthSummary: "healthy"}
    //    ]
    //  })
    //})
  })

  //TODO isWorker and all associated events
})

