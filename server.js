'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

const client = require('./modules/client.js');

const handleLocation = require('./modules/location.js');
const handleWeather = require('./modules/weather.js');
const handleTrails = require('./modules/trails.js');
const handleYelp = require('./modules/yelp.js')

app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/yelp', handleYelp);
app.get('/trails', handleTrails);

app.get('*', notFound);
app.use(errorHandler);

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

function notFound(request, response) {
  response.status(404).send('Wrong path Dorothy.');
}

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`app is listening on ${PORT}`));
  });
