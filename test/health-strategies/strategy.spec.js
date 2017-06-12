const expect = require('chai').expect

const Strategy = require('../../lib/health-strategies/strategy')

describe('strategy', () => {
  class SubStrat extends Strategy {}

  const instance = new SubStrat()

  it('should not be constructed directly', () => {
    expect(() => new Strategy()).to.throw()
  })

  it('should provide a timeout of 1 second by default', () => {
    expect(instance.timeout).to.equal('1 second')
  })

  describe('check', () => {
    it('should be implemented', () => {
      expect(instance.check).to.throw()
    })
  })

  describe('cleanup', () => {
    it('should be implemented', () => {
      expect(instance.cleanup).to.throw()
    })
  })
})
