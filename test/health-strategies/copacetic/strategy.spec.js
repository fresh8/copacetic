const { expect, assert } = require('chai')

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
    return health
      .then((res) => {
        expect(res.isHealthy).to.equal(true)
      })
  })

  it("Reports unhealthy", () => { //
    const strategy = new CopaceticStrategy({
      getHealth: () => Promise.resolve({ isHealthy: false })
    })
    return strategy.check()
      .then((res) => {
        expect(res.isHealthy).to.equal(false)
      })
  })

  describe("areYouOk", () => {
    const strategy = new CopaceticStrategy({
      getHealth: () => Promise.resolve({ isHealthy: false })
    })

    it("should be defined", () => {
      assert.isDefined(strategy.areYouOk)
      expect(strategy.areYouOk).to.be.a.Function
    })

    it("should report health correctly", () => {
      expect(strategy.areYouOk({isHealthy: false})).to.equal(false)
      expect(strategy.areYouOk({isHealthy: true})).to.equal(true)
    })
  })
  //TODO test it considers unhealthy on timeout
})
