const express = require('express')
const router = express.Router()
const { spawn } = require('child_process');
require('dotenv/config')
const multer = require('multer');
const { decode } = require('base64-arraybuffer')
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey);
const no_alt_path_url = 'https://bdnczrzgqfqqcoxefvqa.supabase.co/storage/v1/object/public/Pictures/Specials/No_alternate_path.png?t=2024-06-22T15%3A22%3A29.729Z' ;
const database_down_url = 'https://bdnczrzgqfqqcoxefvqa.supabase.co/storage/v1/object/public/Pictures/Specials/No_alternate_path.png?t=2024-06-22T15%3A22%3A29.729Z';
const testing  = false;

class database{
    constructor(){
        this.db = supabase;
        this.feedback = {
            unaltered : true , 
            updated : false , 
            deleted : false ,
            inserted : false
        };
        this.pictures = {
            unaltered : true , 
            updated : false , 
            deleted : false ,
            inserted : false
        };
        this.failedtest = {
            unaltered : true , 
            updated : false , 
            deleted : false ,
            inserted : false
        };
        this.block_shelter = {
            unaltered : true , 
            updated : false , 
            deleted : false ,
            inserted : false
        };
    }

    async get_all_locations(){
        const { data, error } = await this.db
            .from('pictures')
            .select('room_num')
            .eq('pov', 'None')
            .eq('direction', 'None')
            .order('room_num', { ascending: true });
        if (error) {
            throw error;
        }
        return data;
    }

    async insert_feedback(input){
        const { error } = await this.db
            .from('feedback')
            .insert(input);
        if (error) {
            throw error;
        }
        this.feedback.unaltered = false;
        this.feedback.inserted = true;
    }

    async get_failed_locations(){
        const { data, error } = await this.db
            .from('failedtest')
            .select('*');
        if (error) {
            throw error;
        }
        return data;
    }

    async insert_failed_locations(array){
        for (const element of array) {
            
            const { error } = await this.db
                .from('failedtest')
                .insert([{ source: `${element.source}`, destination: `${element.destination}` }]);
            if (error) {
                throw error;
            }
        }
        this.feedback.unaltered = false;
        this.failedtest.inserted = true;
    }

    async delete_failed_locations(){
        const { error } = await this.db
            .from('failedtest')
            .delete()
            .gt('id', 0);

        if (error) {
            throw error;
        }
        this.feedback.unaltered = false;
        this.failedtest.deleted = true;
    }

    async update_blocked_node(node_id){
        const { error } = await this.db
            .from('block_shelter')
            .update({ blocked : true })
            .eq('id', node_id);
        if (error) {
            throw error;
        }
        this.feedback.unaltered = false;
        this.feedback.updated = true;
    }

    async get_z_coordinate(inputData){
        const { data, error } = await this.db
                .from('pictures')
                .select('z_coordinate')
                .eq('node_id', inputData)

                
            if (error) {
                throw error;
            }
            
        return data[0]['z_coordinate'];
    }

    async get_filepath_using_unique_id(unique_id){
        const { data, error } = await this.db
                .from('pictures')
                .select('filepath')
                .eq('unique_id', unique_id);
            if (error) {
                throw error;
            }
        return data[0]['filepath'];
    }

    async check_for_stairs(inputData){
        const { data, error } = await this.db
            .from('pictures')
            .select('node_id' , 'self_type')
            .in('node_id', inputData)
        if (error) {
            throw error;
        }
        return data;
    }

    async check_for_sheltered(inputData){
        const { data, error } = await this.db
            .from('block_shelter')
            .select('id' , 'sheltered')
            .in('id', inputData)
        if (error) {
            throw error;
        }

        return data;
    }

    async room_num_to_node_id(room_number){
        if(typeof(room_number) == "string"){
            try {
                
                const { data, error } = await this.db
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

    async node_id_to_room_num(node_id){
        if(typeof(node_id) == "number"){
            try {
               
                const { data, error } = await supabase
                    .from('pictures')
                    .select('room_num')
                    .eq('node_id', node_id);
                if (error) {
                    throw error;
                }
                return data[0].room_num;
    
            } catch (error) {
                throw new Error("node_id to room_num cannot query database");
            } 
        }else{
            return node_id;
        }
    }

    async get_non_sheltered(){
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
                non_sheltered.push(element.id);
            }
            return non_sheltered;
    
        } catch (error) {
            throw new Error("get_non_sheltered cannot query database");
        }
    }

    async get_blocked(){
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
                blocked_array.push(element.id);
            }
            return blocked_array;
    
        } catch (error) {
            throw new Error("get_blocked cannot query database");
        }
    }

    async get_stairs(){
        try {
            const { data, error } = await supabase
                .from('pictures')
                .select('node_id')
                .eq('self_type', 'Stairs');
            if (error) {
                throw error;
            }
            let stairs = [];
            for(const element of data){
                stairs.push(element.node_id);
            }
            stairs = [...new Set(stairs)];
            return stairs;
    
        } catch (error) {
            throw new Error("get_stairs cannot query database");
        }
    }

    async get_type(node_id){
        try {
            const { data, error } = await this.db
                .from('pictures')
                .select('self_type')
                .eq('node_id', node_id);
                
            if (error) {
                throw error;
            }

            return data[0]['self_type'];
        } catch (error) {
            return "cannot get the type of node"
        }
    }

    async get_type(node_id){

        try {
            const { data, error } = await this.db
                .from('pictures')
                .select('self_type')
                .eq('node_id', node_id);
              
            return data[0]['self_type'];
        } catch (error) {
            return "NIL";
        }
    }

    log_changes(){
        if(!this.feedback.unaltered){
            console.log(`feedback table : `);
            if(!this.feedback.updated){
                process.stdout.write(`UPDATED`);
            }
            if(!this.feedback.deleted){
                process.stdout.write(`DELETED`);
            }
            if(!this.feedback.inserted){
                process.stdout.write(`INSERTED`);
            }
        }
        if(!this.pictures.unaltered){
            console.log(`pictures table : `);
            if(!this.pictures.updated){
                process.stdout.write(`UPDATED`);
            }
            if(!this.pictures.deleted){
                process.stdout.write(`DELETED`);
            }
            if(!this.pictures.inserted){
                process.stdout.write(`INSERTED`);
            }
        }
        if(!this.failedtest.unaltered){
            console.log(`failedtest table : `);
            if(!this.failedtest.updated){
                process.stdout.write(`UPDATED`);
            }
            if(!this.failedtest.deleted){
                process.stdout.write(`DELETED`);
            }
            if(!this.failedtest.inserted){
                process.stdout.write(`INSERTED`);
            }
        }
        if(!this.block_shelter.unaltered){
            console.log(`block_shelter table : `);
            if(!this.block_shelter.updated){
                process.stdout.write(`UPDATED`);
            }
            if(!this.block_shelter.deleted){
                process.stdout.write(`DELETED`);
            }
            if(!this.block_shelter.inserted){
                process.stdout.write(`INSERTED`);
            }
        }
    }
}

const supa = new database();

function debug_log(input){
    if(testing){
        console.log(input);
    }
}

async function template_instructions(distance , arrow_direction , levels , node_id , track_floor){
    
    arrow_direction = await ENUM_to_left_right(arrow_direction);
    
    distance = parseInt(distance);
    if(arrow_direction == 'Down' || arrow_direction == 'Up'){

        const start_end = await track_floor.get_floor(node_id , levels , arrow_direction);

        if(start_end.start == 0 && start_end.end == 0){
            return `Go ${arrow_direction} ${levels} level`;  /*****/
        }

        if(start_end.start == 0){
            start_end.start = 'B1';
        }else if(start_end.end == 0){
            start_end.end = 'B1';
        }
        return `Go ${arrow_direction} ${levels} level from level ${start_end.start} to level ${start_end.end}`;
    }else if(arrow_direction == 'Straight' || arrow_direction == 'None'){

        const type = await supa.get_type(node_id);

        if(type == 'Elevator' || type == 'Stairs'){
            return `Exit the ${type}`;
        }

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

async function get_diff(expected , query){
    const  queried = query.map(num => num.toString());
    const set1 = new Set(expected);
    const set2 = new Set(queried);

    for (let item of set2) {
        set1.delete(item);
    }
    return Array.from(set1);
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
            return "cannot convert";
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
        const inputObj = { source : source , destination : destination , blocked : blocked_nodes , getMapObj : false};
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
                
                if(testing){
                    
                    const containsValue = nodes.some(value => parseInt(value, 10) > 648);
                    if(!containsValue){
                        const skipFormat = {
                            Expected : 0 ,
                            Queried : 0 , 
                            HTML : 0 ,
                            Distance : 0 ,
                            Dist_array : 0 , 
                            nodes_path : 0 , 
                            Instructions : 0 ,
                            compressed_path : 0
                        }
                        resolve(skipFormat);
                    }
                }
                
                let nodes_path = [...nodes];
                let compressed_path  = [...nodes];
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
                let splice_count = 0;
                let is_exit = true;
                const start_direction = await get_arrow_dir(directions[0] , directions[1]);
                if(start_direction == '7'){
                    is_exit = true;
                }else{
                    is_exit = false;
                }
                for(i = 1 ; i < directions_array_len ; i ++){
                    
                    let is_up_down = await is_moving_up_down(directions[i-1] , directions[i]);    
                    if(((directions[i-1] == directions[i] && (parseInt(dist_array[i-1]) + parseInt(dist_array[i])) <= 80) || is_up_down) && !is_exit){
                        do{
                            nodes.splice(i,1);
                            compressed_path.splice(i,1);
                            if(is_up_down){
                                nodes_path.splice(i + splice_count,1);
                            }else{
                                splice_count ++;
                            }
                            
                            directions.splice(i,1);
                            dist_array[i-1] = `${parseInt(dist_array[i-1]) + parseInt(dist_array.splice(i,1))}`;
                            directions_array_len --;
                            is_up_down = await is_moving_up_down(directions[i-1] , directions[i]);
                        }while((directions[i-1] == directions[i] && (parseInt(dist_array[i-1]) + parseInt(dist_array[i])) <= 80) || is_up_down)
                        Instructions[i-1].levels = parseInt(dist_array[i-1])/40;
                        Instructions[i-1].distance = dist_array[i-1];
                        i--;
                    }else{
                        let pov = await get_pov(directions[i-1] , directions[i]); 
                        let direction = await get_arrow_dir(directions[i-1] , directions[i]);
                        if(direction == '7'){
                            is_exit = true;
                        }else{
                            is_exit = false;
                        }
                        const current_node_id = nodes[i];
                        nodes[i] += pov;
                        nodes[i] += direction;
                        let instructions_obj = { 
                            distance : dist_array[i] , 
                            arrow_direction : direction ,
                            levels : parseInt(dist_array[i])/40 ,
                            node_id : current_node_id
                        }
                        Instructions.push(instructions_obj);
                    }
                }
                
                nodes[directions.length] += "67";
                Instructions.push('');

                debug_log("nodes : ");
                debug_log(nodes);
                debug_log(directions);

                debug_log("uncompressed path : ")
                debug_log(nodes_path);
                debug_log("compressed path : ")
                debug_log(compressed_path)
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
                const debug_array = new Array(data_length).fill("");
                let debug_array_index = 0;
                data.forEach(async result => {
                    let index = 0;
                    for(let i = 0 ; i < data_length ; i ++){
                        if(result.unique_id == parseInt(nodes[i])){
                            index = i;
                            break;
                        }
                    }
                    const imgHTML = result.filepath;             
                    fixedLengthArray[index] = imgHTML;
                    debug_array[debug_array_index] = result.unique_id;
                    debug_array_index++;
                });
                
                const final = fixedLengthArray.join(' ');
                debug_log("diff is ");
                debug_log(get_diff(nodes , debug_array));

                const FinalResults = {
                    Expected : nodes.length ,
                    Queried : data_length , 
                    HTML : final ,
                    Distance : distance ,
                    Dist_array : dist_array , 
                    nodes_path : nodes_path , 
                    Instructions : Instructions ,
                    compressed_path : compressed_path
                }
                resolve(FinalResults);
            } catch (error) {
                reject(error);
            }
        });
        
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
        const inputObj = { source : source , destination : destination , blocked : blocked_nodes , getMapObj : false};
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
                let compressed_path  = [...nodes];
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
                let splice_count = 0;
                let is_exit = true;
                const start_direction = await get_arrow_dir(directions[0] , directions[1]);
                if(start_direction == '7'){
                    is_exit = true;
                }else{
                    is_exit = false;
                }
                for(i = 1 ; i < directions_array_len ; i ++){
                    
                    let is_up_down = await is_moving_up_down(directions[i-1] , directions[i]);
                    if(((directions[i-1] == directions[i] && (parseInt(dist_array[i-1]) + parseInt(dist_array[i])) <= 80) || is_up_down) && !is_exit){
                        
                        do{
                            nodes.splice(i,1);
                            compressed_path.splice(i,1);
                            if(is_up_down){
                                nodes_path.splice(i + splice_count,1);
                            }else{
                                splice_count ++;
                            }
                            directions.splice(i,1);
                            dist_array[i-1] = `${parseInt(dist_array[i-1]) + parseInt(dist_array.splice(i,1))}`;
                            directions_array_len --;
                            is_up_down = await is_moving_up_down(directions[i-1] , directions[i]);
                        }while((directions[i-1] == directions[i] && (parseInt(dist_array[i-1]) + parseInt(dist_array[i])) <= 80) || is_up_down)
                        Instructions[i-1].levels = parseInt(dist_array[i-1])/40;
                        Instructions[i-1].distance = dist_array[i-1];
                        i--;
                    }else{
                        let pov = await get_pov(directions[i-1] , directions[i]); 
                        let direction = await get_arrow_dir(directions[i-1] , directions[i]);
                        if(direction == '7'){
                            is_exit = true;
                        }else{
                            is_exit = false;
                        }
                        const current_node_id = nodes[i];
                        nodes[i] += pov;
                        nodes[i] += direction;
                        let instructions_obj = { 
                            distance : dist_array[i] , 
                            arrow_direction : direction ,
                            levels : parseInt(dist_array[i])/40 ,
                            node_id : current_node_id
                        }
                        Instructions.push(instructions_obj);
                    }
                }
                nodes[directions.length] += "67";

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
                const debug_array = new Array(data_length).fill("");
                let debug_array_index = 0;
                data.forEach(async result => {
                    let index = 0;
                    for(let i = 0 ; i < data_length ; i ++){
                        if(result.unique_id == parseInt(nodes[i])){
                            index = i;
                            break;
                        }
                    }
                    const imgHTML = result.filepath;             
                    fixedLengthArray[index] = imgHTML;
                    debug_array[debug_array_index] = result.unique_id;
                    debug_array_index++;
                });

                fixedLengthArray.pop();
                nodes_path.pop();
                nodes.pop();
                compressed_path.pop()
                data_length -= 1;
                const final = fixedLengthArray.join(' ');
                const FinalResults = {
                    Expected : nodes.length ,
                    Queried : data_length , 
                    HTML : final ,
                    Distance : distance ,
                    Dist_array : dist_array , 
                    nodes_path : nodes_path , 
                    Instructions : Instructions ,
                    compressed_path : compressed_path
                }
                resolve(FinalResults);
            } catch (error) {
                reject(error);
            }
        });
        
        cppProcess.on('error', (error) => {
            console.error('Error executing C++ process:', error);
        });

        cppProcess.on('exit', (code) => {
            debug_log(`C++ process exited with code: ${code}`);
        });
    })
}

async function get_b4_blocked_unique_id_from_array(unique_id , array){
    for(let i = 0 ; i < array.length ; i++){
        if(array[i] == unique_id){
            if(i-1 >= 0){
                return array[i-1];
            }
            return  "";
        }
    }
    return "";
}

async function remove_weburl(filepath){
    const components = filepath.split("/");
    return components[components.length - 1];
}

class building_floor{
    constructor(building , floor){
        this.current_building = building;
        this.current_floor = floor;
        this.floor_map = { EA : 40 , E1 : 160 , E1A : 160 , E2 : 320 , E2A : 360 , E3 : 80 , E4 : 160 , E4A : 40 , C1 : 200 , E5 : 280}
    }

    async get_floor(node_id , levels , ENUM_dir){
        
        const node_building = await this.get_building(node_id);

        if(node_building == 'no such node'){
            if(ENUM_dir == 'Up'){
                this.current_floor += levels;
            }else{
                this.current_floor -= levels;
            }
            return { start : 0 , end : 0};
        }else if(node_building == this.current_building){
            const old_floor = this.current_floor;
            if(ENUM_dir == 'Up'){
                this.current_floor += levels;
            }else{
                this.current_floor -= levels;
            }
            return { start : old_floor , end : this.current_floor}
        }else{
            const level_diff = (this.floor_map[`${node_building}`] - this.floor_map[`${this.current_building}`])/40;
            this.current_building = node_building;
            this.current_floor -= level_diff;
            const old_floor = this.current_floor;
            if(ENUM_dir == 'Up'){
                this.current_floor += levels;
            }else{
                this.current_floor -= levels;
            }
            return { start : old_floor , end : this.current_floor}
        }
    }

    async get_building(node_id){
        const { data, error } = await supabase
            .from(`elevator_building`)
            .select('building')
            .eq('id', node_id);
        if (error) {
            throw error;
        }

        if(data.length == 0){
            return 'no such node'
        }
        return data[0]['building'];
    }
}

class Result{
    constructor(){
        this.Expected = 0;
        this.Queried = 0 ; 
        this.HTML = "" ;
        this.Distance = 0 ;
        this.Dist_array = [] ;
        this.nodes_path = [] ;
        this.compressed_nodes_path = [];
        this.Stops_index = [] ;
        this.Instructions = [] ;
        this.passed = true ;
    }

    async add(other){
        this.Expected += other.Expected;
        this.Queried += other.Queried ; 
        if(this.HTML == ""){
            this.HTML += other.HTML;
        }else{
            this.HTML = this.HTML + " " + other.HTML ;
        }
        this.Distance = `${parseInt(this.Distance) + parseInt(other.Distance)}` ;
        this.Dist_array = this.Dist_array.concat(other.Dist_array);
        this.nodes_path = this.nodes_path.concat(other.nodes_path);
        this.compressed_nodes_path = this.compressed_nodes_path.concat(other.compressed_path);
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
            compressed_nodes_path : this.compressed_nodes_path ,
            Stops_index : this.Stops_index , 
            Instructions : this.Instructions ,
            passed : this.passed
        }
    }

    async convert_to_instructions(first_room){
        const break_down_room_num = first_room.split("-");
        let building = 'EA';
        let floor = 0;
        if(break_down_room_num.length <= 2){
            const components = await this.get_room_mapping(first_room);
            building = components.building;
            floor = components.floor;
        }else{
            building = break_down_room_num[0];
            floor = parseInt(break_down_room_num[1].split("")[1])
        }
        const track_floor = new building_floor(building , floor);
        for(let i = 0 ; i < this.Instructions.length ; i ++){
            let instructions_obj = this.Instructions[i];
            if(instructions_obj != ''){
                this.Instructions[i] = await template_instructions(instructions_obj.distance , instructions_obj.arrow_direction , instructions_obj.levels , instructions_obj.node_id , track_floor);
            }
        }
    }

    async get_room_mapping(room_name){
        const { data, error } = await supabase
            .from('room_mapping')
            .select('building , floor')
            .eq('room_name', `${room_name}`)
        if (error) {
            throw error;
        }
        return { building : data[0].building , floor : data[0].floor };
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
  res.send("Message sent. Thank you.")
})

router.post('/locations' , async(req,res) => {
    try {
        const data = await supa.get_all_locations();
        
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

        await supa.insert_feedback(input);
      
    } catch (error) {
        res.status(500).send({ message : 'Failed to add data to database.' }); 
    }

    res.send({ message : "Thank you for your feedback!" }) 
})

router.post('/FailedLocations' , async(req,res) => {
    try {
        const data = await supa.get_failed_locations();
        
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

        await supa.insert_failed_locations(AllFailedLocations);

        res.send({ message : 'Data added to database successfully.' }); 
    } catch (error) {
        res.status(500).send({ message : 'Failed to append data to database.'}); 
    }
});

router.post('/DeleteFailedLocations', async (req, res) => {

    try {

        await supa.delete_failed_locations();

        res.send({ message : 'Data deleted from database successfully.'}); 
    } catch (error) {
        res.status(500).send({ message : 'Failed to delete data from database.'}); 
    }
});

router.post('/formPost' , async (req ,res) => { 

    const inputData = req.body;
    
    let destinations = inputData.MultiStopArray;
    const first_room = destinations[0];
    let mergedArray = [];
    if(inputData.MultiStopArray.length < 2){

        return res.send({HTML : no_alt_path_url , passed : false , error_can_handle : false , message : "no destination"});
    }

    try{
        
        for(let i =  0; i < destinations.length ; i ++){
            destinations[i] = await supa.room_num_to_node_id(destinations[i]);
        }

        if(!testing){
            let blocked_array = await supa.get_blocked();

            for(let i = 0 ; i < inputData.blocked_array.length ; i++){
                blocked_array.push(inputData.blocked_array[i]);
            }
            let non_sheltered = [];
            if(inputData.sheltered){
                non_sheltered = await supa.get_non_sheltered();
            }
            let stairs = [];
            if(inputData.NoStairs){
                stairs = await supa.get_stairs();
            }
            mergedArray = Array.from(new Set([...blocked_array, ...non_sheltered , ...stairs]));
        }
    }catch(error){
        return res.send({HTML : database_down_url , passed : false , error_can_handle : false , message : "query error"});
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

        } catch(error){
            
            if(error.message == "cannot find dest"){
                return res.send({HTML : no_alt_path_url , passed : false , error_can_handle : true , message : error.message});
            }
            return res.send({HTML : no_alt_path_url , passed : false , error_can_handle : false , message : error.message});
        }
    }
    
    await TotalResult.convert_to_instructions(first_room);
    return res.send(TotalResult.get_object());
});

router.post('/blockRefresh' , async (req ,res) => { 
    
    const inputData = req.body;
    
    let destinations = inputData.MultiStopArray;
    const first_room = destinations[0];
    if(inputData.MultiStopArray.length < 2){

        return res.send({HTML : no_alt_path_url , passed : false , error_can_handle : false , message : "no destination"});
    }
    let blocked_node_component;
    let mergedArray;
    try{
        for(let i =  0; i < destinations.length ; i ++){
            destinations[i] = await supa.room_num_to_node_id(destinations[i]);
        }

        destinations.splice(0,1);
        while(inputData.Stops_index[0] < inputData.BlockedNodeIndex){
            destinations.splice(0,1);
            inputData.Stops_index.splice(0,1);
        }
        

        blocked_node_component = await break_down_img_path(inputData.blocked_img_path);

        if(blocked_node_component.type == 'Room'){
            return res.send({ HTML : no_alt_path_url , passed : false , error_can_handle : false , message : "cannot block room"});
        }
        
        const b4_blocked_node_id = await get_b4_blocked_unique_id_from_array(blocked_node_component.node_id , inputData.Node_id_array);
        if(b4_blocked_node_id == ""){
            return res.send({HTML : no_alt_path_url , passed : false , error_can_handle : false , message : "cannot get previous node before blocked"});
        }
        destinations.unshift(parseInt(b4_blocked_node_id));
        

        let blocked_array = await supa.get_blocked();

        for(let i = 0 ; i < inputData.blocked_array.length ; i++){
            blocked_array.push(inputData.blocked_array[i]);
        }
        let non_sheltered = [];
        if(inputData.sheltered){
            non_sheltered = await supa.get_non_sheltered();
        }
        let stairs = [];
        if(inputData.NoStairs){
            stairs = await supa.get_stairs();
        }
        mergedArray = Array.from(new Set([...blocked_array, ...non_sheltered , ...stairs]));
    }catch(error){
        return res.send({HTML : database_down_url , passed : false , error_can_handle : false , message : "query error"});
    }
    let TotalResult = new Result();
   
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
            
            if(error.message == "cannot find dest"){
                return res.send({HTML : no_alt_path_url , passed : false , error_can_handle : true , message : error.message});
            }
          
            return res.send({ HTML : no_alt_path_url , passed : false , error_can_handle : false , message : error.message});

        }
    }
    await TotalResult.convert_to_instructions(first_room);
    let TotalResultObj = TotalResult.get_object();

    for (let i = 0; i < destinations.length ; i ++) {
        destinations[i] = await supa.node_id_to_room_num(destinations[i]);
    }
    TotalResultObj['Destinations'] = destinations;
    return res.send(TotalResultObj);
});

router.post('/insertBlocked' , async (req ,res ) => {
    const input = req.body.img_string;
    const node_string = input.split("_");
    const node_id = parseInt(node_string[0]);
    
    try {

        await supa.update_blocked_node(node_id);

        res.send({ message : 'Data added to database successfully.' , node : node_id} ); 
    } catch (error) {
        res.status(500).send( { message : 'Failed to append data to database.'  , node : node_id}); 
    }
});

router.post('/getfloor' , async (req , res) => {
    const inputData = req.body.node_id; 
    let targeted_z = 0;
    let nodes_with_same_z = [];
    let node_label_map = {};
    try {
        targeted_z = await supa.get_z_coordinate(inputData);
    } catch (error) {
        console.log("error");
        res.status(500).json({ error: error.message });
    }
    
    try {
        const { data, error } = await supabase
            .from('z_map')
            .select('node_id , self_type')
            .eq('z_coordinate', targeted_z);

            data.forEach(result => {
                nodes_with_same_z.push(result.node_id);
                node_label_map[`${result.node_id}`] = result.self_type;
            });
        if (error) {
            throw error;
        }
    } catch (error) {
        console.log("error");
        res.status(500).json({ error: error.message });
    }

    const inputObj = { nodes : [...nodes_with_same_z] , getMapObj : true};
    const serializedData = JSON.stringify(inputObj);
    const cppProcess = spawn(__dirname + '/../Dijkstra/main' , []);
    cppProcess.stdin.write(serializedData);
    cppProcess.stdin.end();
    
    cppProcess.stdout.on('data', async (cpp_data) => {
        
        try{
            let outputData = cpp_data.toString().split("|");
            outputData.pop();
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
            console.log("error");
        }
        
        cppProcess.on('error', (error) => {
            console.error('Error executing C++ process:', error);
        });

        cppProcess.on('exit', (code) => {
            debug_log(`C++ process exited with code: ${code}`);
        });
    });

});

router.post('/convert_unique_id_filename' , async(req , res) => {
    const inputData = req.body;
    
    try {
        let filepath = "";
        const file = await supa.get_filepath_using_unique_id(inputData.unique_id);
        filepath = await remove_weburl(file);
        res.send({filepath : filepath});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/get_image_links' , async(req, res) => {
    const link_array = [];
  
    try {
      const { data, error } = await supabase
        .from('image_links')
        .select('*')
        
        for(let result of data){
            img_name = await remove_weburl(result.filepath);
            link_array.push(`${img_name}`);
        };

        if (error) {
            throw error;
        }

        res.send({link_array : link_array});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.post('/blocked_img', upload.single('photo'), async(req, res) => {
    try {

        const file = req.file;
        const fileBase64 = decode(file.buffer.toString("base64"));
        
        const { data, error } = await supabase
            .storage
            .from('Pictures')
            .upload(`Block_uploads/${file.originalname}`, fileBase64, {
                contentType: file.mimetype,
            });

        if(error){
            throw error;
        }
        const { data: image } = supabase.storage
            .from("Pictures")
            .getPublicUrl(data.path);


        try{
            const components = await break_down_img_path(file.originalname);

            const { error } = await supabase
                .from('blocked_image')
                .insert([{ node_id : components.node_id , filepath : image.publicUrl }]);
            if (error) {
                throw error;
            }
        }catch(error){

        }

        res.status(200).send('Image uploaded successfully, thank you for helping make NavEng up to date for users');
    } catch (err) {
      res.status(500).send('Error uploading image');
    }
});

router.post('/convert__to_-' , async(req, res) => {
    try{
        let image_links = [];
        const folder_name = "test";
        const { data, error } = await supabase
            .storage
            .from('Pictures')
            .list(`${folder_name}`, {
                limit: 1500 ,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' }
            })
            
        if(error){ throw error } 
        
        for(let objs of data){
            let img_name = objs.name;
            image_links.push(img_name);
        }
        
        let new_name = "";
        for(let name of image_links){
            const old_name = name;
            name = name.split("_");
            for(let i = 0 ; i < name.length ; i++){
                if(name[i] == 'Room'){
                    let last_comp = name.splice(name.length - 3 , 3);
                    last_comp = last_comp.join("-");
                    name.push(last_comp);
                }
            }
            for(let i = 0 ; i < name.length ; i++){
                if(name[i] == ''){
                    name.splice(i,1);
                    name[i] = "-" + name[i];
                    new_name = name.join("_");
                    break;
                }
            }
            const { data, error } = await supabase
            .storage
            .from('Pictures')
            .move(`${folder_name}/${old_name}`, `test1/${new_name}`);

            if(error){ throw error } 
            res.send("done");
        }
    }catch(error){
        res.send(error);
    }
    
});

router.post('/checkforstairs' , async(req, res) => {
    try{

        const inputData = req.body;
        const data = await supa.check_for_stairs(inputData);
        for(let result of data){
            if(result.self_type == 'Stairs'){
                res.send({ NoStairs : false})
            }
        }

        res.send({ NoStairs : true})
    }catch(error){
        res.send({ NoStairs : false})
    }
    
});

router.post('/checkforsheltered' , async(req, res) => {
    try{

        const inputData = req.body;
        const data = await supa.check_for_sheltered(inputData);
        for(let result of data){
            if(result.sheltered == false){
                res.send({ sheltered : false})
            }
        }

        res.send({ sheltered : true})
    }catch(error){
        res.send({ sheltered : false})
    }
    
});

//////////////////////////////////////////////////////////////////////////////
///////////////////////function testing region////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

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
            result = await supa.room_num_to_node_id(inputs[i]);
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

router.post('/node_id_to_room_num' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        let result;
        try{ 
            result = await supa.node_id_to_room_num(inputs[i]);
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
        result = await supa.get_stairs();
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
        result = await supa.get_blocked();
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
        result = await supa.get_non_sheltered();
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

router.post('/angle_to_string_dir' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        const result = await angle_to_string_dir(inputs[i]);
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

router.post('/remove_weburl' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        const result = await remove_weburl(inputs[i]);
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

router.post('/get_b4_blocked_unique_id_from_array' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        const result = await get_b4_blocked_unique_id_from_array(inputs[i].query , inputs[i].array);
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

router.post('/template_instructions' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    const track_floor = new building_floor('E4' , 7);
    for(let i = 0 ; i < test_cases ; i ++){
        const result = await template_instructions(inputs[i].distance , inputs[i].arrow , inputs[i].levels , inputs[i].node_id , track_floor);
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

router.post('/ENUM_to_left_right' , async (req , res) => {
    const inputs = req.body.Input;
    const expected = req.body.Expected;
    const test_cases = inputs.length;
    let passed = 0;
    for(let i = 0 ; i < test_cases ; i ++){
        const result = await ENUM_to_left_right(inputs[i]);
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

module.exports = router;

