const expect = require('chai').expect

const HttpAdapter = require('../../../../lib/health-strategies/http/adapters/adapter')

describe('http adapter', () => {
  const adapter = new HttpAdapter()

  describe('success()', () => {
    it('should return true', () => {
      expect(adapter.success({ status: 200 })).to.equal(true)
      expect(adapter.success({ status: 299 })).to.equal(true)
    })

    it('should return false', () => {
      expect(adapter.success({ status: 100 })).to.equal(false)
      expect(adapter.success({ status: 301 })).to.equal(false)
    })
  })

  describe('redirection()', () => {
    it('should return true', () => {
      expect(adapter.redirection({ status: 300 })).to.equal(true)
      expect(adapter.redirection({ status: 399 })).to.equal(true)
    })

    it('should return false', () => {
      expect(adapter.redirection({ status: 200 })).to.equal(false)
      expect(adapter.redirection({ status: 401 })).to.equal(false)
    })
  })

  describe('clientErr()', () => {
    it('should return true', () => {
      expect(adapter.clientErr({ status: 400 })).to.equal(true)
      expect(adapter.clientErr({ status: 403 })).to.equal(true)
    })

    it('should return false', () => {
      expect(adapter.clientErr({ status: 500 })).to.equal(false)
      expect(adapter.clientErr({ status: 301 })).to.equal(false)
    })
  })
})
