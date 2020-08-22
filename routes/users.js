import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';

import User, { addUser, comparePassword } from '../models/User';

dotenv.config();

const router = express.Router();

router.post('/authenticate', (req, res, next) => {
  User.findOne({ username: req.body.username }).exec((err, user) => {
    if (err) return next(err);
    if (!user) return res.json({ success: false, msg: 'User not found' });

    comparePassword(req.body.password, user.password, (err, isMatch) => {
      if (err) return res.status(500).send('Something went wrong');
      if (!isMatch)
        return res.json({ success: false, msg: 'Incorrect password' });

      const token = jwt.sign(user.toJSON(), process.env.DB_SECRET);

      res.json({
        success: true,
        token: 'JWT ' + token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin
        }
      });
    });
  });
});

router.post('/register', (req, res, next) => {
  const user = new User(req.body);
  addUser(user, (err, user) => {
    if (err)
      return res.status(500).send({
        success: false,
        code: err.code,
        msg:
          err.code === 11000
            ? 'The username is already in use'
            : 'Something went wrong'
      });
    res.json(user);
  });
});

export default router;
