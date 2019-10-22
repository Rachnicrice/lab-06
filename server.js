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
    Error(error, response);
  }
});

app.get('/weather', (request, response) => {
  console.log('You found clouds!')
  try {
    const weatherData = searchWeather();

    response.send(weatherData);
  }

  catch(error) {
    Error(error, response);
  }
})

app.get('*', (request, response) => {
  response.status(404).send('Wrong path Dorothy.')
})

function Error (error, response) {
  console.error(error);
  return response.status(500).send('Oops! Something went wrong! Please try again in 401');
}

function searchLattoLng (location) {
  const geoData = require('./data/geo.json');

  const cityObject = new CityLocation (location, geoData);

  return cityObject;
}

function searchWeather () {
  const darksky = require('./data/darksky.json');
  let weatherForecasts = [];

  for (let i = 0; i < 5; i++) {
    let weatherObject = new Forecast (darksky, i);

    weatherForecasts.push(weatherObject)
  }

  console.log(weatherForecasts)
  return weatherForecasts;
}

function Forecast (moreData, i) {
  let utcTime = moreData.daily.data[i].time;
  console.log(utcTime)

  this.forecast = moreData.daily.data[i].summary
  this.time = new Date (utcTime*1000).toDateString();
}

function CityLocation (cityName, someData) {
  this.search_query = cityName;
  this.formatted_query = someData.results[0].formatted_address;
  this.latitude = someData.results[0].geometry.location.lat;
  this.longitude = someData.results[0].geometry.location.lng
}


app.listen(PORT, () => console.log(`app is listening on ${PORT}`));
