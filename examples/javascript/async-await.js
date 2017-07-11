const Copacetic = require('@fresh8/copacetic')

const copacetic = Copacetic('my-service', false)

copacetic.registerDependency({
  name: 'my-dependency',
  strategy: {
    type: 'http'
  }
})

async bootstrap() {
  let success = false

  try {
    const res = await copacetic.check({ name: 'my-dependency' })
    success = true
    console.log(`${res.name} is healthy!`)
  } catch(e) {
    console.log(e)
  }

  if (success) {
    // all is well
  } else {
    // handle degraded state :(
  }
}
