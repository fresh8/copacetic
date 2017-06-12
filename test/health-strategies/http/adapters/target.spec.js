const expect = require('chai').expect

const HttpTarget = require('../../../../lib/health-strategies/http/adapters/target')

describe('http target', () => {
  const target = new HttpTarget()

  it('should be have a request method', () => {
    expect(target.request).to.be.a('function')
  })

  describe('success()', () => {
    it('should return true', () => {
      expect(target.success({ status: 200 })).to.equal(true)
      expect(target.success({ status: 299 })).to.equal(true)
    })

    it('should return false', () => {
      expect(target.success({ status: 100 })).to.equal(false)
      expect(target.success({ status: 301 })).to.equal(false)
    })
  })

  describe('redirection()', () => {
    it('should return true', () => {
      expect(target.redirection({ status: 300 })).to.equal(true)
      expect(target.redirection({ status: 399 })).to.equal(true)
    })

    it('should return false', () => {
      expect(target.redirection({ status: 200 })).to.equal(false)
      expect(target.redirection({ status: 401 })).to.equal(false)
    })
  })

  describe('clientErr()', () => {
    it('should return true', () => {
      expect(target.clientErr({ status: 400 })).to.equal(true)
      expect(target.clientErr({ status: 403 })).to.equal(true)
    })

    it('should return false', () => {
      expect(target.clientErr({ status: 500 })).to.equal(false)
      expect(target.clientErr({ status: 301 })).to.equal(false)
    })
  })
})
