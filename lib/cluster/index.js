module.exports = (injector) => {
  return {
    attach: require('./attach')(injector)
  }
}
