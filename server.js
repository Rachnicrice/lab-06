'use strict';

const express = require('express');
require('dotenv').config();
const superagent = require('superagent');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001

let locations = {};

app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/yelp', handleYelp);

app.get('*', (request, response) => {
  response.status(404).send('Wrong path Dorothy.')
})

function Error (error, response) {
  console.error(error);
  return response.status(500).send('Oops! Something went wrong! Please try again in 401');
}

function handleLocation (request, response) {
  const location = request.query.data;
  const url =`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODE_API_KEY}`

  if (locations[url]){
    console.log('using cache');
    response.send(locations[url]);
  } else {
    console.log('getting data from API');
    superagent.get(url)
      .then(resultsFromAPI => {
        const locationObj = new CityLocation(location, resultsFromAPI.body.results[0]);

        locations[url] = locationObj;
        response.status(200).send(locationObj);
      })
      .catch((error) => {
        Error(error, response);
      })
  }
}

function handleWeather (request, response) {
  const locationObject = request.query.data;
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${locationObject.latitude},${locationObject.longitude}`;

  superagent.get(url)
    .then(resultsFromAPI => {
      const weatherData = resultsFromAPI.body.daily.data.map(dayInfo => {
        return new Forecast(dayInfo);
      })

      response.status(200).send(weatherData);
    })
    .catch((error) => {
      Error(error, response);
    })
}

function handleYelp (request, response) {
const locationObj = request.query.data;
const url = `https://api.yelp.com/v3/businesses/search?location=${locationObj.search_query}`

superagent.get(url).set('Authorization: Bearer', `${process.env.YELP_API_KEY}`);
  .then(resultsFromAPI => {
    console.log(rewultsFromAPI.body)
  })
}

function Yelp (otherData) {
  // {
  //   "link": "https://www.eventbrite.com/seattlejshackers/events/253823797/",
  //   "name": "SeattleJS Hackers",
  //   "event_date": "Wed Apr 23 2014",
  //   "summary": "Come and meet other JS hackers at the Code Fellows campus!"
  // }
  
}

function Forecast (moreData) {
  let utcTime = moreData.time * 1000

  this.forecast = moreData.summary;
  this.time = new Date (utcTime).toDateString();
}

function CityLocation (cityName, someData) {
  this.search_query = cityName;
  this.formatted_query = someData.formatted_address;
  this.latitude = someData.geometry.location.lat;
  this.longitude = someData.geometry.location.lng;
}


app.listen(PORT, () => console.log(`app is listening on ${PORT}`));
