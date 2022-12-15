/* eslint-disable space-before-function-paren */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable lines-between-class-members */
/* eslint-disable quotes */
let dbm = null;
let type = null; // eslint-disable-line no-unused-vars
let seed = null; // eslint-disable-line no-unused-vars

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function ({ dbmigrate }, seedLink) {
  dbm = dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async (db) => {
  // await db.dropTable("contactrating");
  await db.createTable("contactrating", {
    contact: {
      type: "string",
      length: 256,
      primaryKey: true,
    },
    rating: {
      type: "real",
      notNull: true,
    },
  });
};

exports.down = async (db) => {
  await db.dropTable("contactrating");
};

exports._meta = {
  version: 1,
};
