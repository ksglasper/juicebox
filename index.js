const express = require('express');
const app = express();
const PORT = 3000;
const {client} = require('./db')
const apiRouter = require('./api');
const morgan = require('morgan');
require('dotenv').config();



app.use(morgan('dev'));

app.use(express.json())

app.use('/api', apiRouter);

app.use((req, res, next) => {
    console.log("<____Body Logger START____>");
    console.log(req.body);
    console.log("<_____Body Logger END_____>");
  
    next();
  });


app.get('/', (req, res) =>{
res.send(`
<h1>Welcome to the Homepage!</h1>
<a href='/api'>Head over to the API</a>

`)
})


















client.connect()
app.listen(PORT, () => {
  console.log('The server is up on port', PORT)
});