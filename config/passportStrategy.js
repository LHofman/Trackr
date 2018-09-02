import dotenv from 'dotenv';
import passportJwt from 'passport-jwt';

import User from '../models/User';

dotenv.config();

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

export default passport =>
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
        secretOrKey: process.env.DB_SECRET
      },
      (jwt_payload, done) =>
        User.findOne({ _id: jwt_payload._id }).exec(
          (err, user) => (err ? done(err, false) : done(null, user || false))
        )
    )
  );
