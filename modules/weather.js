'use strict';

const superagent = require('superagent');
require('dotenv').config();

function handleWeather(request, response) {
  const locationObject = request.query.data;
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${locationObject.latitude},${locationObject.longitude}`;

  superagent.get(url)
    .then(resultsFromAPI => {
      const weatherData = resultsFromAPI.body.daily.data.map(dayInfo => {
        return new Forecast(dayInfo);
      });

      response.status(200).send(weatherData);
    })
    .catch((error) => {
      Error(error, response);
    });
}

function Error(error, response) {
  console.error(error);
  return response.status(500).send('Oops! Something went wrong! Please try again in 401');
}

function Forecast(moreData) {
  let utcTime = moreData.time * 1000;

  this.forecast = moreData.summary;
  this.time = new Date(utcTime).toDateString();
}

module.exports = handleWeather;
