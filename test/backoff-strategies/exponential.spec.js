const expect = require('chai').expect

const exponentialBackoff = require('../../lib/backoff-strategies').ExponentialBackoffStrategy

describe('ExponentialBackoffStrategy', () => {
  it('should export a function', () => {
    expect(exponentialBackoff).to.be.a('function')
  })

  it('should back off exponentially', () => {
    const backoff = exponentialBackoff()

    expect(backoff._intervalFunc(1)).to.equal(2)
    expect(backoff._intervalFunc(2)).to.equal(4)
    expect(backoff._intervalFunc(3)).to.equal(8)
  })

  it('should use a multiplier if provided', () => {
    const backoff = exponentialBackoff({ multiplier: 100 })

    expect(backoff._intervalFunc(1)).to.equal(200)
    expect(backoff._intervalFunc(2)).to.equal(400)
    expect(backoff._intervalFunc(3)).to.equal(800)
  })

  describe('execute', () => {
    const backoff = exponentialBackoff({ multiplier: 100 })

    const mockResolve = () => new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), 100)
    })

    const mockReject = () => new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error()), 100)
    })

    it('should return a promise', () => {
      expect(backoff.execute(mockResolve).then).to.be.a('function')
    })

    it('should resolve', () => {
      backoff
        .execute(mockResolve)
        .then(r => expect(r).to.equal(true))
    })

    it('should reject', () => {
      backoff
        .execute(mockReject)
        .catch(r => expect(r).to.equal(Error))
    })
  })
})
