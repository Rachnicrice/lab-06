'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

const client = require('./modules/client.js');

//Importing handler functions
const handleLocation = require('./modules/location.js');
const handleWeather = require('./modules/weather.js');
const handleTrails = require('./modules/trails.js');
const handleYelp = require('./modules/yelp.js')
const handleMovies = require('./modules/movie.js');

//Routes
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/yelp', handleYelp);
app.get('/trails', handleTrails);
app.get('/movies', handleMovies);

//404 all unwanted extentions
app.get('*', notFound);
app.use(errorHandler);

//Response status for unexpected failures
function errorHandler(error, request, response) {
  response.status(500).send(error);
}

//Response status for unwated extensions
function notFound(request, response) {
  response.status(404).send('Wrong path Dorothy.');
}

//Connecting to the database and then turning on the app
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`app is listening on ${PORT}`));
  });
