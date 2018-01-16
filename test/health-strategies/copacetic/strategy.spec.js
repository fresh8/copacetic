const { expect } = require('chai')

const HealthStrategy = require('../../../lib/health-strategies/strategy')
const CopaceticStrategy = require('../../../lib/health-strategies/copacetic/strategy')

describe("Copacetic Strategy", () => {
  it("should export a function", () => {
    expect(CopaceticStrategy).to.be.a.Function
  })

  it("should produce a valid HealthStrategy", () => {
    expect(new CopaceticStrategy()).to.be.an.instanceOf(HealthStrategy)
  })

  it("should implement cleanup", () => {
    const strategy = new CopaceticStrategy()
    expect(strategy.cleanup).to.not.throw()
  })

  it("Succeeds on healthy dependency", () => {
    const strategy = new CopaceticStrategy({
      getHealth: () => Promise.resolve({ isHealthy: true })
    })
    const health = strategy.check()
    expect(health).to.be.a.Promise
    return health //let mocha itself realise it worked fine as promise should resolve
  })

  it("Throws on unhealthy dependency", () => {
    const strategy = new CopaceticStrategy({
      getHealth: () => Promise.resolve({ isHealthy: false })
    })
    return strategy.check()
      .catch((e) => {
        expect(e.message).to.contain("reported itself as not healthy")
        return Promise.resolve(true)
      })
  })
  //TODO test it considers unhealthy on timeout
})
