# platziverse-agent

## Usage

```js
const PlatziverseAgent= require('platziverse-agent')

const agent = new PlatziverseAgent({
    name: 'myapp',
    interval: 2000,
    username: 'admin',
    
})

agent.addMetric('rss', function getRss () {
    return process.memoryUsage().rss
})

agent.addMetric('promiseMetric', function getRandomPromise () {
    return Promise.resolve(Math.random())
})

agent.addMetric('callbackMetric', function getRandomCallback (callback) {
    setTimeout(() => {
        callback(null, Math.random())
    }, 1000)
})


agent.connect()

// Agent only
agent.on('connected', handler)
agent.on('disconnected', handler)
agent.on('message', handler)

// Other agents
agent.on('agent/message', handler)
agent.on('agent/connected', handler)
agent.on('agent/disconnected', handler)

function handler (payload) {
    console.log(payload)
}

setTimeout(() => agent.disconnect(), 2000)
```