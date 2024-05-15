const dbConnect = require('./db');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

//Importing the routes
const authRoute = require('./routes/auth');
const notesRoute = require('./routes/notes');

//Middlewares
app.use(express.json());    
app.use(cors());

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/notes', notesRoute);

dbConnect();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})