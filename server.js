'use strict';

const express = require('express');
require('dotenv').config();
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => { throw err; });

let locations = {};

app.get('/location', handleLocation);
app.get('/weather', handleWeather);
// app.get('/yelp', handleYelp);
app.get('/trails', handleTrails);

app.get('*', notFound);
app.use(errorHandler);

function Error(error, response) {
  console.error(error);
  return response.status(500).send('Oops! Something went wrong! Please try again in 401');
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

function notFound(request, response) {
  response.status(404).send('Wrong path Dorothy.');
}


function queryDatabase(request, response, url) {
  let SQL = `SELECT * FROM locations WHERE search_query=$1`;
  let value = [request];
  return client.query(SQL, value)
    .then(results => {
      if (results.rowCount > 0) {
        console.log('from table',results.rows[0]);
        response.status(200).send(results.rows[0]);
      }else {
        console.log('getting data from API');
        superagent.get(url)
          .then(resultsFromAPI => {
            const locationObj = new CityLocation(request, resultsFromAPI.body.results[0]);
            console.log(locationObj);

            locations[url] = locationObj;

            addToDatabase(locationObj, response);

            response.status(200).send(locationObj);
          })
          .catch((error) => {
            Error(error, response);
          });
      }
    })
    .catch(error => Error(error, response));
}



function handleLocation(request, response) {
  const location = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODE_API_KEY}`;
  queryDatabase(location, response, url);
}

function addToDatabase(locationObj, response) {
  let SQL = 'INSERT INTO locations(search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *';
  let safeValues = [locationObj.search_query, locationObj.formatted_query, locationObj.latitude, locationObj.longitude];
  client.query(SQL, safeValues)
    .then(results => {
      response.status(200).json(results);
    })
    .catch(error => Error(error, response));
}

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

// function handleYelp (request, response) {
//   const locationObj = request.query.data;
//   const url = `https://api.yelp.com/v3/businesses/search?location=${locationObj.search_query}`

//   superagent.get(url).set(`Authorization`, `Bearer ${process.env.YELP_API_KEY}`)
//     .then(resultsFromAPI => {
//       console.log(resultsFromAPI.body.businesses)
//       const yelpData = resultsFromAPI.body.businesses.map()
//     })
//     .catch((error) => {
//       Error(error, response)
//     })
// }

function handleTrails(request, response) {
  const locationObj = request.query.data;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${locationObj.latitude}&lon=${locationObj.longitude}&key=${process.env.TRAIL_API_KEY}`;

  superagent.get(url)
    .then(resultsFromAPI => {
      const trailsData = resultsFromAPI.body.trails.map(data => {
        return new Trail(data);
      });
      response.status(200).send(trailsData);
    })

    .catch((error) => {
      Error(error, response);
    });
}

function Trail(data) {
  this.name = data.location;
  this.location = data.length;
  this.stars = data.stars;
  this.star_votes = data.starVotes;
  this.summary = data.summary;
  this.trail_url = data.url;
  this.conditions = data.conditionStatus;
  this.condition_date = data.conditionDate;
  this.condition_time = data.conditionDate;
}

// function Yelp (otherData) {
//   // {
//   //   "link": "https://www.eventbrite.com/seattlejshackers/events/253823797/",
//   //   "name": "SeattleJS Hackers",
//   //   "event_date": "Wed Apr 23 2014",
//   //   "summary": "Come and meet other JS hackers at the Code Fellows campus!"
//   // }

// }

function Forecast(moreData) {
  let utcTime = moreData.time * 1000;

  this.forecast = moreData.summary;
  this.time = new Date(utcTime).toDateString();
}

function CityLocation(cityName, someData) {
  this.search_query = cityName;
  this.formatted_query = someData.formatted_address;
  this.latitude = someData.geometry.location.lat;
  this.longitude = someData.geometry.location.lng;
}

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`app is listening on ${PORT}`));
  });
