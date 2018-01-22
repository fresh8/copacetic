module.exports = {
  EVENT_NAMES: [
    "ASK_MASTER_HEALTH",
    "MASTER_ASKING_HEALTH"
  ].reduce((memo, name) => {
    memo[name] = name
    return memo
  }, {})
}
