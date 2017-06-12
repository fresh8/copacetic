const expect = require('chai').expect
const noop = require('node-noop').noop

const CodependencyMock = require('../../mocks/codependency')
const Injector = require('../../../lib/util/injector')
const HealthFactoryProvider = require('../../../lib/health-strategies/providers').HealthFactoryProvider

describe('HealthFactoryProvider', () => {
  const injector = Injector(CodependencyMock({
    'node-fetch': noop,
    'mongodb': noop
  }))

  it('should export a function', () => {
    expect(HealthFactoryProvider).to.be.a('function')
  })

  it('should return a configurable factory', () => {
    expect(HealthFactoryProvider(injector)).to.be.a('function')
  })

  it('should return a http strategy', () => {
    const httpStrategy = HealthFactoryProvider(injector)({ type: 'http' })

    expect(httpStrategy.check).to.be.a('function')
    expect(httpStrategy.httpAdapter.request).to.be.a('function')
  })

  it('should return a mongodb strategy', () => {
    const mongoStrategy = HealthFactoryProvider(injector)({ type: 'mongodb' })

    expect(mongoStrategy.check).to.be.a('function')
    expect(mongoStrategy.mongoAdapter.connect).to.be.a('function')
  })
})
