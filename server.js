const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const myApp = require('./myApp.js');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const vacantSlot = myApp.vacantSlot;
const postNew = myApp.postNew;
const URLExist = myApp.URLExist;
const getURL = myApp.getURL;

// POST
app.post('/api/shorturl/new', (req, res) => {
  const { url } = req.body;
  const hostname = new require('url-parse')(url).hostname;

  dns.lookup(hostname, (err, address, family) => {
    if(err || !address) return res.json({"error": "Invalid URL"});
    else{
      console.log('dns accepted');
      URLExist(url, (err, data) => {
        console.log(address);
        if(err) console.log('error')
        if(data){
          const { original_url, short_url } = data;
          res.json({original_url, short_url});
        }
        else{
          vacantSlot(0, (err, slot) => {
            postNew(url, slot, (err, data) => {
              if(err) return console.log(err);
              console.log('Shortened URL added');
              res.json({"original_url": url, "short_url": slot});
            })
          });
        }
      });
    }
  });
});

// GET
app.get('/api/shorturl/:slot', (req, res) => {
  getURL(req.params.slot, (err, data) => {
    if(err) console.log(err);
    if(data) res.redirect(data.original_url);
    else res.json({"error": "Invalid URL"});
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
