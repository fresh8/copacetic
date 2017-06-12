module.exports.promiseAllSilent = require('./promise-all-silent')

module.exports.promiseSeriesSilent = require('./promise-series-silent')

module.exports.Injector = (requirePeer) => {
  return require('./injector')(requirePeer)
}
