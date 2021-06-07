import mongoose from 'mongoose';
import config from './config/env';
import app from './config/express';

// connext to db
mongoose.connect(
    config.db,
    () =>{
    console.log('connected to DB');
});

mongoose.connection.on('connected', function () {
  console.log({
    level: 'info',
    message: `Server Connected to Mongoose @ ${config.db}`,
    fileName: 'index.js',
    functionName: 'mongoose',
  });
});

// If the connection throws an error
mongoose.connection.on('error', function (err) {
  console.log(err);
  console.log({
    level: 'error',
    message: `Failed to Connect to Mongoose @ ${config.db}`,
    fileName: 'index.js',
    functionName: 'mongoose',
  });
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log({
    level: 'info',
    message: `Server and Mongoose Disconnected from @ ${config.db}`,
    fileName: 'index.js',
    functionName: 'mongoose',
  });
});

// listen on port config.port
app.listen(process.env.PORT || config.port, () => {
  console.log({
    level: 'info',
    message: `Server Started On Port ${config.port} (${config.env})`,
  });
});

export default app ;