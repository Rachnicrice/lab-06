'use strict';

const superagent = require('superagent');
require('dotenv').config();

function handleYelp (request, response) {
  const locationObj = request.query.data;
  const url = `https://api.yelp.com/v3/businesses/search?location=${locationObj.search_query}`

  superagent.get(url).set(`Authorization`, `Bearer ${process.env.YELP_API_KEY}`)
    .then(resultsFromAPI => {
      const yelpData = resultsFromAPI.body.businesses.map( businesses => {
        return new Business (businesses);
      })

      response.status(200).send(yelpData);
    })
    .catch((error) => {
      Error(error, response)
    })
}

function Error(error, response) {
  console.error(error);
  return response.status(500).send('Oops! Something went wrong! Please try again in 401');
}

function Business (otherData) {
  this.name = otherData.name;
  this.image_url = otherData.image_url;
  this.price = otherData.price;
  this. rating = otherData.rating;
  this.url = otherData.url;
}

module.exports = handleYelp;
