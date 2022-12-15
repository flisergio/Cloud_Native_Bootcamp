import dbmigrate from 'db-migrate'
import config from '../util/config.js'

const migrate = async () => {
  try {
    const [action, ...args] = process.argv.slice(2)

    const dbm = dbmigrate.getInstance(true, {
      env: 'default',
      config: {
        default: {
          driver: 'pg',
          ...config.postgres
        }
      }
    })

    await dbm[action](...args)
  } catch ({ stack }) {
    console.error(stack)
    process.exit(1)
  }
}

migrate()
