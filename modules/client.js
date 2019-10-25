'use strict';

const pg = require('pg');
require('dotenv').config();

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => { throw err; });

module.exports = client;
