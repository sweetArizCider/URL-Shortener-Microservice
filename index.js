require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const port = process.env.PORT;
const cors = require('cors');
const dns = require('node:dns/promises')

// Middleware
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.urlencoded({extended: true}));
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(()=> console.log("Connected :)"));


const urlSchema = new mongoose.Schema({
  url: {
    type: String,
  },
  shortUrl: {
    type: Number,
    unique: true
  }
})

urlSchema.plugin(AutoIncrement, {inc_field: 'shortUrl'});

const Url = mongoose.model('Url', urlSchema)

const createUrlShortened = async(url)=>{
  const urlCreated = await Url.create({url: url});
  return urlCreated;
}

const validateUrl = async (hostname)=>{
  try{
    const result = await dns.lookup(hostname);
    return result;
  }catch(error){
    console.log("Validate error: ", error)
    return null;
  }
}

app.post('/api/shorturl', async (req, res) =>{
  const newUrl = req.body.url;
  const hostname = new URL(newUrl).hostname;

  const isValid = await validateUrl(hostname);

  if(!isValid){
    res.status(400).json({ error: 'invalid url' });
    return
  }

  const urlCreated = await createUrlShortened(newUrl);

  res.status(200).json({ original_url: newUrl, short_url: urlCreated.shortUrl });
});

app.get('/api/shorturl/:url', async(req, res)=>{
  const shortUrl = req.params.url;
  const urlRequested = await Url.findOne({shortUrl: shortUrl});
  res.redirect(urlRequested.url);
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
