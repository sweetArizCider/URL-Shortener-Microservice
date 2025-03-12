require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000;
app.use(cors());

app.post('/api/shorturl', (req, res) =>{
  
  res.json({ original_url : 'https://freeCodeCamp.org', short_url : 1});
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
