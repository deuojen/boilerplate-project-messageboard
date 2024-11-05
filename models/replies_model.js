const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  thread_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Thread',
  },
  text: {
    type: String,
    required: true,
  },
  created_on: {
    type: Date,
    default: new Date(),
  },
  delete_password: {
    type: String,
    required: true,
  },
  reported: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Reply', replySchema);
