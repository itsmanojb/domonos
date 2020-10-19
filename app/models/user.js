const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: [true, 'Email must be unique'],
    lowercase: true
  },
  contact: {
    type: String
  },
  addresses: {
    type: [Object]
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'customer'
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);