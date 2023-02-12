const axios = require('axios');
const cron = require('node-cron');
const util = require('util');
const myDB = require('./connection');

myDB(async client => {
  const myDatabase = await client.db('scoreboard').collection('nfl');

  // scrape data every 10 seconds
  cron.schedule('*/10 * * * * *', () => {
    axios.get("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard")
      .then((response) => {
        // get last inserted record from database
        myDatabase.findOne({}, { sort: { "date": -1 } }, (err, result) => {
          if (err) {
            console.log(err);
          } else if (result) {
            // compare new data to last inserted record data
            if (!util.isDeepStrictEqual(response.data, result.data)) {
              // if diff detected, save data to new record with timestamp
              myDatabase.insertOne({ "data": response.data, "date": new Date() });
            }
          } else {
            // if table is empty, save data to new record with timestamp
            myDatabase.insertOne({ "data": response.data, "date": new Date() });
          }
        });
      });
  });

});