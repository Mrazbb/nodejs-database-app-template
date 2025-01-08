/**
 * loadMoviesCsv - A Node.js script to safely read, parse, and insert a CSV file of movie data
 *
 * Usage:
 *   1. npm install csv-parser
 *   2. Update the path of the CSV file in the 'csvFilePath' variable.
 *   3. Run the script with: node load_csv.js
 */


require('total5');
let env = require('dotenv').config({ path: '../.env' }).parsed;


require('querybuilderpg').init('', "postgresql://" + env['postgres'], 10, ERROR('PostgreSQL'));


const fs = require('fs');
const csv = require('csv-parser');

function parseJsonSafely(value) {
  if (!value || !value.trim()) {
    // If empty or undefined, return null or an empty array, depending on your needs.
    return null;
  }
  try {
    // Replace single quotes with double quotes
    const jsonString = value.replace(/'/g, '"');
    return JSON.parse(jsonString);
  } catch (err) {
    return null; 
    // You can return [] if you prefer an empty array instead of null
  }
}

function loadMoviesCsv() {
  const csvFilePath = 'movies_metadata.csv'; // Update with your CSV file path
  const movies = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      try {
        const parsedRow = {
          adult: row.adult === 'True',
          belongs_to_collection: row.belongs_to_collection || null,
          budget: parseFloat(row.budget) || 0,
          // Safely parse potentially invalid JSON fields
          genres: parseJsonSafely(row.genres),
          homepage: row.homepage || null,
          id: parseInt(row.id, 10),
          imdb_id: row.imdb_id || null,
          original_language: row.original_language || null,
          original_title: row.original_title || null,
          overview: row.overview || null,
          popularity: parseFloat(row.popularity) || 0,
          poster_path: row.poster_path || null,
          production_companies: parseJsonSafely(row.production_companies),
          production_countries: parseJsonSafely(row.production_countries),
          release_date: row.release_date || null,
          revenue: parseFloat(row.revenue) || 0,
          runtime: parseFloat(row.runtime) || null,
          spoken_languages: parseJsonSafely(row.spoken_languages),
          status: row.status || null,
          tagline: row.tagline || null,
          title: row.title || null,
          video: row.video === 'True',
          vote_average: parseFloat(row.vote_average) || 0,
          vote_count: parseInt(row.vote_count, 10) || 0
        };

        movies.push(parsedRow);
      } catch (e) {
        // If parsing fails for a specific row, log it and skip that row
        console.error('Error processing row:', e.message);
      }
    })
    .on('end', async () => {

      // print average popularity
      let averagePopularity = movies.reduce((sum, movie) => sum + movie.popularity, 0) / movies.length;

      let movies2 = movies.sort((a, b) => b.popularity - a.popularity).slice(0, 500);

      console.log('movies size', movies.length);
      console.log('movies2 size', movies2.length);
      console.log('Average popularity:', averagePopularity);

      console.log('CSV file successfully processed.');
      console.log(`Total valid movies processed: ${movies.length}`);
      // Perform any additional operations or insertions into a database here
      console.log('Inserting movies into database...');

      for (let movie of movies2) {

        let existing = await DATA.find('tbl_movie').where('id', movie.id).promise()
        let payload = CLONE(movie);

        delete payload.genres;
        delete payload.production_companies;
        delete payload.production_countries;
        delete payload.spoken_languages;
        delete payload.belongs_to_collection;
        if (existing.length === 0) {
          console.log('Inserting movie', movie.id, movie.title);
          await DATA.insert('tbl_movie', payload).promise();
        }
        if (movie.genres) {
          console.log('genres', movie.genres);
          for (let genre of movie.genres) {
            let existing = await DATA.find('tbl_genre').where('id', genre.id).promise();
            if (existing.length === 0) {
              console.log('Inserting genre', genre.id, genre.name);
              await DATA.insert('tbl_genre', { id: genre.id, name: genre.name }).promise();
            }

            existing = await DATA.find('mtm_movie_genre').where('movieid', movie.id).where('genreid', genre.id).promise();
            if (existing.length === 0) {
              console.log('Inserting movie genre', movie.id, movie.title, { movieid: movie.id, genreid: genre.id });
              await DATA.insert('mtm_movie_genre', { movieid: movie.id, genreid: genre.id }).promise();
            }
          }
        }

        if (movie.production_companies) {
          console.log('production_companies', movie.production_companies);
          for (let company of movie.production_companies) {
            let existing = await DATA.find('tbl_production_company').where('id', company.id).promise();
            if (existing.length === 0) {
              console.log('Inserting production company', company.id, company.name);
              await DATA.insert('tbl_production_company', { id: company.id, name: company.name }).promise();
            }

            existing = await DATA.find('mtm_movie_production_company').where('movieid', movie.id).where('companyid', company.id).promise();
            if (existing.length === 0) {
              console.log('Inserting movie production company', movie.id, movie.title, { movieid: movie.id, companyid: company.id });
              await DATA.insert('mtm_movie_production_company', { movieid: movie.id, companyid: company.id }).promise();
            }
          }
        }

        if (movie.production_countries) {
          console.log('production_countries', movie.production_countries);
          for (let country of movie.production_countries) {
            let existing = await DATA.find('tbl_production_country').where('id', country.iso_3166_1).promise();
            if (existing.length === 0) {
              console.log('Inserting production country', country.iso_3166_1, country.name);
              await DATA.insert('tbl_production_country', { id: country.iso_3166_1, name: country.name }).promise();
            }

            existing = await DATA.find('mtm_movie_production_country').where('movieid', movie.id).where('countryid', country.iso_3166_1).promise();
            if (existing.length === 0) {
              console.log('Inserting movie production country', movie.id, movie.title, { movieid: movie.id, countryid: country.iso_3166_1 });
              await DATA.insert('mtm_movie_production_country', { movieid: movie.id, countryid: country.iso_3166_1 }).promise();
            }
          }
        }
// {"{\"iso_639_1\":\"en\",\"name\":\"English\"}"}

        if (movie.spoken_languages) {
          console.log('spoken_languages', movie.spoken_languages);
          for (let language of movie.spoken_languages) {
            let existing = await DATA.find('tbl_spoken_language').where('id', language.iso_639_1).promise();
            if (existing.length === 0) {
              console.log('Inserting spoken language', language.iso_639_1, language.name);
              await DATA.insert('tbl_spoken_language', { id: language.iso_639_1, name: language.name }).promise();
            }

            existing = await DATA.find('mtm_movie_spoken_language').where('movieid', movie.id).where('spokenlanguageid', language.iso_639_1).promise();
            if (existing.length === 0) {
              console.log('Inserting movie spoken language', movie.id, movie.title, { movieid: movie.id, spokenlanguageid: language.iso_639_1 });
              await DATA.insert('mtm_movie_spoken_language', { movieid: movie.id, spokenlanguageid: language.iso_639_1 }).promise();
            }
          }
        }
      }
    });
}

// Execute the function to load the CSV
loadMoviesCsv();