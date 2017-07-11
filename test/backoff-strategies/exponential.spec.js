const expect = require('chai').expect

const exponentialBackoff = require('../../lib/backoff-strategies').ExponentialBackoffStrategy

describe('ExponentialBackoffStrategy', () => {
  let backoff

  beforeEach(() => {
    backoff = exponentialBackoff({ multiplier: 1 })
  })
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
    const mockResolve = () => new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), 1)
    })

    const mockReject = () => new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('failed')), 1)
    })

    it('should return a promise', () => {
      expect(backoff.execute({ func: mockResolve }).then).to.be.a('function')
    })

    it('should resolve', () => {
      return backoff
        .execute({ func: mockResolve })
        .then(r => expect(r).to.equal(true))
    })

    it('should reject', () => {
      return backoff
        .execute({ func: mockReject })
        .catch(err => expect(err.message).to.equal('failed'))
    })

    it('should backoff 3 times', () => {
      let counter = 0

      const _mockReject = () => new Promise((resolve, reject) => {
        counter += 1
        setTimeout(() => reject(new Error('failed')), 1)
      })

      return backoff
        .execute({ func: _mockReject, retries: 3 })
        .catch(() => {
          expect(counter).to.equal(3)
        })
    })
  })

  describe('scheduleNextTry', () => {
    it('should not return a value higher than maxDelay', () => {
      expect(backoff._scheduleNextTry(5, 32)).to.equal(32)
      expect(backoff._scheduleNextTry(10, 32)).to.equal(32)
    })

    it('should handle negative input', () => {
      expect(backoff._scheduleNextTry(5, -1)).to.equal(32)
    })

    it('should not limit the delay when maxDelay is undefined', () => {
      expect(backoff._scheduleNextTry(1)).to.equal(2)
      expect(backoff._scheduleNextTry(2)).to.equal(4)
      expect(backoff._scheduleNextTry(16)).to.equal(65536)
    })
  })
})
