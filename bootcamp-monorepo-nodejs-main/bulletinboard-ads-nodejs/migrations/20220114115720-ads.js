let dbm = null
let type = null // eslint-disable-line no-unused-vars
let seed = null // eslint-disable-line no-unused-vars

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function ({ dbmigrate }, seedLink) {
  dbm = dbmigrate
  type = dbm.dataType
  seed = seedLink
}

exports.up = async db => {
  await db.createTable('ads', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: 'string',
      length: 256,
      notNull: true
    },
    contact: {
      type: 'string',
      length: 256,
      notNull: true
    },
    price: {
      type: 'real',
      notNull: true
    },
    currency: {
      type: 'string',
      length: 256,
      notNull: true
    }
  })
}

exports.down = async db => {
  await db.dropTable('ads')
}

exports._meta = {
  version: 1
}
