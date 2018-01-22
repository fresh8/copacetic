const { assert, expect } = require('chai')

const clusterFactory = require('../../lib/cluster')
const injectorFactory = require('../../lib/util/injector')

describe('cluster', () => {
  it('is a factory function', () => {
    assert.isDefined(clusterFactory)
    expect(clusterFactory).to.be.a('function')
  })

  const injector = injectorFactory((name) => {
    return {} // this would return cluster-messages and cluster but no need for the test below
  })
  const cluster = clusterFactory(injector)
  it('exposes a function to handle being part of a cluster', () => {
    assert.isDefined(cluster.attach)
    expect(cluster.attach).to.be.a('function')
  })
})
