/**
 * @constant {Object}
 * @property {String} HARD - your service cannot function when a hard dependency is unavailable
 * @property {String} SOFT - your service can still run, even if this dependency is unavailable
 */
module.exports = Object.freeze({
  HARD: 'HARD',
  SOFT: 'SOFT'
})
