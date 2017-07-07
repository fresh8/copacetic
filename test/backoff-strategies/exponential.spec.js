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
    let backoff

    const mockResolve = () => new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), 1)
    })

    const mockReject = () => new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('failed')), 1)
    })

    beforeEach(() => {
      backoff = exponentialBackoff({ multiplier: 1 })
    })

    it('should return a promise', () => {
      expect(backoff.execute({ func: mockResolve }).then).to.be.a('function')
    })

    it('should resolve', () => {
      backoff
        .execute({ func: mockResolve })
        .then(r => expect(r).to.equal(true))
    })

    it('should reject', () => {
      backoff
        .execute({ func: mockReject })
        .catch(err => expect(err.message).to.equal('failed'))
    })

    it('should backoff 3 times', () => {
      let counter = 0

      const _mockReject = () => new Promise((resolve, reject) => {
        counter += 1
        setTimeout(() => reject(new Error('failed')), 1)
      })

      backoff
        .execute({ func: _mockReject, failAfter: 3 })
        .catch(() => {
          expect(counter).to.equal(3)
        })
    })

    it('should increase backoff time indefinitely if their is no max delay', () => {
      const _backoff = exponentialBackoff({ multiplier: 1 })

      _backoff
        .execute({ func: mockReject, failAfter: 5 })
        .catch(() => {
          expect(_backoff.lastDelay).to.equal(0)
        })
    })

    it('should not exceed the maximum delay', () => {
      const _backoff = exponentialBackoff({ multiplier: 1 })

      _backoff
        .execute({ func: mockReject, failAfter: 5, maxDelay: 4 })
        .catch(() => {
          expect(_backoff.lastDelay).to.equal(4)
        })
    })
  })
})
