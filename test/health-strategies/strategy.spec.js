const expect = require('chai').expect

const Strategy = require('../../lib/health-strategies/strategy')

describe('strategy', () => {
  const strategy = new Strategy()

  it('should provide a timeout of 1 second by default', () => {
    expect(strategy.timeout).to.equal('1 second')
  })

  describe('check', () => {
    it('should be implemented', () => {
      expect(strategy.check).to.throw()
    })
  })

  describe('cleanup', () => {
    it('should be implemented', () => {
      expect(strategy.cleanup).to.throw()
    })
  })
})
