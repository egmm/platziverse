'use strict'

const debug = require('debug')('platziverse:mqtt')
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
// const redis = require('redis')
const chalk = require('chalk')
const db = require('platziverse-db')

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

aedes.on('client', client => {
  debug(`Client Connected: ${client.id}`)
})

aedes.on('clientdisconnect', client => {
  debug(`client disconnected: ${client.id}`)
})

aedes.on('publish', (packet, client) => {
  debug(`Received: ${packet.topic}`)
  debug(`Payload: ${packet.payload}`)
})

aedes.on('error', handleFatalError)

server.listen(1883, async () => {
  const services = await db(dbConfig).catch(handleFatalError)
  Agent = services.Agent
  Metric = services.Metric
  debug(`${chalk.green('[platziverse-mqtt]')} server is running`)
})

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
