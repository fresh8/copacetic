const expect = require('chai').expect

describe('ConnectThenPing', () => {
  const ConnectThenPingStrategy = require('../../../lib/health-strategies/generic')
    .ConnectThenPingStrategy

  const mockAdapter = () => ({
    isConnected: false,
    connect () {
      this.isConnected = true
      return 'connected'
    },
    ping () {
      return 'ping'
    },
    close () {
      this.isConnected = false
    }
  })

  describe('check', () => {
    let strategy

    before(() => {
      strategy = new ConnectThenPingStrategy(mockAdapter())
    })

    it('should connect to the adapter if disconnected', () => {
      expect(strategy.check('some-url')).to.equal('connected')
    })

    it('should ping the adapter if connected', () => {
      expect(strategy.check('some-url')).to.equal('ping')
    })
  })

  describe('cleanup', () => {
    it('should close the connection to the adapter', () => {
      const strategy = new ConnectThenPingStrategy(mockAdapter())

      expect(strategy.check('some-url')).to.equal('connected')
      strategy.cleanup()
      expect(strategy.adapter.isConnected).to.equal(false)
    })
  })
})
