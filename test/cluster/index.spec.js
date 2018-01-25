const { assert, expect } = require('chai')

const clusterFactory = require('../../lib/cluster')
const injectorFactory = require('../../lib/util/injector')

const makeClusterMock = require('../mocks/cluster')
const makeClusterMessageMock = require('../mocks/cluster-message')

describe('cluster', () => {
  it('is a factory function', () => {
    assert.isDefined(clusterFactory)
    expect(clusterFactory).to.be.a('function')
  })

  const mockedCluster = makeClusterMock({})
  const modules = {
    cluster: mockedCluster,
    'cluster-messages': makeClusterMessageMock(mockedCluster)
  }

  const injector = injectorFactory((name) => {
    return modules[name]
  })
  const cluster = clusterFactory(injector)
  it('exposes a function to handle being part of a cluster', () => {
    assert.isDefined(cluster.attach)
    expect(cluster.attach).to.be.a('function')
  })
})
