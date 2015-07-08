var fs = require('fs');
var cj = require('node-csv-json');

cj({
  input : 'data/crime2013.csv',
  output : 'data/crime2013.json'
  },
   function (err, result) {
     if (err)
       console.error(err);
     else
       console.log('New data file saved!');
   });
