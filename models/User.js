import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export default mongoose.model(
  'User',
  mongoose.Schema({
    isAdmin: Boolean,
    name: String,
    firstName: String,
    email: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  })
);

export const addUser = (newUser, callback) => {
  const password = newUser.password;
  if (!password) throw new Error('A password must be provided');
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

export const encryptPassword = (password, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      callback(hash);
    });
  });
}

export const comparePassword = (candidatePassword, hash, callback) => {
  if (!candidatePassword)
    return callback(new Error('A password must be provided'), false);
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
};
