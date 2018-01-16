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
})
