const express = require('express')
const router = express.Router()
const { spawn } = require('child_process');
const mysql = require('mysql2');


const connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'Orbital!@34',
  database: 'orbital'
});

function template_img(img_path){
  return `<img src = "${img_path}" alt = "cannot be displayed" width = "100" height = "100"></img><br></br> `;
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

router.post('/contact', (req, res) => {
  const {email, message} = req.body

  console.log(email + ' | ' + message)
  res.send("Message sent. Thank you.")
})

router.post('/formPost' , (req ,res) => { 
  const inputData = req.body;
  console.log(inputData)
  console.log(inputData.source)
  console.log(inputData.destination)
  //checking for empty input
  if(!inputData.source || !inputData.destination){
    console.log("data incorrectly labelled")  
    return;
  }
  const serializedData = JSON.stringify(inputData);
  console.log(serializedData)
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
      
      let workspace = `http://localhost:4000/Pictures`;

      connection.query(query, (err, results) => {
          if (err){
            console.error('Error querying MySQL:', err);
            return;
          }
          results.forEach(result => {
              final += template_img(`/Pictures` + `/${result.pov}/${result.direction}/` + result.filepath + `.png`);
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

router.get('/users', (req, res) => {
    const userData = 
    [
        {
          "id": 1,
          "name": "Leanne Graham",
          "username": "Bret",
          "email": "Sincere@april.biz",
          "address": {
            "street": "Kulas Light",
            "suite": "Apt. 556",
            "city": "Gwenborough",
            "zipcode": "92998-3874",
            "geo": {
              "lat": "-37.3159",
              "lng": "81.1496"
            }
          },
          "phone": "1-770-736-8031 x56442",
          "website": "hildegard.org",
          "company": {
            "name": "Romaguera-Crona",
            "catchPhrase": "Multi-layered client-server neural-net",
            "bs": "harness real-time e-markets"
          }
        },
        {
          "id": 2,
          "name": "Ervin Howell",
          "username": "Antonette",
          "email": "Shanna@melissa.tv",
          "address": {
            "street": "Victor Plains",
            "suite": "Suite 879",
            "city": "Wisokyburgh",
            "zipcode": "90566-7771",
            "geo": {
              "lat": "-43.9509",
              "lng": "-34.4618"
            }
          },
          "phone": "010-692-6593 x09125",
          "website": "anastasia.net",
          "company": {
            "name": "Deckow-Crist",
            "catchPhrase": "Proactive didactic contingency",
            "bs": "synergize scalable supply-chains"
          }
        },
        {
          "id": 3,
          "name": "Clementine Bauch",
          "username": "Samantha",
          "email": "Nathan@yesenia.net",
          "address": {
            "street": "Douglas Extension",
            "suite": "Suite 847",
            "city": "McKenziehaven",
            "zipcode": "59590-4157",
            "geo": {
              "lat": "-68.6102",
              "lng": "-47.0653"
            }
          },
          "phone": "1-463-123-4447",
          "website": "ramiro.info",
          "company": {
            "name": "Romaguera-Jacobson",
            "catchPhrase": "Face to face bifurcated interface",
            "bs": "e-enable strategic applications"
          }
        }
      ]
      res.send(userData)
})

module.exports = router