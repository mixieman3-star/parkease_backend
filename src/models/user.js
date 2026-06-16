'use strict';

const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['driver', 'operator'], default: 'driver' },
    avatarSeed: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    token: { type: String, index: true },
    activeVehicleId: { type: String },
  },
  {
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.token;
        ret.passwordHash = ''; // never leak the hash; model requires a String
        return ret;
      },
    },
  }
);

userSchema.statics.hashPassword = (password) =>
  crypto.createHash('sha256').update(`parkflow.v1::${password}`).digest('hex');

userSchema.statics.newToken = () => crypto.randomBytes(24).toString('hex');

module.exports = mongoose.model('User', userSchema);
