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

app.get('/' , (req ,res) => { 
    res.sendFile(`C:\\Users\\raviv\\OneDrive\\Desktop\\NUS\\Orbital\\Orbital_website` +  '/OrbWeb.htm');
});

app.post('/formPost' , (req ,res) => { 
    const inputData = req.body;
    console.log(inputData)
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
        console.log(outputData);
        let nodes = outputData[0].split(",");
        const directions = outputData[1].split(",");
        //console.log(directions);
        nodes[0] += "66";
        for(i = 1 ; i < directions.length ; i ++){
            nodes[i] += direction_map(directions[i-1]);//pov
            nodes[i] += direction_img(directions[i-1] , directions[i]);
        }
        nodes[directions.length] += "66";
        const id_string = nodes.join(",");
        console.log(id_string);
        const query = `SELECT pov , direction,filepath FROM pictures WHERE unique_id IN (${id_string}) ORDER BY FIELD(node_id,${outputData[0]})`;
        let final = "";
        
        
        let workspace = `http://localhost:5500/Pictures`; 

        connection.query(query, (err, results) => {
            if (err){
              console.error('Error querying MySQL:', err);
              return;
            }
            results.forEach(result => {
                final += template_img(workspace + `/${result.pov}/${result.direction}/` + result.filepath + ".png");
                //final += template_img("../Pictures" + `/${result.pov}/${result.direction}/` + result.filepath + ".png");
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
