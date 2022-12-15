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
  await db.createTable('reviews', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    revieweeEmail: {
      type: 'string',
      length: 256,
      notNull: true
    },
    reviewerEmail: {
      type: 'string',
      length: 256,
      notNull: true
    },
    rating: {
      type: 'int',
      notNull: true
    },
    comment: {
      type: 'string',
      length: 1024,
      notNull: true
    }
  })
}

exports.down = async db => {
  await db.dropTable('reviews')
}

exports._meta = {
  version: 1
}
