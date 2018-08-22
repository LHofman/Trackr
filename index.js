import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import index from './routes';
import users from './routes/users';

const port = process.env.PORT || 3001;
const DB_CONNECTION = 'mongodb://127.0.0.1/trackr';
mongoose.connect(DB_CONNECTION, {useNewUrlParser: true});

const app = express();
const db = mongoose.connection;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', index);
app.use('/users', users);

app.listen(port, () => {
  console.log('running at localhost: ' + port);
});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export default app;
