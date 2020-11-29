'use strict'

const debug = require('debug')('platziverse:mqtt')
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
// const redis = require('redis')
const chalk = require('chalk')
const db = require('platziverse-db')

const { parsePayload } = require('./utils')

// const persistence = {
//   type: 'redis',
//   redis,
//   return_buffers: true
// }

// const settings = {
//   port: 1883,
//   persistence
// }

// Abstract this object to reuse in other modules
const dbConfig = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  loggin: s => debug(s)
}

let Agent, Metric
const clients = new Map()

aedes.on('client', client => {
  debug(`Client Connected: ${client.id}`)
  clients.set(client.id, null)
})

aedes.on('clientdisconnect', async client => {
  debug(`client disconnected: ${client.id}`)
  const agent = clients.get(client.id)

  if (agent) {
    agent.connected = false
    try {
      await Agent.createOrUpdate(agent)
    } catch (err) {
      return handleError(err)
    }

    clients.delete(client.id)

    aedes.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })

    debug(`Client (${client.id}) associated to Agent (${agent.uuid}) maked as disconnected`)
  }
})

aedes.on('publish', async (packet, client) => {
  debug(`Received: ${packet.topic}`)

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`)
      break

    case 'agent/message':
      await handleMessageReceived(packet.payload, client)
      break

    default:
      break
  }

  debug(`Payload: ${packet.payload}`)
})

aedes.on('error', handleFatalError)

server.listen(1883, async () => {
  const services = await db(dbConfig).catch(handleFatalError)
  Agent = services.Agent
  Metric = services.Metric
  debug(`${chalk.green('[platziverse-mqtt]')} server is running`)
})

async function handleMessageReceived (rawPayload, client) {
  debug(`Payload: ${rawPayload}`)
  const payload = parsePayload(rawPayload)

  if (payload) {
    payload.agent.connected = true
    let agent
    try {
      agent = await Agent.createOrUpdate(payload.agent).catch(handleError)
    } catch (err) {
      return handleFatalError(err)
    }
    debug(`Agent ${agent.uuid} saved`)

    // Notify Agent is connected
    if (!clients.get(client.id)) {
      clients.set(client.id, agent)
      aedes.publish({
        topic: 'agent/connected',
        payload: JSON.stringify({
          agent: {
            uuid: agent.uuid,
            name: agent.name,
            hostname: agent.hostname,
            pid: agent.pid,
            connected: agent.connected
          }
        })
      })
    }

    // Store metrics
    for (const metric of payload.metrics) {
      let m

      try {
        m = await Metric.create(agent.uuid, metric)
      } catch (err) {
        return handleError(err)
      }
      debug(`Metric ${m.id} saved on agent ${agent.uuid}`)
    }
  }
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

function handleError (err) {
  console.error(`${chalk.red('[error]')} ${err.message}`)
  console.error(err.stack)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
