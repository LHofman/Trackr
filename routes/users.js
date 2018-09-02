import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';

import User, { comparePassword } from '../models/User';

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

      const token = jwt.sign(user.toJSON(), process.env.DB_SECRET, {
        expiresIn: 7 * 24 * 60 * 60 //1 week
      });
      
      res.json({
        success: true,
        token: 'JWT ' + token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    });
  });
});

export default router;
