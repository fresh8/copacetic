const { expect, assert } = require('chai')

const HealthStrategy = require('../../../lib/health-strategies/strategy')
const CopaceticStrategy = require('../../../lib/health-strategies/copacetic/strategy')

describe("Copacetic Strategy", () => {
  it("should export a function", () => {
    expect(CopaceticStrategy).to.be.a.Function
  })

  it("should produce a valid HealthStrategy", () => {
    expect(CopaceticStrategy()).to.be.an.instanceOf(HealthStrategy)
  })

  it("should implement cleanup", () => {
    const strategy = CopaceticStrategy()
    expect(strategy.cleanup).to.not.throw()
  })

  it("Succeeds on healthy dependency", () => {
    const strategy = CopaceticStrategy({
      checkHealth: () => Promise.resolve({ isHealthy: true })
    })
    const health = strategy.check()
    expect(health).to.be.a.Promise
    return health
      .then((res) => {
        expect(res.isHealthy).to.equal(true)
      })
  })

  it("Reports unhealthy", () => { //
    const strategy = CopaceticStrategy({
      checkHealth: () => Promise.resolve({ isHealthy: false })
    })
    return strategy.check()
      .then((res) => {
        expect(res.isHealthy).to.equal(false)
      })
  })

  it("passes on worker information to the adapter", () => {
    const strategy = CopaceticStrategy({
      checkHealth: (context) => Promise.resolve(context)
    }, { nodeContext: { papers: 'please'}})
    return strategy.check()
      .then((res) => {
        expect(res.papers).to.equal('please')
      })
  })

  describe("init", () => {
    it("calls the adapter init function", () => {
      const strategy = CopaceticStrategy({
        init() {this.hasInit = true}
      })
      strategy.init()
      expect(strategy.adapter.hasInit).to.equal(true)
    })

    it("passes on the timeout parameter", () => {
      const strategy = CopaceticStrategy({
        init(opts) {this.time = opts.timeout}
      })
      strategy.init()
      assert.isDefined(strategy.adapter.time)
    })

    it("does not crash if the adapter has no init function", () => {
      const strategy = CopaceticStrategy({ })
      expect(strategy.init.bind(strategy)).to.not.throw()
    })

    it("only init once", () => {
      const strategy = CopaceticStrategy({
        hasInit: 0,
        init() {this.hasInit++}
      })
      strategy.init()
      strategy.init()
      expect(strategy.adapter.hasInit).to.equal(1)
    })
  })

  describe("areYouOk", () => {
    const strategy = CopaceticStrategy({
      checkHealth: () => Promise.resolve({ isHealthy: false })
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

  describe("Health Summary", () => {
    const strategy = CopaceticStrategy({
      checkHealth: () => Promise.resolve({ isHealthy: false })
    })

    it("should be defined", () => {
      assert.isDefined(strategy.improveSummary)
      expect(strategy.improveSummary).to.be.a.Function
    })

    it("enhances the health summary with dependencies status", () => {
      const baseSummary = { healthy: true }
      const checkResult = { dependencies: [ { name: 'database' }] }
      strategy.improveSummary(baseSummary, checkResult)
      assert.isDefined(baseSummary.dependencies)
      expect(baseSummary.dependencies).to.deep.equal(checkResult.dependencies)
    })
  })
})
