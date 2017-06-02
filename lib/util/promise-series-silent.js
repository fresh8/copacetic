const precond = require('precond')

module.exports = (promises) => {
  precond.checkIsArray(
    promises,
    'promiseSeriesSilent expected an array of promises'
  )

  return promises
    // continiue the chain, regardless of errors
    .map(p => p.catch(e => e))
    .reduce((chain, promise) => {
      return chain.then(r => promise.then(Array.prototype.concat.bind(r)))
    }, Promise.resolve([]))
}
