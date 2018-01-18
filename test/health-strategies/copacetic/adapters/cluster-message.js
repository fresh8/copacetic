const { expect, assert } = require('chai')

const clusterMessageMock = require('../../../mocks/cluster-message')

const CodependencyMock = require('../../../mocks/codependency')
const Injector = require('../../../../lib/util/injector')
const CopaceticStrategyFactory = require('../../../../lib/health-strategies/copacetic')

function mockForCluster(clusterMock, workerId) {
  return CopaceticStrategyFactory(
    Injector(CodependencyMock({
      clusterMessage: clusterMessageMock(clusterMock)
    }))
  )()
}

describe("Cluster Message Adapter", () => {
  describe("getHealth", () => {
    it("Has a getHealth function", () => {
      const strategy = mockForCluster({
        isMaster: true,
        workers: [ { onGetHealth() { } } ]
      })

      assert.isDefined(strategy.adapter.getHealth)
    })

    it("Returns a promise", () => {
      const strategy = mockForCluster({
        isMaster: true,
        workers: [ { onGetHealth() { } } ]
      })

      assert.isDefined(strategy.adapter.getHealth)
      expect(strategy.adapter.getHealth()).to.be.a.Promise
    })


    it("Throws if no worker information given", () => {
      //this is because cluster-message currently has no way of contacting a single worker, if no worker id were to be provided the message would essentially be replied to by all workers
      const strategy = mockForCluster({
        isMaster: true,
        workers: [ { onGetHealth() { } } ]
      })

      return new Promise((resolve, reject) => {
        strategy.adapter.getHealth()
          .then(reject)
          .catch((e) => {
            try {
              expect(e.message).to.contain("Missing worker id")
            } catch(e) {
              return reject(e)
            }
            resolve()
          })
      })
    })

    it("Is able to request the health of a child process", () => {
      const strategy = mockForCluster({
        isMaster: true,
        workers: [
          {
            id: 1,
            onGetHealth1() {
              return { isHealthy: true }
            }
          }
        ]
      })

      return strategy.adapter.getHealth({id: 1})
        .then(res => expect(res.isHealthy).to.equal(true))
    })

    it("Is able to request the health of the correct worker amongst multiple", () => {
      const strategy = mockForCluster({
        isMaster: true,
        workers: [
          {
            id: 1,
            onGetHealth1() {
              return { name: 1, isHealthy: true }
            }
          },
          {
            id: 2,
            onGetHealth2() {
              return { name: 2, isHealthy: false }
            }
          }
        ]
      })

      return strategy.adapter.getHealth({id: 2})
        .then((res) => {
          expect(res.isHealthy).to.equal(false)
          expect(res.name).to.equal(2)
        })
    })
  })
})
