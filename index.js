import bodyParser from 'body-parser';
import config from 'config';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import path from 'path';
import util from 'util';

import passportStrategy from './config/passportStrategy';

import index from './routes';
import users from './routes/users';

dotenv.config();

const port = process.env.PORT || 3001;
const DB_CONNECTION = util.format(
  "mongodb+srv://%s:%s@%s.%s.mongodb.net/%s?retryWrites=true&w=majority",
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  config.get('DB_CONNECTION'),
  config.get('DB_CONNECTION_2'),
  config.get('DB_NAME')
);
mongoose.connect(DB_CONNECTION, {useNewUrlParser: true});

const app = express();
const db = mongoose.connection;

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
passportStrategy(passport);

app.use('/api', index);
app.use('/users', users);

//Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log('running at localhost: ' + port);
});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export default app;
