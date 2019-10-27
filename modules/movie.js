'use strict';

const superagent = require('superagent');
require('dotenv').config();

function handleMovies (request, response) {
  const cityObj = request.query.data;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${cityObj.search_query}`

  //Query API for Movie data
  superagent.get(url)
    .then( resultsFromAPI => {
      //Creating an array of movies
      let movieData = resultsFromAPI.body.results.map( movie => {
        return new Movie (movie)
      });

      //Sort by average results and only keep the top 20 results
      movieData.sort((a, b) => b.average_votes - a.average_votes).slice(0, 20);

      //Return to the front end
      response.status(200).send(movieData);
    })
    .catch((error) => {
      Error(error, response);
    });
}

//Constructor function for data recieved from movie API
function Movie (allData) {
  this.title = allData.title;
  this.overview = allData.overview;
  this.average_votes = allData.vote_average;
  this.total_votes = allData.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${allData.poster_path}`;
  this.popularity = allData.popularity;
  this.released_on = allData.release_date;
}

//Response status for unexpected failures
function Error(error, response) {
  console.error(error);
  return response.status(500).send('Oops! Something went wrong! Please try again in 401');
}

module.exports = handleMovies;
