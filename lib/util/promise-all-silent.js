module.exports = (promises) => {
  return Promise.all(
    promises.map(p => p.catch(e => e))
  )
}
