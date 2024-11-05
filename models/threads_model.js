const mongoose = require('mongoose');

let threadSchema = new mongoose.Schema(
  {
    board: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    created_on: {
      type: Date,
      default: new Date(),
    },
    bumped_on: {
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
    replies: [
      {
        //< an array of comment _id
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Reply',
      },
    ],
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    virtuals: {
      replycount: {
        get() {
          return this.replies.length;
        },
      },
    },
  }
);

module.exports = mongoose.model('Thread', threadSchema);
