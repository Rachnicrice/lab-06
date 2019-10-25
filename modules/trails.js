'use strict';

const superagent = require('superagent');

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

function Error(error, response) {
  console.error(error);
  return response.status(500).send('Oops! Something went wrong! Please try again in 401');
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

module.exports = handleTrails;
