const expect = require('chai').expect

const promiseSeriesSilent = require('../../lib/util').promiseSeriesSilent

describe('promiseSeriesSilent', () => {
  let counter = 0

  /* eslint-disable no-plusplus */
  const a = new Promise((resolve, reject) => {
    setTimeout(() => resolve(++counter), 100)
  })
  const b = new Promise((resolve, reject) => {
    setTimeout(() => resolve(++counter), 200)
  })
  const c = new Promise((resolve, reject) => {
    setTimeout(() => resolve(++counter), 300)
  })
  const d = new Promise((resolve, reject, rej) => {
    setTimeout(() => reject(new Error()), 50)
  })
  /* eslint-enable no-plusplus */

  it('should export a function', () => {
    expect(promiseSeriesSilent).to.be.a('function')
  })

  it('should call a set of promises in series', () => {
    return promiseSeriesSilent([a, c, b])
      .then((res) => {
        expect(res[0]).to.equal(1)
        expect(res[1]).to.equal(3)
        expect(res[2]).to.equal(2)
      })
  })

  it('should handle rejections gracefully', () => {
    return promiseSeriesSilent([a, d, b, c])
      .then((res) => {
        expect(res[0]).to.equal(1)
        expect(res[1]).to.be.a('error')
        expect(res[2]).to.equal(2)
        expect(res[3]).to.equal(3)
      })
  })
})
