const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const router = require('./routes/router')
require('dotenv/config')
const helmet = require('helmet');



const app = express()

app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "https://naveng-backend-vercel.vercel.app"],
      // Add more directives as needed
    }
  }));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

const corsOptions = {
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use('/', router)

const port = process.env.PORT
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

const path = require('path');
const { spawn } = require('child_process');
const { defaultMaxListeners } = require('events');

app.use(express.json());
app.use(express.urlencoded({ extended : false}));
