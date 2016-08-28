var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: String,
  date: {type: Date, default: Date.now}
});

mongoose.model('User', UserSchema);