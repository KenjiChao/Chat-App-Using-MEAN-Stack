var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
  content: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: {type: Date, default: Date.now}
});

mongoose.model('Message', MessageSchema);