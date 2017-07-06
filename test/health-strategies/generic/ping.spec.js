const expect = require('chai').expect

describe('ping strategy', () => {
  let strategy

  before(() => {
    const PingStrategy = require('../../../lib/health-strategies/generic').PingStrategy

    strategy = new PingStrategy({
      ping: () => 'ping',
      close: () => 'close'
    })
  })

  describe('check', () => {
    it('should ping the adapter', () => {
      expect(strategy.check()).to.equal('ping')
    })
  })

  describe('cleanup', () => {
    it('should close the adapter\'s connection', () => {
      expect(strategy.cleanup()).to.equal('close')
    })
  })
})
