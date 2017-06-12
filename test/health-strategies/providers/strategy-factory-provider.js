const expect = require('chai').expect
const noop = require('node-noop').noop

const CodependencyMock = require('../../mocks/codependency')
const Injector = require('../../../lib/util/injector')
const StrategyFactoryProvider = require('../../../lib/health-strategies/providers').StrategyFactoryProvider
const AdapterFactoryProvider = require('../../../lib/health-strategies/providers').AdapterFactoryProvider

describe('HealthFactoryProvider', () => {
  class NotAStrategy {
    constructor (adapter, opts) {
      this.adapter = adapter
      this.opts = opts
    }
  }

  const injector = Injector(CodependencyMock({
    'node-fetch': noop,
  }))

  const adapters = {
    'node-fetch': () => ({ request : noop }),
  }

  const AdapterFactory = AdapterFactoryProvider(adapters)

  it('should export a function', () => {
    expect(StrategyFactoryProvider).to.be.a('function')
  })

  it('should return a configurable factory', () => {
    expect(StrategyFactoryProvider(injector)).to.be.a('function')
  })

  it('should create a new strategy', () => {
    const StrategyFactory = StrategyFactoryProvider(NotAStrategy, AdapterFactory)(injector)

    const strategy = StrategyFactory()
    expect(strategy instanceof NotAStrategy).to.equal(true)
    expect(strategy.adapter).to.be.a('object')
    expect(strategy.adapter.request).to.be.a('function')

    const strategyWithCustomAdapter = StrategyFactory({ request : noop, other: noop })
    expect(strategyWithCustomAdapter.adapter.request).to.be.a('function')
    expect(strategyWithCustomAdapter.adapter.other).to.be.a('function')

    const strategyWithConfig = StrategyFactory(null, { someProp: 'memes' })
    expect(strategyWithConfig.opts.someProp).to.equal('memes')
  })
})
