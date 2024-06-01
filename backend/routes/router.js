const express = require('express')
const router = express.Router()
const { spawn } = require('child_process');
require('dotenv/config')

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey);

function template_img(img_path){
  return `<img src = "${img_path}" alt = "cannot be displayed" width = "300"><br> `;
}

function direction_map(direction_num){
  const NORTH =  "0";
  const EAST  = "90";
  const SOUTH = "180";
  const WEST  = "-90";
  const UP = "45";
  const DOWN = "-45";

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

function filter_elevator(incoming , outgoing){
  const UP = "45";
  const DOWN = "-45";
  if(incoming != outgoing){
      if(outgoing == UP){
          return "5";
      }
      if(outgoing == DOWN){
          return "6";
      }
      if(incoming == UP || incoming == DOWN){
          return '7';
      }
      return "0";
  }
  return "0";
}

function direction_img(incoming_str , outgoing_str){
  const respond = filter_elevator(incoming_str,outgoing_str);
  if(respond != "0"){
      return respond;
  }
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
          return "0";
  }
}


router.get('/users', (req, res) => {
    const userData = 
    [
        {
          "id": 1,
          "name": "Leanne Grahamsdasds",
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


router.post('/contact', (req, res) => {
  const {email, message} = req.body

  console.log(email + ' | ' + message)
  res.send("Message sent. Thank you.")
}) 

router.post('/formPost' , async (req ,res) => { 
//  res.set("Content-Security-Policy", "default-src 'self' https://naveng-backend-vercel.vercel.app; script-src 'self' 'unsafe-inline'");
  //res.send(`<img src = "https://bdnczrzgqfqqcoxefvqa.supabase.co/storage/v1/object/public/Pictures/11_30_-330_2_North_North_T_junction_NIL.png" alt = "cannot be displayed" width = "100" height = "100"></img><br></br>`);
  const inputData = req.body;
  console.log(inputData)
  console.log(inputData.source)
  console.log(inputData.destination)
  //checking for empty input
  if(!inputData.source || !inputData.destination){
    console.log("data incorrectly labelled")  
    return;
  }

  try {
    // Query the 'users' table for a specific user by ID
    const { data, error } = await supabase
        .from('pictures')
        .select('node_id')
        .eq('room_num', inputData.source);
    if (error) {
        throw error;
    }
    inputData.source = data[0].node_id;
} catch (error) {
    res.status(500).json({ error: error.message });
} 
try {
    // Query the 'users' table for a specific user by ID
    const { data, error } = await supabase
        .from('pictures')
        .select('node_id')
        .eq('room_num', inputData.destination);
    if (error) {
        throw error;
    }
    inputData.destination = data[0].node_id;
} catch (error) {
    res.status(500).json({ error: error.message });
}


console.log(inputData);

  const serializedData = JSON.stringify(inputData);
  console.log(serializedData)
  const cppProcess = spawn(__dirname + '/../Dijkstra/main' , []);
  cppProcess.stdin.write(serializedData);
  cppProcess.stdin.end();
  
  cppProcess.stdout.on('data', async (data) => {
      const outputData = data.toString().split("|");
      console.log(outputData);
      let nodes = outputData[0].split(",");
      const directions = outputData[1].split(",");
      //console.log(directions);
      nodes[0] += "67";
      for(i = 1 ; i < directions.length ; i ++){
          nodes[i] += direction_map(directions[i-1]);//pov
          nodes[i] += direction_img(directions[i-1] , directions[i]);
      }
      nodes[directions.length] += "67";
      console.log(nodes);
      try {
        // Query the 'users' table for a specific user by ID
        const { data, error } = await supabase
            .from('pictures')
            .select('unique_id , filepath')
            .in('unique_id', nodes)
            .order('node_id', { ascending: true });
        if (error) {
            throw error;
        }
        const data_length  = data.length;
        const fixedLengthArray = new Array(data_length).fill("");
        
        data.forEach(result => {
            let index = 0;
            for(let i = 0 ; i < data_length ; i ++){
                if(result.unique_id == parseInt(nodes[i])){
                    index = i;
                    break;
                }
            }                
            fixedLengthArray[index] = template_img(result.filepath);
        });
        const final = fixedLengthArray.join('');
        res.send(final);
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    } 
  });
    
  // Handle errors and exit events
  cppProcess.on('error', (error) => {
      console.error('Error executing C++ process:', error);
  });

  cppProcess.on('exit', (code) => {
      console.log('C++ process exited with code:', code);
  });
  
});

module.exports = router