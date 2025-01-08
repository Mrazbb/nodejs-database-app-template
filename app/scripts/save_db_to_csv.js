
require('total5');
let env = require('dotenv').config({ path: '../.env' }).parsed;


const { createObjectCsvWriter } = require('csv-writer');
const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

require('querybuilderpg').init('', "postgresql://" + env[ 'postgres' ], 10, ERROR('PostgreSQL'));
// public.mtm_movie_genre.sql                      public.tbl_config.sql                           public.tbl_sample.sql
// public.mtm_movie_production_company.sql         public.tbl_genre.sql                            public.tbl_spoken_language.sql
// public.mtm_movie_production_country copy.sql    public.tbl_movie.sql                            public.tbl_user.sql
// public.mtm_movie_spoken_language.sql            public.tbl_production_company.sql
// public.tbl_collection.sql                       public.tbl_production_country.sql
async function migrate () {
    console.log('Migrating tbl_config', env);
    tables = [ 'public.mtm_movie_genre', 'public.mtm_movie_production_company', 'public.mtm_movie_production_country', 'public.mtm_movie_spoken_language', 'public.tbl_collection', 'public.tbl_config', 'public.tbl_genre', 'public.tbl_movie', 'public.tbl_production_company', 'public.tbl_production_country', 'public.tbl_sample', 'public.tbl_spoken_language', 'public.tbl_user' ];
    
    for (let i = 0; i < tables.length; i++) {
        let table = tables[ i ];

        let results = await DATA.find(table).sort('id').promise();

        // change date to timestamp
        for (let result of results) {
            for (let key in result) {
                if (result[ key ] instanceof Date) {
                    result[ key ] = result[ key ].toISOString();
                }
            }
        }

        if (results.length === 0) {
            console.log('No data found for table', table);
            continue;
        }

        const csvWriter = createCsvWriter({
            path: '../sql/10_inserts/' + table + '.csv',
            header: Object.keys(results[ 0 ]).map((key) => ({ id: key, title: key })),
            fieldDelimiter: ';' 
        });

        csvWriter
            .writeRecords(results)
            .then(() => {
                console.log('Data written to CSV successfully!');
            })
            .catch((err) => console.error('Error writing to CSV:', err));
    }


    // results = [];
    // Total.Fs.createReadStream('public.tbl_config.csv')
    //     .pipe(csv())
    //     .on('data', (data) => results.push(data))
    //     .on('end', () => {
    //         console.log('CSV file successfully processed');
    //         console.log(results);
    //     })
    //     .on('error', (err) => {
    //         console.error('Error reading the CSV file:', err);
    //     })
}
migrate();
