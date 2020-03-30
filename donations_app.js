const politicians = require('./RestAPI/server')
const uri = 'mongodb+srv://truther:berniebitches420@cluster0-p5cmn.mongodb.net/test?retryWrites=true&w=majority'
// const uri = "mongodb+srv://megan:123@clustertest-wsnll.mongodb.net/test?retryWrites=true&w=majority"
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const https = require('https');


////////////////////////////////////////////////////////////////////////////////
// Connect to MongoDB database
////////////////////////////////////////////////////////////////////////////////

function connectDb(callback) {
  console.log('start connectdb')

  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    });
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  // db.once('open', () => console.log("Connected!"), function() {
  //       if (callback) callback()
  //       else console.log('get crp not a function')
  //   })

  db.once('open', function() {
      console.log('Connected')
      // if (callback) callback()
      // getCrp()
      findEmptyDonors()
  })
}

////////////////////////////////////////////////////////////////////////////////
// get array of crp_ids in database
////////////////////////////////////////////////////////////////////////////////
var crp_array = []

function getCrp(callback) {
  // crp_array = []
  console.log('start getCrp')

  politicians.find({}, 'crp_id', function (err, docs) {
    if (err) return err

    docs.forEach(docs => {
        if (docs.crp_id!=null)
          crp_array.push(docs.crp_id)
    })
    console.log('array is ' + crp_array)
    if (callback) callback()
    populateDonors()
  })

}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function printArray() {
  console.log('global crp_array is ' + crp_array)
}

function findEmptyDonors() {
  var new_array = []
    // db.things.find( { a : { $exists : false } } ); // return if a is missing
  var exists_array = []
  politicians.find( {donors: {$exists : true }}, function(err, docs) {
    if (err) return err
    console.log('docs with donors length is ' + docs.length)
    docs.forEach(docs => {
      if (docs.crp_id!=null)
        exists_array.push(docs.crp_id)
    })
    console.log('existing array is ' + exists_array)
  });
  politicians.find( {donors: {$exists : false }}, function(err, docs) {
    if (err) return err
    console.log('docs length is ' + docs.length)
    docs.forEach(docs => {
      if (docs.crp_id!=null)
        new_array.push(docs.crp_id)
    })
    crp_array = new_array
    // printArray()
    // populateDonors()

  });
}
////////////////////////////////////////////////////////////////////////////////
// Retrieve contribution data from OpenSecrets API and update database
////////////////////////////////////////////////////////////////////////////////
function populateDonors() {
  // crp_array = ['N00028152', 'N00035451', 'badid']
  console.log('In populateDonors, array is ' + crp_array)
  var method = 'candContrib'
  var year = '2020'
  var cid
  var url
  // var api_key = '52f80155d9bb4bd043b2ef5c7e05e9cc' //utexas
  // var api_key = '17670ea6524ff0d3a02e77c6d6835d08' //maemeigh
  // var api_key = '8501d386724d739584d71c1328ce4feb' //mtn gmail
  // var api_key = 'ed0ccb4fd1f64fdbce4e8915564c40e2' // ee461
  // var api_key = '00d06946b742b2613873185d48895a2e' // res org
  var api_key = '2332f6dd943afd1e54c4548560d94769' //res ut 

  for(var i = 0; i < crp_array.length; i++) {
      cid = crp_array[i]
      console.log('cid is '+ cid)
      url = `https://www.opensecrets.org/api/?method=${method}&year=${year}&cid=${cid}&output=json&apikey=${api_key}`
      console.log('get ' + url)
      https.get(url, (res) => {
        console.log('statusCode:', res.statusCode);
        // console.log('headers:', res.headers);
        if(res.statusCode=='200') {
            let result = '';
            res.on('data', (d) => {
              // process.stdout.write(d);
              result += d;
            });

            res.on('end', () =>  {
              result = JSON.parse(result)
              result = JSON.stringify(result)
              result = result.replace(/@/g, "_")
              result = JSON.parse(result)
              // console.log(result)

              let cid = result.response.contributors._attributes.cid
              var cycle = result.response.contributors._attributes.cycle
              // console.log(cid)
              console.log('cycle is ' + cycle)
              console.log('cid is ' + cid)

              result.response.contributors.contributor.forEach(contributor => {
                  // console.log(contributor)
                  console.log('cid in for each loop ' + cid)

                  politicians.updateMany(
                    {'crp_id': cid},
                    {
                      "$push": {
                        "donors": {
                          "year": cycle,
                          "org_name": contributor._attributes.org_name,
                          "total": contributor._attributes.total,
                          "pacs": contributor._attributes.pacs,
                          "indivs": contributor._attributes.indivs
                        }, $sort: {"total":-1}
                      }
                    }, function() {
                        politicians.find({'crp_id': cid}, 'last_name donors', function (err, docs) {
                          if (err) return err
                          console.log('docs is ' + docs)
                        })
                    })
              }) // finished pushing one contributor to database for current cid
          }) //finished updating all donors for current crp_id
      } //end of if statment (status code is 200)
      }).on('error', (e) => {
        console.error('GET error: ' + e);
      });
  } //end of for loop to update every crp_id
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

connectDb()