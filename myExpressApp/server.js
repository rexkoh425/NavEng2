const express = require('express');
const mysql = require('mysql2');
const port = process.env.port || 5500;
const path = require('path');

const { spawn } = require('child_process');
const { defaultMaxListeners } = require('events');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : false}));
app.use('/Pictures/North' , express.static(path.join(__dirname,'../Pictures/North')));
app.use('/Pictures/South' , express.static(path.join(__dirname,'../Pictures/South')));
app.use('/Pictures/East' , express.static(path.join(__dirname,'../Pictures/East')));
app.use('/Pictures/West' , express.static(path.join(__dirname,'../Pictures/West')));
app.use('/Pictures/None' , express.static(path.join(__dirname,'../Pictures/None')));

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
    const NORTH =  "123456";
    const SOUTH = "-123456";
    const EAST  = "654321";
    const WEST  = "-654321";
    switch(direction_num){
        
        case NORTH:
            return "1";
        case SOUTH:
            return "2";
        case EAST:
            return "3";
        case WEST:
            return "4";
        default : 
            return "1";
    }
}

app.get('/' , (req ,res) => { 
    res.sendFile(`C:\\Users\\rexko\\OneDrive\\Desktop\\NUS\\html practice\\Orbital_website` +  '/OrbWeb.htm');
});

app.post('/formPost' , (req ,res) => { 
    const inputData = req.body;
    //checking for empty input
    if(!inputData.source || !inputData.destination){
        return;
    }
    const serializedData = JSON.stringify(inputData);
    const cppProcess = spawn(__dirname + '/../Dijkstra/main.exe' , []);
    cppProcess.stdin.write(serializedData);
    cppProcess.stdin.end();
    
    cppProcess.stdout.on('data', (data) => {
        const outputData = data.toString().split("|");
        let nodes = outputData[0].split(",");
        const directions = outputData[1].split(",");
        nodes[0] += "9";
        for(i = 1 ; i < directions.length ; i ++){
            nodes[i] += direction_img(directions[i]);
        }
        nodes[directions.length] += "9";
        const id_string = nodes.join(",");
        
        const query = `SELECT direction,filepath FROM pictures WHERE unique_id IN (${id_string}) ORDER BY FIELD(node_id,${outputData[0]})`;
        let final = "";
        
        let workspace = `http://localhost:5500/Pictures`;

        connection.query(query, (err, results) => {
            //console.log(results);
            if (err){
              console.error('Error querying MySQL:', err);
              return;
            }
            results.forEach(result => {
                final += template_img(workspace + `/${result.direction}/` + result.filepath + ".png");
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
