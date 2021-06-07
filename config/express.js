import bodyParser from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import methodOverride from 'method-override';
import cors from 'cors';
import routes from '../server/routes';
import path from 'path';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import globalErrorHandler from '../server/helpers/errorHandler';

const app = express();
const server = require('http').createServer(app);
// // mount assets folder on / path
app.use('/node', express.static(path.resolve(__dirname, '../../node/'))); // eslint-disable-line

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());


// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// mount all routes on /api path
app.use('/node/api/', routes)


app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => globalErrorHandler(err, req, res, next));

export default server;
