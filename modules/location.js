'use strict';

const client = require('./client.js');
const superagent = require('superagent');

//Handler for client queries to the /locations route
function handleLocation(request, response) {
  const location = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODE_API_KEY}`;
  queryDatabase(location, response, url);
}

function queryDatabase(request, response, url) {
  let SQL = `SELECT * FROM locations WHERE search_query=$1`;
  let value = [request];
  return client.query(SQL, value)
    .then(results => {
      //Check to see if location already exists in database
      if (results.rowCount > 0) {
        console.log('from database');
        //If found send to the front end
        response.status(200).send(results.rows[0]);
      } else {
        console.log('getting data from API');
        //If data does not exist in database retrieve from API
        superagent.get(url)
          .then(resultsFromAPI => {
            //Create an object location and return to the front end
            const locationObj = new CityLocation(request, resultsFromAPI.body.results[0]);

            //Store new location object in the database
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

//Constructor function for data recieved from google API
function CityLocation(cityName, someData) {
  this.search_query = cityName;
  this.formatted_query = someData.formatted_address;
  this.latitude = someData.geometry.location.lat;
  this.longitude = someData.geometry.location.lng;
}

//Function for adding the location object to the database
function addToDatabase(locationObj, response) {
  let SQL = 'INSERT INTO locations(search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *';
  let safeValues = [locationObj.search_query, locationObj.formatted_query, locationObj.latitude, locationObj.longitude];
  client.query(SQL, safeValues)
    .then(results => {
      response.status(200).json(results);
    })
    .catch(error => Error(error, response));
}

//Response status for unexpected failures
function Error(error, response) {
  console.error(error);
  return response.status(500).send('Oops! Something went wrong! Please try again in 401');
}

module.exports = handleLocation;
