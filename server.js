'use strict';

const express = require('express');
require('dotenv').config();

const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001

app.get('/location', (request, response) => {
  try {
    const city = request.query.data;

    const cityData = searchLattoLng(city);

    response.send(cityData)
  }

  catch(error) {
    console.error(error);
    response.status(500).send('Oops! Something went wrong! Please try again in 401');
  }
});

app.get('*', (request, response) => {
  response.status(404).send('Where are you?')
})

function searchLattoLng (location) {
  const geoData = require('./data/geo.json');

  const cityObject = new CityLocation (location, geoData);

  return cityObject;
}

function CityLocation (cityName, someData) {
  this.search_query = cityName;
  this.formatted_query = someData.results[0].formatted_address;
  this.latitude = someData.results[0].geometry.location.lat;
  this.longitude = someData.results[0].geometry.location.lng
}


app.listen(PORT, () => console.log(`app is listening on ${PORT}`));
