const axios = require('axios');
const cron = require('node-cron');
const util = require('util');
const myDB = require('./connection');

myDB(async client => {
  const myDatabase = await client.db('database').collection('collection');

  // scrape data every 15 seconds
  cron.schedule('*/15 * * * * *', () => {
    axios.get("https://dummyjson.com/products")
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