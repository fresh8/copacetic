const expect = require('chai').expect
const noop = require('node-noop').noop

describe('StrategyFactoryProvider', () => {
  let injector
  let adapters
  let StrategyFactoryProvider
  let AdapterFactoryProvider
  let AdapterFactory

  class NotAStrategy {
    constructor (adapter, opts) {
      this.adapter = adapter
      this.opts = opts
    }
  }

  const NotAStrategyFactory = (adapter, opts) => new NotAStrategy(adapter, opts)

  before(() => {
    const CodependencyMock = require('../../mocks/codependency')
    const Injector = require('../../../lib/util/injector')
    StrategyFactoryProvider = require('../../../lib/health-strategies/providers')
      .StrategyFactoryProvider
    AdapterFactoryProvider = require('../../../lib/health-strategies/providers')
      .AdapterFactoryProvider

    injector = Injector(CodependencyMock({
      'node-fetch': noop
    }))
    adapters = {
      'node-fetch': () => ({ request: noop })
    }
    AdapterFactory = AdapterFactoryProvider(adapters)
  })

  it('should export a function', () => {
    expect(StrategyFactoryProvider).to.be.a('function')
  })

  it('should return a configurable factory', () => {
    expect(StrategyFactoryProvider(injector)).to.be.a('function')
  })

  it('should create a new strategy', () => {
    const StrategyFactory = StrategyFactoryProvider(NotAStrategyFactory, AdapterFactory)(injector)

    const strategy = StrategyFactory()
    expect(strategy instanceof NotAStrategy).to.equal(true)
    expect(strategy.adapter).to.be.a('object')
    expect(strategy.adapter.request).to.be.a('function')

    const strategyWithCustomAdapter = StrategyFactory({ request: noop, other: noop })
    expect(strategyWithCustomAdapter.adapter.request).to.be.a('function')
    expect(strategyWithCustomAdapter.adapter.other).to.be.a('function')

    const strategyWithConfig = StrategyFactory(null, { someProp: 'memes' })
    expect(strategyWithConfig.opts.someProp).to.equal('memes')
  })
})
