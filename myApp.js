require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const shortenSchema = new mongoose.Schema({
  "original_url": {type: String, required: true },
  "short_url": Number
});

const ShortURL = mongoose.model('ShortURL', shortenSchema);

const vacantSlot = (count = 0, done) => {
  ShortURL.exists({"short_url": count}, (err, data) => {
      if(err) console.log(err);

      if(data) return vacantSlot(count + 1, done);
      else return done(null, count);
    });
};

const postNew = (url, slot, done) => {
  let shorten = new ShortURL({
    "original_url": url,
    "short_url": slot
  });
  
  shorten.save((err, data) => {
    if(err) return console.log(err);
    done(null, data);
  });
};

const URLExist = (url, done) => {
  ShortURL.findOne({"original_url": url}, (err, short) => {
    if(err) return console.log(err);
    done(null, short);
  });
};

const getURL = (slot, done) => {
  ShortURL.findOne({"short_url": Number(slot)}, (err, data) => {
    if(err) return console.log(err);
    done(null, data);
  });
};

exports.ShortURL = ShortURL;
exports.vacantSlot = vacantSlot;
exports.postNew = postNew;
exports.URLExist = URLExist;
exports.getURL = getURL;