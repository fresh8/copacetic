const expect = require('chai').expect
const noop = require('node-noop').noop

const CodependencyMock = require('../../mocks/codependency')
const Injector = require('../../../lib/util/injector')
const AdapterFactoryProvider = require('../../../lib/health-strategies/providers').AdapterFactoryProvider

describe('AdapterFactoryProvider', () => {
  const injector = Injector(CodependencyMock({
    aClient: () => 'a client',
    bClient: () => 'b client'
  }))

  const adapters = {
    aClient: (impl) => impl(),
    bClient: (impl) => impl()
  }

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
