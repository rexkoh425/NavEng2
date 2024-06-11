const express = require('express')
const router = express.Router()
const { spawn } = require('child_process');
require('dotenv/config')

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey);

function template_img(img_path){
  return `<img src = "${img_path}" alt = "cannot be displayed" width = "300" height = "533"><br> `;
}

function NESW_ENUM(input){
    const NORTH =  "0";
    const EAST  = "90";
    const SOUTH = "180";
    const WEST  = "-90";
    switch(input){
        case NORTH:
            return "1";
        case EAST:
            return "2";
        case SOUTH:
            return "3";
        case WEST:
            return "4";
        default :
            return "not NESW";
    }
}

function get_pov(pov , arrow_direction){
    let incoming = NESW_ENUM(pov);
    if(incoming == "not NESW"){
        return NESW_ENUM(arrow_direction);
    }else{
        return incoming;
    }
}

function handle_up_down(incoming , outgoing){
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
      return "not up down";
  }
  return "not up down";
}

function get_arrow_dir(incoming_str , outgoing_str){

  const response = handle_up_down(incoming_str,outgoing_str);
  if(response != "not up down"){
    return response;
  }
  let incoming = Number(incoming_str);
  let outgoing = Number(outgoing_str);
  outgoing -= incoming;
  if(outgoing <= -180){
    outgoing += 180;
  }else if(outgoing >= 270){
    outgoing -= 360;
  }
  return NESW_ENUM(`${outgoing}`);
}

function is_moving_up_down(incoming , outgoing){
    const UP = "45";
    const DOWN = "-45";
    return (incoming == UP && outgoing == UP) || (incoming == DOWN && outgoing == DOWN);
}

async function room_num_to_node_id(res, room_number , supabase){
    
    try {
        // Query the 'users' table for a specific user by ID
        const { data, error } = await supabase
            .from('pictures')
            .select('node_id')
            .eq('room_num', `${room_number}`);
        if (error) {
            throw error;
        }
        return data[0].node_id;

    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
}

async function get_filepaths(res , nodes , supabase){
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
        return data;
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    } 
}

router.get('/test', (req, res) => {
    const userData = 
    [
      "Server is running!"
      ]
      res.send(userData)
})

router.post('/contact', (req, res) => {
  const {email, message} = req.body

  console.log(email + ' | ' + message)
  res.send("Message sent. Thank you.")
}) 

router.post('/locations' , async(req,res) => {
    try {
        const { data, error } = await supabase
            .from('pictures')
            .select('room_num')
            .eq('pov', 'None')
            .eq('direction', 'None');
        if (error) {
            throw error;
        }
        
        let locations_array = [];
        data.forEach(result => {
            if(result.room_num != "NIL" && result.room_num != "duplicate"){
            locations_array.push(`${result.room_num}`);
            }
        });
        res.send(locations_array);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post('/formPost' , async (req ,res) => { 

    const inputData = req.body;
    //checking for empty input
    if(!inputData.source || !inputData.destination){
        console.log("data incorrectly labelled or source and destination not filled")  
        return;
    }

    inputData.source = await room_num_to_node_id(res , inputData.source , supabase);
    inputData.destination = await room_num_to_node_id(res , inputData.destination , supabase);
    const serializedData = JSON.stringify(inputData);
    const cppProcess = spawn(__dirname + '/../Dijkstra/main' , []);
    cppProcess.stdin.write(serializedData);
    cppProcess.stdin.end();
  
    cppProcess.stdout.on('data', async (data) => {
        const outputData = data.toString().split("|");
        let nodes = outputData[0].split(",");
        const directions = outputData[1].split(",");
        nodes[0] += "67";
        let directions_array_len = directions.length;
        for(i = 1 ; i < directions_array_len ; i ++){
            if(is_moving_up_down(directions[i-1] , directions[i])){
                nodes.splice(i,1);
                directions.splice(i,1);
                i --;
                directions_array_len --;
            }else{
                let pov = get_pov(directions[i-1] , directions[i]); 
                let direction = get_arrow_dir(directions[i-1] , directions[i]);
                nodes[i] += pov;
                nodes[i] += direction;
            }
        }
        nodes[directions.length] += "67";
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
            const debug_array = new Array(data_length).fill("");//for debug only
            let debug_array_index = 0;
            data.forEach(result => {
                let index = 0;
                for(let i = 0 ; i < data_length ; i ++){
                    if(result.unique_id == parseInt(nodes[i])){
                        index = i;
                        break;
                    }
                }                
                fixedLengthArray[index] = template_img(result.filepath);
                //debug_array[debug_array_index] = result.unique_id;
                //debug_array_index++;
            });
            //console.log(debug_array);
            const final = fixedLengthArray.join('');
            const FinalResults = {
                Expected : nodes.length ,
                Queried : data_length , 
                HTML : final
            }
            res.send(FinalResults);
        } catch (error) {
            res.status(500).json({ error: error.message }); 
        } 
    });
    
  // Handle errors and exit events
  cppProcess.on('error', (error) => {
      console.error('Error executing C++ process:', error);
  });

  cppProcess.on('exit', (code) => {
      //console.log('C++ process exited with code:', code);
  });
  
});

module.exports = router