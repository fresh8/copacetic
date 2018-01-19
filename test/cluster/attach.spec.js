const { assert, expect } = require('chai')

const copaceticMock = require('../mocks/copacetic')
const injectorFactory = require('../../lib/util/injector')
const makeClusterMessageMock = require('../mocks/cluster-message')
const makeAttach = require('../../lib/cluster/attach')

function mockForCluster(cluster) {
  const modules = {
    cluster,
    'cluster-messages': makeClusterMessageMock(cluster)
  }

  const injector = injectorFactory((name) => {
    return modules[name]
  })
  return makeAttach(injector)
}

describe('Cluster Attach', () => {
  it("exposes a factory", () => {
    assert.isDefined(makeAttach)
    expect(makeAttach).to.be.a('function')
  })

  it("builds a function", () => {
    expect(mockForCluster({})).to.be.a('function')
  })

  describe("master", () => {
    it("should automatically add workers as dependencies", () => {
      const copacetic = new copaceticMock()
      const attach = mockForCluster({
        isMaster: true,
        workers: {1: {id: 1, healthSummary: "healthy"}, 2: {id: 2, healthSummary: "not healthy"}}
      })
      attach(copacetic)
      const health = copacetic.healthInfo
      expect(health.length).to.equal(2)
    })

    //TODO test it reacts to 'fork' events as well as disconnect/exit/others?
  })
})

