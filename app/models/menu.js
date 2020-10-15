const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  menuType: {
    type: String,
    required: true
  },
  foodType: {
    type: String, // veg / nonveg
  },
  options: {
    type: Object
  },
  price: {
    type: Number,
  },
  image: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Menu', menuSchema);