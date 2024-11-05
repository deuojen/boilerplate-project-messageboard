'use strict';
const Thread = require('../models/threads_model.js');
const Reply = require('../models/replies_model.js');

module.exports = function (app) {
  app
    .route('/api/threads/:board')
    .get(async function (req, res) {
      let board = req.params.board;
      let error;
      let result;
      try {
        const _id = req.query.thread_id;

        let filter = { board: board };
        if (_id) {
          filter['_id'] = _id;
        }

        result = await Thread.find(filter)
          .populate({
            path: 'replies',
            options: {
              sort: { created_on: -1 },
              limit: 3,
              select: '-reported -delete_password -__v',
            },
          })
          .select('-reported -delete_password -__v')
          //.selectPopulatedPaths('-reported -delete_password -__v')
          .sort({ bumped_on: -1 })
          .limit(10)
          .exec();
        // console.log(filter);
      } catch (err) {
        error = err;
      }

      if (error) {
        res.status(200).json(error);
      } else {
        res.status(200).json(result);
      }
    })
    .post(async function (req, res) {
      let board = req.params.board;
      let error;
      let newThread;
      try {
        // console.log(req.body);
        if (req.body.board) {
          board = req.body.board;
        }
        const text = req.body.text;
        const delete_password = req.body.delete_password;

        newThread = new Thread({
          board,
          text,
          delete_password,
        });

        // console.log(newThread);
        await newThread.validate();
        await newThread.save();
      } catch (err) {
        error = err;
        // console.log(err);
      }

      if (error) {
        res.status(200).json({ error: 'required field(s) missing' });
      } else {
        res.status(200).json({
          _id: newThread._id,
          board: newThread.board,
          text: newThread.text,
          created_on: newThread.created_on,
          bumped_on: newThread.updated_on,
          reported: newThread.reported,
          delete_password: newThread.delete_password,
          replies: [],
        });
      }
    })
    .put(async function (req, res) {
      let error;
      let thread_id = req.body.thread_id;
      // console.log(req.body);
      if (!thread_id) {
        res.status(200).json({ error: 'missing thread_id' });
        return;
      }
      let result;
      try {
        result = await Thread.findByIdAndUpdate(thread_id, {
          $set: { reported: true },
        });
        // console.log(result);
      } catch (err) {
        error = err;
      }
      // console.log(error);
      if (error || !result) {
        res.status(200).type('txt').send('incorrect password');
      } else {
        res.status(200).type('txt').send('reported');
      }
    })
    .delete(async function (req, res) {
      //let project = req.params.project;
      let error;
      let _id = req.body.thread_id;
      let delete_password = req.body.delete_password;

      // console.log(req.body);
      if (!_id) {
        res.status(200).json({ error: 'missing thread_id' });
        return;
      }
      if (!delete_password) {
        res.status(200).json({ error: 'missing delete_password' });
        return;
      }
      let result;
      try {
        result = await Thread.findById(_id);
        // console.log(result);
        if (result.delete_password == delete_password) {
          result = await Thread.findByIdAndDelete(_id);
        } else {
          result = null;
        }
        // console.log(result);
      } catch (err) {
        error = err;
      }
      // console.log(error);
      if (error || !result) {
        res.status(200).type('txt').send('incorrect password');
      } else {
        res.status(200).type('txt').send('success');
      }
    });

  app
    .route('/api/replies/:board')
    .get(async function (req, res) {
      let board = req.params.board;
      let error;
      let result;
      //console.log(req.params);
      //console.log(req.query);
      try {
        const _id = req.query.thread_id;

        result = await Thread.findById(_id)
          .populate({
            path: 'replies',
            options: {
              sort: { created_on: -1 },
              //limit: 3,
              select: '-reported -delete_password -thread_id -__v',
            },
          })
          .select('-reported -delete_password -__v')
          //.selectPopulatedPaths('-reported -delete_password -__v')
          .sort({ bumped_on: -1 })
          //.limit(10)
          .exec();
      } catch (err) {
        error = err;
      }
      // console.log(result);
      if (error) {
        res.status(200).json(error);
      } else {
        res.status(200).json(result);
      }
    })
    .post(async function (req, res) {
      let board = req.params.board;
      let error;
      let newReply;
      try {
        // console.log(req.params);
        // console.log(req.body);
        const _id = req.body.thread_id;
        const text = req.body.text;
        const delete_password = req.body.delete_password;

        newReply = new Reply({
          thread_id: _id,
          text,
          delete_password,
        });

        // console.log(newThread);
        await newReply.validate();
        await newReply.save();

        await Thread.updateOne(
          { _id },
          {
            $set: { bumped_on: newReply.created_on },
            $push: { replies: newReply._id },
          }
        );
      } catch (err) {
        error = err;
        // console.log(err);
      }

      // console.log(newReply);

      if (error) {
        res.status(200).json({ error: 'required field(s) missing' });
      } else {
        res.status(200).json({
          _id: newReply._id,
          text: newReply.text,
          created_on: newReply.created_on,
          delete_password: newReply.delete_password,
          reported: newReply.reported,
        });
      }
    })
    .put(async function (req, res) {
      let error;
      let thread_id = req.body.thread_id;
      let reply_id = req.body.reply_id;
      //console.log(req.body);
      if (!thread_id) {
        res.status(200).json({ error: 'missing thread_id' });
        return;
      }
      if (!reply_id) {
        res.status(200).json({ error: 'missing reply_id' });
        return;
      }
      let result;
      try {
        result = await Reply.findByIdAndUpdate(reply_id, {
          $set: { reported: true },
        });
        // console.log(result);
      } catch (err) {
        error = err;
      }
      // console.log(error);
      if (error || !result) {
        res.status(200).type('txt').send('incorrect password');
      } else {
        res.status(200).type('txt').send('reported');
      }
    })
    .delete(async function (req, res) {
      //let project = req.params.project;
      let error;
      let thread_id = req.body.thread_id;
      let reply_id = req.body.reply_id;
      let delete_password = req.body.delete_password;

      // console.log(req.body);
      if (!thread_id) {
        res.status(200).json({ error: 'missing thread_id' });
        return;
      }
      if (!reply_id) {
        res.status(200).json({ error: 'missing reply_id' });
        return;
      }
      if (!delete_password) {
        res.status(200).json({ error: 'missing delete_password' });
        return;
      }
      let result;
      try {
        result = await Reply.findById(reply_id);
        // console.log(result);
        if (result.delete_password == delete_password) {
          result = await Reply.findByIdAndUpdate(reply_id, {
            $set: { text: '[deleted]' },
          });
        } else {
          result = null;
        }
        // console.log(result);
      } catch (err) {
        error = err;
      }
      // console.log(error);
      if (error || !result) {
        res.status(200).type('txt').send('incorrect password');
      } else {
        res.status(200).type('txt').send('success');
      }
    });
};
