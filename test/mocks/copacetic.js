module.exports = class CopaceticMock {
  constructor() {
    this.deps = []
  }

  registerDependency(opts) {
    this.deps.push(opts)
    return this
  }

  get healthInfo() {
    return this.deps.map(d => d.healthSummary)
  }
}
