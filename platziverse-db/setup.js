'use strict'

const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./')

const prompt = inquirer.createPromptModule()

async function setup () {
  const arg = process.argv.slice(2).shift()

  if (arg) {
    if (arg === '--y') {
      await configDatabase()
    } else {
      console.error(`${chalk.red('[Invalid argument]')} - "${arg}" is not a valid argument`)
      console.error('If you want to bypass the question, just enter --y')
      process.exit(1)
    }
  } else {
    const answers = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your database, are you sure?'
      }
    ])

    if (!answers.setup) {
      return console.log('Nothing happened! :)')
    }

    await configDatabase()
  }
}

async function configDatabase () {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    loggin: s => debug(s),
    setup: true
  }
  await db(config).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[Fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
