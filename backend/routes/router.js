const express = require('express')
const router = express.Router()
const { spawn } = require('child_process');
require('dotenv/config')
const multer = require('multer');
const path = require('path');

const { createClient } = require('@supabase/supabase-js');
const { fail } = require('assert');
const { totalmem } = require('os');

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey);
const no_alt_path_url = 'https://bdnczrzgqfqqcoxefvqa.supabase.co/storage/v1/object/public/Pictures/Specials/No_alternate_path.png?t=2024-06-22T15%3A22%3A29.729Z' ;
const database_down_url = 'https://bdnczrzgqfqqcoxefvqa.supabase.co/storage/v1/object/public/Pictures/Specials/No_alternate_path.png?t=2024-06-22T15%3A22%3A29.729Z';
let blocked_node = "";

function debug_log(input){
    let debug = false;
    if(debug){
        console.log(input);
    }
}

async function template_instructions(distance , arrow_direction , levels){
    
    arrow_direction = await ENUM_to_left_right(arrow_direction);
    
    distance = parseInt(distance);
    if(arrow_direction == 'Down' || arrow_direction == 'Up'){
        return `Go ${arrow_direction} ${levels} level`;
    }else if(arrow_direction == 'Straight' || arrow_direction == 'None'){
        if ((distance / 10) > 1) {
            return `Walk Straight for ${distance / 10} metres` ;
        }
        return `Walk Straight for ${distance / 10} metre`;
    }else{
        if ((distance / 10) > 1) {
        return `Turn ${arrow_direction} and Walk Straight for ${distance / 10} metres` ;
        }
        return `Turn ${arrow_direction} and Walk Straight for ${distance / 10} metre` ;
    }
}

async function ENUM_to_left_right(input){
    switch(input){
        case "1" :
            return "Straight";
        case "2" :
            return "Right";
        case "3" :
            return "around";
        case "4" :
            return "Left";
        case "5" : 
            return "Up";
        case "6" :
            return "Down";
        case "7" : 
            return "None";
        default : 
            return "None";
    }
}

function template_img(img_path){
  return `<img src = "${img_path}" alt = "cannot be displayed" class="htmlData"><br>`;
}

async function NESW_ENUM(input){
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
            //throw new Error("not NESW");
            return "not NESW";
    }
}

async function get_opposite(input){
    switch(input){ 
        case "1" :
            return "3";
        case "2" :
            return "4";
        case "3" :
            return "1";
        case "4" :
            return "2";
        case "5" :
            return "6";
        case "6" :
            return "5";
        default : 
            //throw new Error("no opposite");
            return "no opposite";
    }
}

async function get_pov(pov , arrow_direction){
    let incoming = await NESW_ENUM(pov);
    if(incoming == "not NESW"){
        return await NESW_ENUM(arrow_direction);
    }else{
        return incoming;
    }
}

async function handle_up_down(incoming , outgoing){
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

async function get_arrow_dir(incoming_str , outgoing_str){

    const response = await handle_up_down(incoming_str,outgoing_str);
    if(response != "not up down"){
        return response;
    }

    const North = { North : '1' , East : '2' , South : '3' , West : '4'};
    const East = { North : '4' , East : '1' , South : '2' , West : '3'};
    const South = { North : '3' , East : '4' , South : '1' , West : '2'};
    const West = { North : '2' , East : '3' , South : '4' , West : '1'};
    
    switch(outgoing_str){
        case "0" :
            outgoing_str = 'North';
            break;
        case "90" :
            outgoing_str = 'East';
            break;
        case "180" :
            outgoing_str = 'South';
            break;
        case "-90" :
            outgoing_str = 'West';
            break;
    }

    switch(incoming_str){
        case "0" :
            return North[outgoing_str];
        case "90" :
            return East[outgoing_str];
        case "180" :
            return South[outgoing_str];
        case "-90" :
            return West[outgoing_str];

    }
    return await NESW_ENUM(outgoing_str);
}

async function is_moving_up_down(incoming , outgoing){
    const UP = "45";
    const DOWN = "-45";
    return (incoming == UP && outgoing == UP) || (incoming == DOWN && outgoing == DOWN);
}

async function room_num_to_node_id(room_number){
    if(typeof(room_number) == "string"){
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
            throw new Error("room_num to node_id cannot query database");
        } 
    }else{
        return room_number;
    }
}

async function get_diff(expected , query){
    const  queried = query.map(num => num.toString());
    const set1 = new Set(expected);
    const set2 = new Set(queried);

    for (let item of set2) {
        set1.delete(item);
    }
    return Array.from(set1);
}

async function get_blocked(){
    try {
        
        const { data, error } = await supabase
            .from('block_shelter')
            .select('id')
            .eq('blocked', true)
            .eq('verified_block' , true);
        if (error) {
            throw error;
        }
        let blocked_array = []
        for(const element of data){
            blocked_array.push(element.id - 1);
        }
        return blocked_array;

    } catch (error) {
        throw new Error("get_blocked cannot query database");
    }
}

async function convert_ENUM_to_angle(ENUM){
    switch(ENUM){
        case "1" :
            return "0";
        case "2" :
            return "90";
        case "3" :
            return "180";
        case "4" :
            return "-90";
        case "5" :
            return "45";
        case "6" :
            return "-45";
        default : 
            return "not convertable";
    }
}

async function get_non_sheltered(){
    try {
        
        const { data, error } = await supabase
            .from('block_shelter')
            .select('id')
            .eq('sheltered', false);
        if (error) {
            throw error;
        }
        let non_sheltered = []
        for(const element of data){
            non_sheltered.push(element.id - 1);
        }
        return non_sheltered;

    } catch (error) {
        throw new Error("get_non_sheltered cannot query database");
    }
}

async function get_stairs(){
    try { 
        const { data, error } = await supabase
            .from('pictures')
            .select('node_id')
            .eq('self_type', 'Stairs');
            //dont need distinct cause will become distinct when merged later
        if (error) {
            throw error;
        }
        let stairs = [];
        for(const element of data){
            stairs.push(element.node_id - 1);
        }
        stairs = [...new Set(stairs)];
        return stairs;

    } catch (error) {
        throw new Error("get_stairs cannot query database");
    }
}

async function dir_string_to_ENUM(input){
    switch(input){
        case "North" :
            return "1";
        case "East" :
            return "2";
        case "South" :
            return "3";
        case "West" :
            return "4";
        case "Up" : 
            return "5";
        case "Down" :
            return "6";
        case "None" : 
            return "7";
        default : 
            return "1";
    }
}

async function angle_to_string_dir(input){
    switch(input){
        case '0' : 
            return "north";
        case '90' : 
            return "east";
        case '180' : 
            return "south";
        case '-90' : 
            return "west";
        case '45' : 
            return "up";
        case '-45' : 
            return "down";
        default :
            return "cannot convert"
    }
}

async function break_down_img_path(img_name){
   
    let increment = 0;
    const components = img_name.split("_");
    const node_id = components[0];
    const x_coor = components[1];
    const y_coor = components[2];
    const z_coor = components[3];
    const pov=  components[4];
    const arrow_dir = components[5];
    let type = components[6];
    if(components[6] == "T" || components[6] == "Cross"){
        type = components[6] + "_" + components[7];
        increment = 1;
    }
    const room_num = components[7 + increment];
    return {node_id : node_id , x_coor : x_coor , y_coor : y_coor , z_coor : z_coor , pov : pov , arrow :arrow_dir , type : type , room_num : room_num};

}

async function full_query(source , destination , blocked_nodes , previous_node){
    return new Promise((resolve, reject) => {
        debug_log(blocked_nodes);
        const inputObj = { source : source , destination : destination , blocked : blocked_nodes};
        const serializedData = JSON.stringify(inputObj);
        const cppProcess = spawn(__dirname + '/../Dijkstra/main' , []);
        cppProcess.stdin.write(serializedData);
        cppProcess.stdin.end();
        
        cppProcess.stdout.on('data', async (cpp_data) => {
            try {
                debug_log(cpp_data.toString());
                const outputData = cpp_data.toString().split("|");
                let nodes = outputData[0].split(",");
                if(nodes.length == 1){
                    throw new Error("cannot find dest");
                }
                const nodes_path = [...nodes];
                const directions = outputData[1].split(",");
                let distance = outputData[2];
                let dist_array = outputData[3].split(",");
                const Instructions = [];

                if(previous_node.have_previous){
                    const blocked_pov = await dir_string_to_ENUM(previous_node.blocked_pov);
                    const incoming_pov = await get_opposite(blocked_pov);
                    nodes[0] += incoming_pov;
                    const incoming_pov_angle = await convert_ENUM_to_angle(incoming_pov);
                    const arrow = await get_arrow_dir(incoming_pov_angle , directions[0]);
                    nodes[0] += arrow;
                }else{
                    nodes[0] += "67";
                }
                Instructions.push('');
                let directions_array_len = directions.length;
                for(i = 1 ; i < directions_array_len ; i ++){
                    
                    let is_up_down = await is_moving_up_down(directions[i-1] , directions[i]);
                    if(is_up_down){//directions[i-1] == directions[i]
                        do{
                            nodes.splice(i,1);
                            nodes_path.splice(i,1);
                            directions.splice(i,1);
                            dist_array[i-1] = `${parseInt(dist_array[i-1]) + parseInt(dist_array.splice(i,1))}`;
                            directions_array_len --;
                            is_up_down = await is_moving_up_down(directions[i-1] , directions[i]);
                        }while(is_up_down)
                        Instructions[i-1].levels = parseInt(dist_array[i-1])/40;
                        Instructions[i-1].distance = dist_array[i-1];
                        i--;
                    }else{
                        let pov = await get_pov(directions[i-1] , directions[i]); 
                        let direction = await get_arrow_dir(directions[i-1] , directions[i]);
                        nodes[i] += pov;
                        nodes[i] += direction;
                        let instructions_obj = { 
                            distance : dist_array[i] , 
                            arrow_direction : direction ,
                            levels : parseInt(dist_array[i])/40
                        }
                        Instructions.push(instructions_obj);
                    }
                }
                nodes[directions.length] += "67";
                Instructions.push('');
                debug_log(nodes);
                debug_log(directions);
                
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
                data.forEach(async result => {
                    let index = 0;
                    for(let i = 0 ; i < data_length ; i ++){
                        if(result.unique_id == parseInt(nodes[i])){
                            index = i;
                            break;
                        }
                    }
                    const imgHTML = template_img(result.filepath);             
                    fixedLengthArray[index] = imgHTML;
                    debug_array[debug_array_index] = result.unique_id;
                    debug_array_index++;
                });
                const diff = await get_diff(nodes , debug_array);
                debug_log("diff is ");
                debug_log(diff);
                //debug_log("dist array length is " + dist_array.length + " and nodes array length is " + nodes.length);
                const final = fixedLengthArray.join('');
                const FinalResults = {
                    Expected : nodes.length ,
                    Queried : data_length , 
                    HTML : final ,
                    Distance : distance ,
                    Dist_array : dist_array , 
                    nodes_path : nodes_path , 
                    Instructions : Instructions
                }
                resolve(FinalResults);
            } catch (error) {
                reject(error);
            }
        });
        
    // Handle errors and exit events
        cppProcess.on('error', (error) => {
            console.error('Error executing C++ process:', error);
        });

        cppProcess.on('exit', (code) => {
            debug_log(`C++ process exited with code: ${code}`);
        });
    })
}

async function transit_query(source , destination , blocked_nodes , previous_node){
    return new Promise((resolve, reject) => {
        const inputObj = { source : source , destination : destination , blocked : blocked_nodes};
        const serializedData = JSON.stringify(inputObj);
        const cppProcess = spawn(__dirname + '/../Dijkstra/main' , []);
        cppProcess.stdin.write(serializedData);
        cppProcess.stdin.end();
        
        cppProcess.stdout.on('data', async (cpp_data) => {
            try {
                const outputData = cpp_data.toString().split("|");
                let nodes = outputData[0].split(",");
                if(nodes.length == 1){
                    throw new Error("cannot find dest");
                }
                let nodes_path = [...nodes];
                const directions = outputData[1].split(",");
                let distance = outputData[2];
                let dist_array = outputData[3].split(",");
                const Instructions = [];
                if(previous_node.have_previous){
                    const blocked_pov = await dir_string_to_ENUM(previous_node.blocked_pov);
                    const incoming_pov = await get_opposite(blocked_pov);
                    nodes[0] += incoming_pov;
                    const incoming_pov_angle = await convert_ENUM_to_angle(incoming_pov);
                    const arrow = await get_arrow_dir(incoming_pov_angle , directions[0]);
                    nodes[0] += arrow;
                }else{
                    nodes[0] += "67";
                }
                Instructions.push('');
                let directions_array_len = directions.length;
                for(i = 1 ; i < directions_array_len ; i ++){
                    
                    let is_up_down = await is_moving_up_down(directions[i-1] , directions[i]);
                    if(is_up_down){
                        
                        do{
                            nodes.splice(i,1);
                            nodes_path.splice(i,1);
                            directions.splice(i,1);
                            dist_array[i-1] = `${parseInt(dist_array[i-1]) + parseInt(dist_array.splice(i,1))}`;
                            directions_array_len --;
                            is_up_down = await is_moving_up_down(directions[i-1] , directions[i]);
                        }while(is_up_down)
                        Instructions[i-1].levels = parseInt(dist_array[i-1])/40;
                        Instructions[i-1].distance = dist_array[i-1];
                        i--;
                    }else{
                        let pov = await get_pov(directions[i-1] , directions[i]); 
                        let direction = await get_arrow_dir(directions[i-1] , directions[i]);
                        nodes[i] += pov;
                        nodes[i] += direction;
                        let instructions_obj = { 
                            distance : dist_array[i] , 
                            arrow_direction : direction ,
                            levels : parseInt(dist_array[i])/40
                        }
                        Instructions.push(instructions_obj);
                    }
                }
                nodes[directions.length] += "67";
                debug_log(nodes);
                debug_log(directions);

                const { data, error } = await supabase
                    .from('pictures')
                    .select('unique_id , filepath')
                    .in('unique_id', nodes)
                    .order('node_id', { ascending: true });
                if (error) {
                    throw error;
                }
                let data_length  = data.length;
                let fixedLengthArray = new Array(data_length).fill("");
                const debug_array = new Array(data_length).fill("");//for debug only
                let debug_array_index = 0;
                data.forEach(async result => {
                    let index = 0;
                    for(let i = 0 ; i < data_length ; i ++){
                        if(result.unique_id == parseInt(nodes[i])){
                            index = i;
                            break;
                        }
                    }
                    const imgHTML = template_img(result.filepath);             
                    fixedLengthArray[index] = imgHTML;
                    debug_array[debug_array_index] = result.unique_id;
                    debug_array_index++;
                });
                debug_log("diff is " , get_diff(nodes , debug_array));
                fixedLengthArray.pop();
                nodes_path.pop();
                nodes.pop();
                data_length -= 1;
                const final = fixedLengthArray.join('');
                const FinalResults = {
                    Expected : nodes.length ,
                    Queried : data_length , 
                    HTML : final ,
                    Distance : distance ,
                    Dist_array : dist_array , 
                    nodes_path : nodes_path , 
                    Instructions : Instructions
                }
                resolve(FinalResults);
            } catch (error) {
                reject(error);
            }
        });
        
    // Handle errors and exit events
        cppProcess.on('error', (error) => {
            console.error('Error executing C++ process:', error);
        });

        cppProcess.on('exit', (code) => {
            debug_log(`C++ process exited with code: ${code}`);
        });
    })
}

async function is_failed_location(source , destination){
    
    try { 
        const { data, error } = await supabase
            .from('failedtest')
            .select('*')
            .eq('source', source)
            .eq('destination' , destination);
        if (error) {
            throw error;
        }
        if(data.length >= 1){
            return true;
        }
        return false;

    } catch (error) {
        debug_log(error);
        return "failed" ;
    }
    /*
    const failed_location = await is_failed_location(destinations[0] , destinations[1])
    if(failed_location){
        debug_log("failed");
    }else{
        debug_log("not failed");
    }
    code to filter failed location
    */
}

class Result{
    constructor(){
        this.Expected = 0;
        this.Queried = 0 ; 
        this.HTML = "" ;
        this.Distance = 0 ;
        this.Dist_array = [] ;
        this.nodes_path = [] ;
        this.Stops_index = [] ;
        this.Instructions = [] ; 
        this.passed = true ;
    }

    async add(other){
        this.Expected += other.Expected;
        this.Queried += other.Queried ; 
        this.HTML += other.HTML ;
        this.Distance = `${parseInt(this.Distance) + parseInt(other.Distance)}` ;
        this.Dist_array = this.Dist_array.concat(other.Dist_array);
        this.nodes_path = this.nodes_path.concat(other.nodes_path);
        this.Instructions = this.Instructions.concat(other.Instructions); 
    }

    async append_stops(stop){
        this.Stops_index.push(stop);
    }

    get_object(){
        return {
            Expected : this.Expected ,
            Queried : this.Queried ,
            HTML : this.HTML , 
            Distance : this.Distance , 
            Dist_array : this.Dist_array ,
            nodes_path : this.nodes_path , 
            Stops_index : this.Stops_index , 
            Instructions : this.Instructions , 
            passed : this.passed
        }
    }

    async convert_to_instructions(){
        for(let i = 0 ; i < this.Instructions.length ; i ++){
            let instructions_obj = this.Instructions[i];
            if(instructions_obj != ''){
                this.Instructions[i] = await template_instructions(instructions_obj.distance , instructions_obj.arrow_direction , instructions_obj.levels);
            }
        }
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

  debug_log(email + ' | ' + message)
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

router.post('/feedback' , async(req,res) => {
    const {feedbackType, bugDetails,  nodes} = req.body
    try {
        let input = [{feedback_type : null , bug_details : null , nodes : null}];

        if(feedbackType == "Report bug with website"){
            input = [{feedback_type : feedbackType , bug_details : bugDetails , nodes : null}];    
        }else if(feedbackType == "Report a path"){
            input = [{feedback_type : feedbackType , bug_details : null , nodes : nodes}];    
        }

        const { error } = await supabase
            .from('feedback')
            .insert(input);
        if (error) {
            throw error;
        }
        debug_log('Data added to database successfully.');
        //res.send('Data added to database successfully.'); 
    } catch (error) {
        console.error('Error appending data to database:', error);
        //res.status(500).send('Failed to append data to database.'); 
    }

    res.send("Thank you for your feedback!") //sending conformation message back to frontend
})

router.post('/FailedLocations' , async(req,res) => {
    try {
        const { data, error } = await supabase
            .from('failedtest')
            .select('*');
        if (error) {
            throw error;
        }
        
        let failed_pairs = [];
        data.forEach(result => {
            const pair_object = { source : result.source , destination : result.destination};
            failed_pairs.push(pair_object);
        });
        res.send(failed_pairs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post('/InsertFailedLocations', async (req, res) => {
    const AllFailedLocations = req.body;

    try {
        for (const element of AllFailedLocations) {
        
            const { error } = await supabase
                .from('failedtest')
                .insert([{ source: `${element.source}`, destination: `${element.destination}` }]);
            if (error) {
                throw error;
            }
        }

        debug_log('Data added to database successfully.');
        res.send('Data added to database successfully.'); 
    } catch (error) {
        console.error('Error appending data to database:', err);
        res.status(500).send('Failed to append data to database.'); 
    }
});

router.post('/DeleteFailedLocations', async (req, res) => {

    try {
        const { error } = await supabase
            .from('failedtest')
            .delete()
            .gt('id', 0); // Condition equivalent to 'id > 0'

        if (error) {
            throw error;
        }

        debug_log('Data deleted from database successfully.');
        res.send('Data deleted from database successfully.'); 
    } catch (error) {
        console.error('Error deleting data from database:', err);
        res.status(500).send('Failed to delete data from database.'); 
    }
});

router.post('/formPost' , async (req ,res) => { 
    //add to formPost input ,  elements = new added node 
    const inputData = req.body;
    
    let destinations = inputData.MultiStopArray;
    let mergedArray = [];
    if(inputData.MultiStopArray.length < 2){
        debug_log("data incorrectly labelled or source and destination not filled"); 
        return res.send({HTML : template_img(no_alt_path_url) , passed : false , error_can_handle : false});
    }

    try{
        for(let i =  0; i < destinations.length ; i ++){
            destinations[i] = await room_num_to_node_id(destinations[i]);
        }
        //debug_log(destinations);
        let blocked_array = await get_blocked();
        for(let i = 0 ; i < inputData.blocked_array.length ; i++){
            blocked_array.push(inputData.blocked_array[i]);
        }
        let non_sheltered = [];
        if(inputData.sheltered){
            non_sheltered = await get_non_sheltered();
        }
        let stairs = [];
        if(inputData.NoStairs){
            stairs = await get_stairs();
        }
        mergedArray = Array.from(new Set([...blocked_array, ...non_sheltered , ...stairs]));
        //debug_log(mergedArray);
    }catch(error){
        return res.send({HTML : template_img(database_down_url) , passed : false , error_can_handle : false});
    }
    let TotalResult = new Result();

    const previous_node = { have_previous : false , blocked_pov : ""};
    for(let i = 1 ; i < destinations.length ; i++){
        let result;
        try{
            if(i == destinations.length-1){
                result = await full_query(destinations[i-1] , destinations[i] , mergedArray , previous_node);
            }else{
                result = await transit_query(destinations[i-1] , destinations[i] , mergedArray , previous_node);
            }
            await TotalResult.add(result);
            
            if(i == destinations.length - 1){
                await TotalResult.append_stops(TotalResult.Expected - 1);
            }else{
                await TotalResult.append_stops(TotalResult.Expected);
            }
            //debug_log(TotalResult.Instructions);
        } catch(error){
            //console.error('Error caught:', error.message);
            if(error.message == "cannot find dest"){
                return res.send({HTML : template_img(no_alt_path_url) , passed : false , error_can_handle : true});
            }
            return res.send({HTML : template_img(no_alt_path_url) , passed : false , error_can_handle : false});
        }
    }
    
    await TotalResult.convert_to_instructions();
    debug_log(TotalResult.Instructions);
    return res.send(TotalResult.get_object());
});

router.post('/blockRefresh' , async (req ,res) => { 
    
    const inputData = req.body;
    let destinations = inputData.MultiStopArray;
    if(inputData.MultiStopArray.length < 2){
        //debug_log("data incorrectly labelled or source and destination not filled"); 
        return res.send({HTML : template_img(no_alt_path_url) , passed : false , error_can_handle : false});
    }
    let blocked_node_component;
    let mergedArray;
    try{
        for(let i =  0; i < destinations.length ; i ++){
            destinations[i] = await room_num_to_node_id(destinations[i]);
        }

        debug_log("stop index : " , inputData.Stops_index);
        debug_log("blocked node index : " , inputData.BlockedNodeIndex);
        while(inputData.Stops_index[0] < inputData.BlockedNodeIndex){
            destinations.splice(0,1);
            inputData.Stops_index.splice(0,1);
        }
        destinations.splice(0,1);
        //console.log(inputData.b4_blocked_img_path);
        const previous_node_component = await break_down_img_path(inputData.b4_blocked_img_path);
        destinations.unshift(parseInt(previous_node_component.node_id));
        blocked_node_component = await break_down_img_path(inputData.blocked_img_path);
        debug_log("destinations are : " , destinations);
        let blocked_array = await get_blocked();
        for(let i = 0 ; i < inputData.blocked_array.length ; i++){
            blocked_array.push(inputData.blocked_array[i]);
        }
        let non_sheltered = [];
        if(inputData.sheltered){
            non_sheltered = await get_non_sheltered();
        }
        let stairs = [];
        if(inputData.NoStairs){
            stairs = await get_stairs();
        }
        mergedArray = Array.from(new Set([...blocked_array, ...non_sheltered , ...stairs]));
    }catch(error){
        return res.send({HTML : template_img(database_down_url) , passed : false , error_can_handle : false});
    }
    let TotalResult = new Result();
    //Destinations : destinations
    const no_previous = { have_previous : false , pov : "" , arrow : ""};
    const previous_node = { have_previous : true , blocked_pov : blocked_node_component.pov};
    for(let i = 1 ; i < destinations.length ; i++){
        let result;
        try{
            if(i == destinations.length-1){
                if(destinations.length == 2){
                    result = await full_query(destinations[i-1] , destinations[i] , mergedArray , previous_node);
                }else{
                    result = await full_query(destinations[i-1] , destinations[i] , mergedArray , no_previous);
                }
            }else if(i == 1){
                result = await transit_query(destinations[i-1] , destinations[i] , mergedArray , previous_node);
            }else{
                result = await transit_query(destinations[i-1] , destinations[i] , mergedArray , no_previous);
            }
            await TotalResult.add(result);
            if(i == destinations.length - 1){
                TotalResult.append_stops(TotalResult.Expected - 1);
            }else{
                TotalResult.append_stops(TotalResult.Expected);
            }
        }catch(error){
            //console.error('Error caught:', error.message);
            if(error.message == "cannot find dest"){
                return res.send({HTML : template_img(no_alt_path_url) , passed : false , error_can_handle : true});
            }
            return res.send({HTML : template_img(no_alt_path_url) , passed : false , error_can_handle : false});
        }
    }
    await TotalResult.convert_to_instructions();
    debug_log(TotalResult.Instructions);
    let TotalResultObj = TotalResult.get_object();
    TotalResultObj['Destinations'] = destinations;
    return res.send(TotalResultObj);
});

router.post('/insertBlocked' , async (req ,res ) => {
    const input = req.body.img_string;
    debug_log("input is : " + input)
    const node_string = input.split("_");
    const node_id = parseInt(node_string[0]);
    
    
    try {
        const { error } = await supabase
        .from('block_shelter')
        .update({ blocked : true })
        .eq('id', node_id);
        debug_log('Data added to database successfully.');
        debug_log('Blocked ID is : ' + node_id)
        res.send({ message : 'Data added to database successfully.' , node : node_id} ); 
    } catch (error) {
        console.error('Error appending data to database:', err);
        res.status(500).send( { message : 'Failed to append data to database.'  , node : node_id}); 
    }
});

router.post('/getfloor' , async (req , res) => {
    const inputData = req.body.node_id; //assume its node id
    let targeted_z = 0;
    let nodes_with_same_z = new Set();
    let node_label_map = {};
    try {
        const { data, error } = await supabase
            .from('pictures')
            .select('z_coordinate')
            .eq('node_id', inputData)

            targeted_z = data[0]['z_coordinate'];
            
        if (error) {
            throw error;
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
    try {
        const { data, error } = await supabase
            .from('pictures')
            .select('node_id , self_type')
            .eq('z_coordinate', targeted_z);

            data.forEach(result => {
                const prev_size = nodes_with_same_z.size;
                nodes_with_same_z.add(result.node_id);
                const aft_size = nodes_with_same_z.size;
                if(aft_size > prev_size){
                    node_label_map[`${result.node_id}`] = result.self_type;
                }
            });
        if (error) {
            throw error;
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
    let inputObj = { nodes : [...nodes_with_same_z] };
    const serializedData = JSON.stringify(inputObj);
    const cppProcess = spawn(__dirname + '/../Dijkstra/TopDownMap' , []);
    cppProcess.stdin.write(serializedData);
    cppProcess.stdin.end();
    
    cppProcess.stdout.on('data', async (cpp_data) => {
        //console.log(cpp_data.toString());
        try{
            let outputData = cpp_data.toString().split("|");
            outputData.pop();
            //console.log(outputData);
            let FullMapObj = [];
            await outputData.forEach(async node_data => {
                let MapObj = {
                    id : 0 ,
                    connections : [] ,
                    label : ''
                }

                node_data = node_data.split("_");
                MapObj.id = parseInt(node_data[0]) + 1;
                MapObj.label = node_label_map[`${parseInt(node_data[0]) + 1}`];
                let edges = node_data[1].split("/");
                edges.pop();
                await edges.forEach(async edge_data =>{
                    edge_data = edge_data.split(",");
                    const direction = await angle_to_string_dir(edge_data[2])
                    let EdgeObj = {
                        id : parseInt(edge_data[0]) + 1,
                        distance : parseInt(edge_data[1]),
                        direction : direction
                    }
                    MapObj.connections.push(EdgeObj);
                })
                FullMapObj.push(MapObj);   
            })
            res.send(FullMapObj);

        }catch(error){
            
        }
        
        cppProcess.on('error', (error) => {
            console.error('Error executing C++ process:', error);
        });

        cppProcess.on('exit', (code) => {
            debug_log(`C++ process exited with code: ${code}`);
        });
    });

});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, blocked_node + ext);
    }
});
  
const upload = multer({ storage: storage });

//////////////////////////////////////////////////////////////////////////////
///////////////////////function testing region////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
router.post('/blocked_img', upload.single('photo'), (req, res) => {
    try {
      // File is uploaded successfully, you can process further if needed
      debug_log('image uploaded:', req.file);
      res.status(200).send('Image uploaded successfully, thank you for helping make NavEng up to date for users');
    } catch (err) {
      console.error('Error uploading image:', err);
      res.status(500).send('Error uploading image');
    }
});

router.post('/template_img' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const response = template_img(inputs);
    if(response == expected) { 
        res.send({ passed : true }) 
    }else{
        res.send({ passed : false });
    }
});

router.post('/NESW_ENUM' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        const result = await NESW_ENUM(inputs[i]);
        if(result == expected[i]){
            passed ++;
        }
    }
    if(passed == test_cases){
        res.send({ passed : true });
    }else{
        res.send({ passed : false});
    }
});

router.post('/get_opposite' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        const result = await get_opposite(inputs[i]);
        if(result == expected[i]){
            passed ++;
        }
    }
    if(passed == test_cases){
        res.send({ passed : true });
    }else{
        res.send({ passed : false});
    }
});

router.post('/get_pov' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        const result = await get_pov(inputs[i].pov , inputs[i].arrow_direction);
        if(result == expected[i]){
            passed ++;
        }
    }
    if(passed == test_cases){
        res.send({ passed : true });
    }else{
        res.send({ passed : false});
    }
});

router.post('/handle_up_down' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        if(await handle_up_down(inputs[i].incoming , inputs[i].outgoing) == expected[i]){
            passed ++;
        }
    }
    if(passed == test_cases){
        res.send({ passed : true });
    }else{
        res.send({ passed : false});
    }
});

router.post('/get_arrow_dir' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        if(await get_arrow_dir(inputs[i].incoming_str , inputs[i].outgoing_str) == expected[i]){
            passed ++;
        }
    }
    if(passed == test_cases){
        res.send({ passed : true });
    }else{
        res.send({ passed : false});
    }
});

router.post('/is_moving_up_down' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        const result = await is_moving_up_down(inputs[i].incoming , inputs[i].outgoing);
        if(result == expected[i]){
            passed ++;
        }
    }
    if(passed == test_cases){
        res.send({ passed : true });
    }else{
        res.send({ passed : false});
    }
});

router.post('/room_num_to_node_id' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        let result;
        try{ 
            result = await room_num_to_node_id(inputs[i]);
        }catch(error){
            result = "failed to query database";
        }
        if(result == expected[i]){
            passed ++;
        }
    }
    if(passed == test_cases){
        res.send({ passed : true });
    }else{
        res.send({ passed : false});
    }
});

router.post('/get_diff' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;

    async function arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
          if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }

    for(let i = 0 ; i < test_cases ; i ++){
        const result = await get_diff(inputs[i].arr1 , inputs[i].arr2);
        const isEqual = await arraysEqual(result , expected[i]);
     
        if(isEqual){
            passed ++;
        }
    }
    if(passed == test_cases){
        res.send({ passed : true });
    }else{
        res.send({ passed : false});
    }
});

router.post('/dir_string_to_ENUM' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        const result = await dir_string_to_ENUM(inputs[i]);
        if(result == expected[i]){
            passed ++;
        }
    }
    if(passed == test_cases){
        res.send({ passed : true });
    }else{
        res.send({ passed : false});
    }
});

router.post('/break_down_img_path' , async (req , res) => {

    async function same_obj(filepath_obj1 , filepath_obj2){
        return (filepath_obj1.node_id == filepath_obj2.node_id) &&
        (filepath_obj1.x_coor == filepath_obj2.x_coor) &&
        (filepath_obj1.y_coor == filepath_obj2.y_coor) &&
        (filepath_obj1.z_coor == filepath_obj2.z_coor) &&
        (filepath_obj1.pov == filepath_obj2.pov) &&
        (filepath_obj1.arrow_dir == filepath_obj2.arrow_dir) &&
        (filepath_obj1.type == filepath_obj2.type) &&
        (filepath_obj1.room_num == filepath_obj2.room_num);
    }
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        const filepath_obj1 = await break_down_img_path(inputs[i]);
        const filepath_obj2 = expected[i];
        const result = await same_obj(filepath_obj1,filepath_obj2);
        if(result == true){
            passed ++;
        }
    }
    if(passed == test_cases){
        res.send({ passed : true });
    }else{
        res.send({ passed : false});
    }
});

router.post('/get_stairs' , async (req , res) => {

    let result;
    try{ 
        result = await get_stairs();
    }catch(error){
        result = "failed";
    }
    if(result == "failed"){
        res.send({ passed : false });
    }else{
        res.send({ passed : true });
    }

});

router.post('/get_blocked' , async (req , res) => {

    let result;
    try{
        result = await get_blocked();
    }catch(error){
        result = "failed";
    }
    if(result == "failed"){
        res.send({ passed : false });
    }else{
        res.send({ passed : true });
    }

});

router.post('/convert_ENUM_to_angle' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        const result = await convert_ENUM_to_angle(inputs[i]);
        if(result == expected[i]){
            passed ++;
        }
    }
    if(passed == test_cases){
        res.send({ passed : true });
    }else{
        res.send({ passed : false});
    }
});

router.post('/get_non_sheltered' , async (req , res) => {

    let result;
    try{
        result = await get_non_sheltered();
    }catch(error){
        result = "failed";
    }
    if(result == "failed"){
        res.send({ passed : false });
    }else{
        res.send({ passed : true });
    }

});

router.post('/full_query' , async (req , res) => {
    const inputData = req.body;
    
    try {
        const result = await full_query(inputData.source, inputData.destination, inputData.blocked);
        res.send(result);
    } catch (error) {
        res.send(error.message);
        console.error('Error occurred:', error);
    }
});


module.exports = router;

