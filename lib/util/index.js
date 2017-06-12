module.exports.promiseAllSilent = require('./promise-all-silent')

module.exports.promiseSeriesSilent = require('./promise-series-silent')

module.exports.injector = (requirePeer) => {
  return require('./injector')(requirePeer)
}
