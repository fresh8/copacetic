const expect = require('chai').expect
const noop = require('node-noop').noop

describe('AdapterFactoryProvider', () => {
  let injector
  let adapters
  let AdapterFactoryProvider

  before(() => {
    const CodependencyMock = require('../../mocks/codependency')
    const Injector = require('../../../lib/util/injector')
    AdapterFactoryProvider = require('../../../lib/health-strategies/providers')
      .AdapterFactoryProvider

    injector = Injector(CodependencyMock({
      aClient: () => 'a client',
      bClient: () => 'b client'
    }))

    adapters = {
      aClient: (impl) => impl(),
      bClient: (impl) => impl()
    }
  })

  it('should export a function', () => {
    expect(AdapterFactoryProvider).to.be.a('function')
  })

  it('should return a configurable factory', () => {
    expect(AdapterFactoryProvider(adapters)).to.be.a('function')
  })

  it('should provide an adapter for a client', () => {
    const factory = AdapterFactoryProvider(adapters)(injector)
    expect(factory()).to.equal('a client')
  })

  it('should throw an error when there are no matching clients', () => {
    const factory = AdapterFactoryProvider({
      cClient: noop
    })(injector)
    expect(() => factory()).to.throw()
  })
})
