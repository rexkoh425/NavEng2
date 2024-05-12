const express = require('express');
const mysql = require('mysql2');
const port = process.env.port || 5500;
const path = require('path');

const { spawn } = require('child_process');
const { defaultMaxListeners } = require('events');
const app = express();
 
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
    return `<img src = "${img_path}" alt = "cannot be displayed" width = "100" height = "100"><br> `;
}

function direction_img(direction_num){
    const NORTH =  123456;
    const SOUTH = -123456;
    const EAST  = 654321;
    const WEST  = -654321;
    let local_workspace = `http://localhost:5500/Pictures`;
    switch(direction_num){
        
        case NORTH:
            return local_workspace + "north.png";
        case SOUTH:
            return local_workspace + "south.png";
        case EAST:
            return local_workspace + "east.png";
        case WEST:
            return local_workspace + "west.png";
        default : 
            return local_workspace + "north.png";
    }
}

app.get('/' , (req ,res) => { 
    res.sendFile(`C:\\Users\\rexko\\OneDrive\\Desktop\\NUS\\html practice\\Orbital_website` +  '/OrbWeb.htm');
});

app.post('/formPost' , (req ,res) => { 
    const inputData = req.body;
    //console.log(inputData);
    const serializedData = JSON.stringify(inputData);
    const cppProcess = spawn(__dirname + '/../Dijkstra/main.exe' , []);
    cppProcess.stdin.write(serializedData);
    cppProcess.stdin.end();

    cppProcess.stdout.on('data', (data) => {
        const outputData = data.toString().split("|");
        //console.log(outputData);
        const query = `SELECT id,filepath FROM pictures WHERE id IN (${outputData[0]}) ORDER BY FIELD(id,${outputData[0]})`;
        let final = "";
        
        let workspace = `http://localhost:5500/Pictures`;

        connection.query(query, (err, results) => {
            if (err) {
              console.error('Error querying MySQL:', err);
              return;
            }
            results.forEach(result => {
                final += template_img(workspace + "/" + result.filepath);
            });
            res.send(final);
        });
    });
      
    // Handle errors and exit events
    cppProcess.on('error', (error) => {
        console.error('Error executing C++ process:', error);
    });

    cppProcess.on('exit', (code) => {
        console.log('C++ process exited with code:', code);
    });
    
});

app.listen(port , () => console.log(`Server started at http://localhost:${port}`));
