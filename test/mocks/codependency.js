module.exports = (mockModules) => {
  return (moduleName, opts) => {
    const resolved = mockModules[moduleName]

    if (!resolved && !opts.options) {
      throw new Error(`Tried to resolve ${moduleName} but was undefined`)
    }

    return resolved
  }
}
