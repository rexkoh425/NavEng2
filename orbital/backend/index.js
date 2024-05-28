const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const router = require('./routes/router')
const mysql = require('mysql2')

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
app.use('/Pictures' , express.static(path.join(__dirname,'../Pictures')));

const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'Orbital!@34',
    database: 'orbital'
});

connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL');
});

function template_img(img_path){
    return `<img src = "${img_path}" alt = "cannot be displayed" width = "400" height = "400"></img><br></br> `;
}

function direction_map(direction_num){
    const NORTH =  "0";
    const EAST  = "90";
    const SOUTH = "180";
    const WEST  = "-90";
    switch(direction_num){
        
        case NORTH:
            return "1";
        case EAST:
            return "2";
        case SOUTH:
            return "3";
        case WEST:
            return "4";
        default : 
            return "1";
    }
}

function direction_img(incoming_str , outgoing_str){
    let incoming = Number(incoming_str);
    let outgoing = Number(outgoing_str);
    outgoing -= incoming;
    if(outgoing <= -180){
        outgoing += 180;
    }else if(outgoing >= 270){
        outgoing -= 360;
    }
    switch(outgoing){
        
        case 0:
            return "1";
        case 90:
            return "2";
        case 180:
            return "3";
        case -90:
            return "4";
        default : 
            return "3";
    }
}


