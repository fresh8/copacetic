const expect = require('chai').expect

const promiseAllSilent = require('../../lib/util').promiseAllSilent

describe('promiseAllSilent', () => {
  const a = new Promise((resolve, reject) => {
    setTimeout(() => resolve({ success: true }), 300)
  })
  const b = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error()), 50)
  })

  it('should export a function', () => {
    expect(promiseAllSilent).to.be.a('function')
  })

  it('should handle rejection', () => {
    promiseAllSilent([a, b])
      .then((res) => {
        expect(res[0].success).to.equal(true)
        expect(res[1].success).to.equal(Error)
      })
  })
})
