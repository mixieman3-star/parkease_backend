'use strict';

const mongoose = require('mongoose');

// Builds a schema for a client-mirrored document: a client-supplied string `id`,
// optional per-user scoping, and a toJSON transform that strips Mongo internals
// so the payload matches the Flutter model JSON exactly.
function clientSchema(fields, { scoped = true } = {}) {
  const def = { id: { type: String, required: true }, ...fields };
  if (scoped) def.userId = { type: String, required: true };

  const schema = new mongoose.Schema(def, {
    versionKey: false,
    minimize: false,
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.userId;
        return ret;
      },
    },
  });

  schema.index(scoped ? { userId: 1, id: 1 } : { id: 1 }, { unique: true });
  return schema;
}

module.exports = clientSchema;
