'use strict';

const superagent = require('superagent');
require('dotenv').config();

function handleMovies (request, response) {
  const cityObj = request.query.data;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${cityObj.search_query}`

  superagent.get(url)
    .then( resultsFromAPI => {
      console.log(resultsFromAPI.body.results);
      const movieData = resultsFromAPI.body.results.map( movie => {
        return new Movie (movie);
      })
      response.status(200).send(movieData);
    })
    .catch((error) => {
      Error(error, response);
    });
}

function Movie (allData) {
  this.title = allData.title;
  this.overview = allData.overview;
  this.average_votes = allData.vote_average;
  this.total_votes = allData.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${allData.poster_path}`;
  this.popularity = allData.popularity;
  this.released_on = allData.release_date;
}

function Error(error, response) {
  console.error(error);
  return response.status(500).send('Oops! Something went wrong! Please try again in 401');
}

module.exports = handleMovies;
