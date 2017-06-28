// Dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');

const app = express();
const PORT = 8080 || process.env.PORT;

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Requiring our Note and post models
// const Post = require('./models/Post');
const Note = require('./models/Note');

// Use morgan and body parser with our app
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());

// User method override to enable DELETE and PUT 
app.use(methodOverride('_method'));

// Make public a static dir
app.use(express.static(path.join(__dirname, 'public')));

// Database configuration with mongoose
mongoose.connect('mongodb://localhost/wow_forum_scraper');
const db = mongoose.connection;

// Halt server on any mongoose errors
db.on('error', (err) => {
  throw new Error(`Mongoose Error: ${err}`);
});

// Use handlebars for templating
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  // extname: '.hbs',
}));
app.set('view engine', 'handlebars');

// Routes
require('./routes/htmlRoutes')(app);
require('./routes/scrapeRoutes')(app);
require('./routes/postRoutes')(app);

// Once logged in to the db through mongoose, log a success message and start the express server
db.once('open', () => {
  console.log('Mongoose connection successful. Starting server ...');
  // Start server
  app.listen(PORT, (err) => {
    if (!err) console.log(`Started Express server on port: ${PORT}`);
    else console.log(`Failed to start server due to an error: ${err}`);
  });
});