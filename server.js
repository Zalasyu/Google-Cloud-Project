const express = require('express');
const cookieParser = require('cookie-parser');

// Create Express App
const app = express();

// Import routes
const routes = require('./routes/routes');

// Use Cookie Parser
app.use(cookieParser());

// Set up middleware
app.use(express.urlencoded({ extended: false }));

// Set up JSON parser
app.use(express.json());

// Set up static files
app.use(express.static('public'));

// Set up EJS
app.set('view engine', 'ejs');

// Set up trust proxy
app.enable('trust proxy');

// Set up routes
app.use('/', routes);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});