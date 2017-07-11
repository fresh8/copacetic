const expect = require('chai').expect

const promiseAllSilent = require('../../lib/util').promiseAllSilent

describe('promiseAllSilent', () => {
  const a = new Promise((resolve, reject) => {
    setTimeout(() => resolve({ success: true }), 10)
  })
  const b = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error()), 10)
  })

  it('should export a function', () => {
    expect(promiseAllSilent).to.be.a('function')
  })

  it('should handle rejection', () => {
    return promiseAllSilent([a, b])
      .then((res) => {
        expect(res[0].success).to.equal(true)
        expect(res[1]).to.be.a('error')
      })
  })
})
