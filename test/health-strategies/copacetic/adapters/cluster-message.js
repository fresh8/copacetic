const { expect, assert } = require('chai')

const clusterMessageMock = require('../../../mocks/cluster-message')

const CodependencyMock = require('../../../mocks/codependency')
const Injector = require('../../../../lib/util/injector')
const CopaceticStrategyFactory = require('../../../../lib/health-strategies/copacetic')

function mockForCluster(clusterMock) {
  return CopaceticStrategyFactory(
    Injector(CodependencyMock({
      clusterMessage: clusterMessageMock(clusterMock)
    }))
  )()
}

describe("Cluster Message Adapter", () => {
  it("Is able to request the health of a child process", () => {
    const strategy = mockForCluster({
      isMaster: true,
      workers: [
        {
          onGetHealth() {
            return { isHealthy: true }
          }
        }
      ]
    })

    assert.isDefined(strategy.adapter.getHealth)
    const pendingHealth = strategy.adapter.getHealth()
    expect(pendingHealth).to.be.a.Promise
    return pendingHealth
      .then(res => expect(res.isHealthy).to.equal(true))
  })
  //TODO don't forget to test having multiple workers to doublecheck it copes with multiple callback?
})
