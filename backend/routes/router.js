const express = require('express')
const router = express.Router()
const { spawn } = require('child_process');
require('dotenv/config')
const multer = require('multer');
const path = require('path');

const { createClient } = require('@supabase/supabase-js');
const { fail } = require('assert');

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey);

let blocked_node = ""

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
            return "not NESW";
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
            res.status(500).json({ error: error.message });
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
        // Query the 'users' table for a specific user by ID
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
        console.log(error);
    }
}

async function get_non_sheltered(){
    try {
        // Query the 'users' table for a specific user by ID
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
        console.log(error);
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

router.post('/feedback' , async(req,res) => {
    const {feedbackType, bugDetails, blockedNode, sourceLocation, destinationLocation, nodes} = req.body
    try {
        let input = [{feedback_type : null , bug_details : null , blocked_node : null , source_location : null , destination_location : null , nodes : null}];

        if(feedbackType == "Report bug with website"){
            input = [{feedback_type : feedbackType , bug_details : bugDetails , blocked_node : null , source_location : null , destination_location : null , nodes : null}];    
        }else if(feedbackType == "Suggest a better path"){
            input = [{feedback_type : feedbackType , bug_details : null , blocked_node : null , source_location : null , destination_location : null , nodes : nodes}];    
        }else if(feedbackType == "Report blocked location"){
            input = [{feedback_type : feedbackType , bug_details : null , blocked_node : blockedNode , source_location : sourceLocation , destination_location : destinationLocation , nodes : null}];    
        }

        const { error } = await supabase
            .from('feedback')
            .insert(input);
        if (error) {
            throw error;
        }
        console.log('Data added to database successfully.');
        //res.send('Data added to database successfully.'); 
    } catch (error) {
        console.error('Error appending data to database:', error);
        //res.status(500).send('Failed to append data to database.'); 
    }

    //console.log('feedback type:' + feedbackType)
    //console.log('bug details:' + bugDetails)
    //console.log('blocked node:'+ blockedNode)
    //console.log('source location:'+ sourceLocation)
    //console.log('destination location: '+ destinationLocation)
    //console.log('path nodes: '+ nodes)

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

        console.log('Data added to database successfully.');
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

        console.log('Data deleted from database successfully.');
        res.send('Data deleted from database successfully.'); 
    } catch (error) {
        console.error('Error deleting data from database:', err);
        res.status(500).send('Failed to delete data from database.'); 
    }
});

router.post('/formPost' , async (req ,res) => { 
    //add to formPost input ,  elements = new added node 
    const inputData = req.body;

    function debug_log(input){
        if(inputData.Debugging){
            console.log(input);
        }
    }

    //checking for empty input
    if(!inputData.source || !inputData.destination){
        console.log("data incorrectly labelled or source and destination not filled")  
        return;
    }

    let blocked_array = await get_blocked();
    if(inputData.current_blocked !== ''){
        blocked_array.push(inputData.current_blocked - 1);
    }
    let non_sheltered = [];
    if(inputData.sheltered){
        non_sheltered = await get_non_sheltered();
    }
    let mergedArray = Array.from(new Set([...blocked_array, ...non_sheltered]));
    debug_log(mergedArray);

    
    debug_log(inputData);
    debug_log(typeof(inputData.source));
    inputData.source = await room_num_to_node_id(inputData.source);
    inputData.destination = await room_num_to_node_id(inputData.destination);
    debug_log(inputData);
    const inputObj = { source : inputData.source , destination : inputData.destination , blocked : mergedArray};
    debug_log(inputObj);
    const serializedData = JSON.stringify(inputObj);
    const cppProcess = spawn(__dirname + '/../Dijkstra/main' , []);
    cppProcess.stdin.write(serializedData);
    cppProcess.stdin.end();
    
    cppProcess.stdout.on('data', async (data) => {
        debug_log(data.toString());
        const outputData = data.toString().split("|");
        let nodes = outputData[0].split(",");
        const directions = outputData[1].split(",");
        let distance = outputData[2].split(",");
        let dist_array = outputData[3].split(",");
        nodes[0] += "67";
        let directions_array_len = directions.length;
        for(i = 1 ; i < directions_array_len ; i ++){
            const is_up_down = await is_moving_up_down(directions[i-1] , directions[i])
            if(is_up_down){
                nodes.splice(i,1);
                directions.splice(i,1);
                i --;
                directions_array_len --;
            }else{
                let pov = await get_pov(directions[i-1] , directions[i]); 
                let direction = await get_arrow_dir(directions[i-1] , directions[i]);
                nodes[i] += pov;
                nodes[i] += direction;
            }
        }
        nodes[directions.length] += "67";
        debug_log(directions);
        debug_log(nodes);
        debug_log(`Expected : ${nodes.length}`);
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
            data.forEach(async result => {
                let index = 0;
                for(let i = 0 ; i < data_length ; i ++){
                    if(result.unique_id == parseInt(nodes[i])){
                        index = i;
                        break;
                    }
                }
                const imgHTML = template_img(result.filepath);
                //debug_log(imgHTML);              
                fixedLengthArray[index] = imgHTML;
                debug_array[debug_array_index] = result.unique_id;
                debug_array_index++;
            });
            //debug_log(`this is fixedlengtharray : ${fixedLengthArray}`);
            debug_log(debug_array);
            debug_log(`Queried : ${debug_array.length}`);
            debug_log(get_diff(nodes , debug_array));
            const final = fixedLengthArray.join('');
            const FinalResults = {
                Expected : nodes.length ,
                Queried : data_length , 
                HTML : final ,
                Distance : distance ,
                Dist_array : dist_array
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
    debug_log(`C++ process exited with code: ${code}`);
  });
  
});

router.post('/blockRefresh' , async (req ,res) => { 
    //add to formPost input ,  elements = new added node 
    const inputData = req.body;

    function debug_log(input){
        if(inputData.Debugging){
            console.log(input);
        }
    }

    //checking for empty input
    if(!inputData.source || !inputData.destination){
        console.log("data incorrectly labelled or source and destination not filled")  
        return;
    }

    let blocked_array = await get_blocked();
    if(inputData.current_blocked !== ''){
        blocked_array.push(inputData.current_blocked - 1);
    }
    let non_sheltered = [];
    if(inputData.sheltered){
        non_sheltered = await get_non_sheltered();
    }
    let mergedArray = Array.from(new Set([...blocked_array, ...non_sheltered]));
    debug_log(mergedArray);

    
    debug_log(inputData);
    debug_log(typeof(inputData.source));
    inputData.source = await room_num_to_node_id(inputData.source);
    inputData.destination = await room_num_to_node_id(inputData.destination);
    const previous_node = await break_down_img_path(inputData.b4_blocked_img_path);
    debug_log(inputData);
    const inputObj = { source : inputData.source , destination : inputData.destination , blocked : mergedArray};
    debug_log(inputObj);
    const serializedData = JSON.stringify(inputObj);
    const cppProcess = spawn(__dirname + '/../Dijkstra/main' , []);
    cppProcess.stdin.write(serializedData);
    cppProcess.stdin.end();
    
    cppProcess.stdout.on('data', async (data) => {
        debug_log(data.toString());
        const outputData = data.toString().split("|");
        let nodes = outputData[0].split(",");
        const directions = outputData[1].split(",");
        let distance = outputData[2].split(",");
        let dist_array = outputData[3].split(",");
        nodes[0] += await dir_string_to_ENUM(previous_node.pov);
        nodes[0] += await dir_string_to_ENUM(previous_node.arrow);
        let directions_array_len = directions.length;
        for(i = 1 ; i < directions_array_len ; i ++){
            const is_up_down = await is_moving_up_down(directions[i-1] , directions[i])
            if(is_up_down){
                nodes.splice(i,1);
                directions.splice(i,1);
                i --;
                directions_array_len --;
            }else{
                let pov = await get_pov(directions[i-1] , directions[i]); 
                let direction = await get_arrow_dir(directions[i-1] , directions[i]);
                nodes[i] += pov;
                nodes[i] += direction;
            }
        }
        nodes[directions.length] += "67";
        debug_log(directions);
        debug_log(nodes);
        debug_log(`Expected : ${nodes.length}`);
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
            data.forEach(async result => {
                let index = 0;
                for(let i = 0 ; i < data_length ; i ++){
                    if(result.unique_id == parseInt(nodes[i])){
                        index = i;
                        break;
                    }
                }
                const imgHTML = template_img(result.filepath);
                //debug_log(imgHTML);              
                fixedLengthArray[index] = imgHTML;
                debug_array[debug_array_index] = result.unique_id;
                debug_array_index++;
            });
            //debug_log(`this is fixedlengtharray : ${fixedLengthArray}`);
            debug_log(debug_array);
            debug_log(`Queried : ${debug_array.length}`);
            debug_log(get_diff(nodes , debug_array));
            const final = fixedLengthArray.join('');
            const FinalResults = {
                Expected : nodes.length ,
                Queried : data_length , 
                HTML : final ,
                Distance : distance ,
                Dist_array : dist_array
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
    debug_log(`C++ process exited with code: ${code}`);
  });
  
});

router.post('/insertBlocked' , async (req ,res ) => {
    const input = req.body.img_string;
    console.log("input is : " + input)
    const node_string = input.split("_");
    const node_id = parseInt(node_string[0]);
    
    try {
        const { error } = await supabase
        .from('block_shelter')
        .update({ blocked : true })
        .eq('id', node_id);
        console.log('Data added to database successfully.');
        console.log('Blocked ID is : ' + node_id)
        res.send({ message : 'Data added to database successfully.' , node : node_id} ); 
    } catch (error) {
        console.error('Error appending data to database:', err);
        res.status(500).send( { message : 'Failed to append data to database.'  , node : node_id}); 
    }
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


/////////////////////////////////////////////////////////////////////////
//////////////////function testing region////////////////////////////////
/////////////////////////////////////////////////////////////////////////
router.post('/blocked_img', upload.single('photo'), (req, res) => {
    try {
      // File is uploaded successfully, you can process further if needed
      console.log('image uploaded:', req.file);
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
        const result = await room_num_to_node_id(inputs[i]);
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


module.exports = router;

