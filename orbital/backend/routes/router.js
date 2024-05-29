const express = require('express')
const router = express.Router()
const { spawn } = require('child_process');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bdnczrzgqfqqcoxefvqa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkbmN6cnpncWZxcWNveGVmdnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4NjY1ODAsImV4cCI6MjAzMjQ0MjU4MH0.jXT7lLJj87SBQkUYIfclbt2uA2ISW8XNBDBU8GM7wR0';

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


router.post('/contact', (req, res) => {
  const {email, message} = req.body

  console.log(email + ' | ' + message)
  res.send("Message sent. Thank you.")
})

router.post('/formPost' , async (req ,res) => { 
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
  const cppProcess = spawn(__dirname + '/../Dijkstra/main.exe' , []);
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