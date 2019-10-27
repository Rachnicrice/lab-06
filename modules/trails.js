'use strict';

const superagent = require('superagent');

function handleTrails(request, response) {
  const locationObj = request.query.data;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${locationObj.latitude}&lon=${locationObj.longitude}&key=${process.env.TRAIL_API_KEY}`;

  superagent.get(url)
    .then(resultsFromAPI => {
    //Creating an array of the trails and returning data to the webpage
      console.log(resultsFromAPI.body.trails);
      const trailsData = resultsFromAPI.body.trails.map(data => {
        return new Trail(data);
      });

      response.status(200).send(trailsData);
    })

    .catch((error) => {
      Error(error, response);
    });
}

//Response status for unexpected failures
function Error(error, response) {
  console.error(error);
  return response.status(500).send('Oops! Something went wrong! Please try again in 401');
}

//Constructor function for data recieved from Trails API
function Trail(data) {
  let conditions = data.conditionDate.split(' ');

  this.name = data.name;
  this.location = data.location;
  this.length = data.length;
  this.stars = data.stars;
  this.star_votes = data.starVotes;
  this.summary = data.summary;
  this.trail_url = data.url;
  this.conditions = data.conditionStatus;
  this.condition_date = conditions[0];
  this.condition_time = conditions[1];
}

module.exports = handleTrails;
