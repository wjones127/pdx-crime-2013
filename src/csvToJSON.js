var fs = require('fs');
var cj = require('node-csv-json');

cj({
  input : 'data/crime.csv',
  output : 'data/crime.json'
  },
   function (err, result) {
     if (err)
       console.error(err);
     else
       console.log('New data file saved!');
   });
