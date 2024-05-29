const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const router = require('./routes/router')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

const corsOptions = {
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use('/', router)

const port = 4000
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

const path = require('path');
const { spawn } = require('child_process');
const { defaultMaxListeners } = require('events');

app.use(express.json());
app.use(express.urlencoded({ extended : false}));
