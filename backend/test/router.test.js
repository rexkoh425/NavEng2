const request = require('supertest');
const app = require('../app'); 

if (global.gc) {
    global.gc(); // Expose garbage collection if enabled
} else {
    console.warn('No GC hook! Start your program with `node --expose-gc file.js`.');
}

async function get_filepath(HTML_input){
    let temp = HTML_input.split('/');
    let rough_filepath = temp.slice(8).join('/');
    let index = rough_filepath.indexOf('"');
    let filepath = rough_filepath.slice(0, index);
    return filepath;
}

async function CheckLocation(receivedData) {
    try {
        const res = await request(app)
            .post('/formPost')
            .send(receivedData)
            .timeout({ deadline: 45000 });

        let data = res.body;

        data['source'] = receivedData.MultiStopArray[0];
        data['destination'] = receivedData.MultiStopArray[1];
        if (data['passed'] && data['Expected'] !== data['Queried']){
            console.log(data['Expected']);
            console.log(data['Queried']);
            console.log(`${receivedData.MultiStopArray[0]} to ${receivedData.MultiStopArray[1]} : failed`);
            data['passed'] = false;
        }
        return data;
    } catch (error) {
        console.log(`${error}`);
        console.log(`${receivedData.MultiStopArray[0]} to ${receivedData.MultiStopArray[1]} : failed`);
        return { source: receivedData.MultiStopArray[0], destination: receivedData.MultiStopArray[1], passed: false , nodes_path : []  , HTML : '' , error_can_handle : false};
    }
}

async function CheckBlockedLocation(receivedData) {
    try {
        const res = await request(app)
            .post('/blockRefresh')
            .send(receivedData)
            .timeout({ deadline: 60000 });

        let data = res.body;
        data['source'] = receivedData.MultiStopArray[0];
        data['destination'] = receivedData.MultiStopArray[1];
        if (data['passed'] && data['Expected'] !== data['Queried']){
            console.log(data['Expected']);
            console.log(data['Queried']);
            console.log(`${receivedData.MultiStopArray[0]} to ${receivedData.MultiStopArray[1]} : with blocking failed , wrong no.`);
            data['passed'] = false;
        }else if (!data['passed'] && !data['error_can_handle']){
            console.log(`${receivedData.MultiStopArray[0]} to ${receivedData.MultiStopArray[1]} : with blocking failed , error cannot handle.`);
            console.log(data.message);
        }
        return data;
    } catch (error) {
        console.log(`${error}`);
        console.log(`${receivedData.MultiStopArray[0]} to ${receivedData.MultiStopArray[1]} : with blocking failed`);
        return { source: receivedData.MultiStopArray[0], destination: receivedData.MultiStopArray[1], passed: false , nodes_path : []  , HTML : '' , error_can_handle : false};
    }
}

async function performTest(destinations , blocked_input) {
    const inputData = {
        blocked_array: blocked_input,
        sheltered: false , 
        NoStairs : false , 
        MultiStopArray : destinations
    };
    return await CheckLocation(inputData);
}

async function performTestNoStairs(destinations , blocked_input) {
    const inputData = {
        blocked_array: blocked_input,
        sheltered: false , 
        NoStairs : true , 
        MultiStopArray : destinations
    };
    return await CheckLocation(inputData);
}

async function performTestSheltered(destinations , blocked_input) {
    const inputData = {
        blocked_array: blocked_input,
        sheltered: true , 
        NoStairs : false , 
        MultiStopArray : destinations
    };
    return await CheckLocation(inputData);
}

async function performBlockedTest(destinations , blocked_input , non_block_result) {
    
    const inputData = {
        blocked_array: [parseInt(blocked_input.blocked_filepath.split("_")[0])],
        Node_id_array : non_block_result.nodes_path,
        blocked_img_path: blocked_input.blocked_filepath,
        sheltered: false,
        NoStairs: false,
        MultiStopArray: destinations,
        Stops_index: non_block_result.Stops_index,
        BlockedNodeIndex: blocked_input.index
    };
    
    return await CheckBlockedLocation(inputData);
}

async function limitConcurrency(tasks, limit) {
    const results = [];
    const executing = [];

    for (const task of tasks) {
        const p = Promise.resolve().then(() => task());
        results.push(p);

        if (limit <= tasks.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
    }

    return Promise.all(results);
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

async function choose_middle_blocked(HTML){
    
    let seperatedHTML = HTML.split(' ');
    seperatedHTML.pop();
    if(seperatedHTML.length >= 6){
        let blocked_filepath = '';
        let arrow_dir = 'None';
        let chosen_index = (seperatedHTML.length >> 1)+1;
        do{
            chosen_index --;
            blocked_filepath = seperatedHTML[chosen_index];
            const broken_blocked_filepath = await break_down_img_path(blocked_filepath);
            arrow_dir = broken_blocked_filepath.arrow;
        }while(arrow_dir == 'None' && chosen_index >= 2);
        
        if(chosen_index >= 2){
            blocked_filepath = await get_filepath(blocked_filepath);
            return {blocked_filepath : blocked_filepath , index : chosen_index};
        }
        return {blocked_filepath : '' , index : chosen_index};
        
    }
    return {blocked_filepath : '' , index : 0};
}

class TestResult{
    constructor(test_cases){
        this.no_of_cases = test_cases;
        this.non_block_pass = 0;
        this.block_pass = 0;
        this.processed_count = 0;
        this.failed_locations = [];
        this.no_path = 0;
    }

    print_result(){
        console.log('\n'.repeat(2));
        console.log("Test result for no blocking");
        console.log("----------------------------");
        console.log(`${this.non_block_pass} out of ${this.no_of_cases} test cases passed without blocking`);
        console.log(`${this.no_of_cases - this.non_block_pass} out of ${this.no_of_cases} test cases failed without blocking`);
        console.log('\n'.repeat(1));
        console.log("Test result for blocking");
        console.log("----------------------------");
        console.log(`${this.block_pass} out of ${this.no_of_cases} test cases passed with blocking`);
        console.log(`${this.no_path} out of ${this.no_of_cases} test cases passed with no path`)
        console.log(`${this.no_of_cases - this.no_path - this.block_pass} out of ${this.no_of_cases} test cases failed`);
    }

    log_progress(){
        if (this.processed_count > 0 && this.processed_count % 500 == 0) {
            console.log(`${this.processed_count} out of ${this.no_of_cases} test cases processed`);
        }
    }

    incre_process_count(){
        this.processed_count ++;
    }

    incre_non_block_pass(){
        this.non_block_pass ++;
    }

    process_block_result(block_result , source , destination){
        if(block_result.passed){   
            this.block_pass ++;  
        }else if(block_result.error_can_handle){
            this.no_path ++;
        }else{
            this.failed_locations.push( { source : source , destination : destination});
        }
    }

    append_failed(source , destination){
        this.failed_locations.push( { source : source , destination : destination});
    }
}

describe('Testing Functions..........', function () {
    this.timeout(10000);

    it('NESW_ENUM returns number in string corresponding to the directions', async function () {
        try {
            const input = { 
                Input : ['0' , '90' , '180' , '-90' , '45'], 
                Expected : ['1' , '2' , '3' , '4' , 'not NESW'] 
            }
            const response = await request(app)
                .post('/NESW_ENUM')
                .send(input);
            
            if(response.body.passed == false){
                throw new Error("NESW_ENUM function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('get_opposite returns number in string corresponding opposite of input direction', async function () {
        try {
            const input = { 
                Input : ['1' , '2' , '3' , '4' , '5' , '6'], 
                Expected : ['3' , '4' , '1' , '2' , '6' , '5'] 
            }
            const response = await request(app)
                .post('/get_opposite')
                .send(input);
            
            if(response.body.passed == false){
                throw new Error("get_opposite function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('get_pov returns direction the user is facing', async function () {
        try {
            const input = { 
                Input : [
                    { pov : '0', arrow_direction : '180'},
                    { pov : '90', arrow_direction : '90'},
                    { pov : '180', arrow_direction : '-90'},
                    { pov : '-90', arrow_direction : '0'},
                    { pov : '45', arrow_direction : '180'},
                    { pov : '45', arrow_direction : '90'}
                ], 
                Expected : ['1' , '2' , '3' , '4' , '3' , '2'] 
            }
            const response = await request(app)
                .post('/get_pov')
                .send(input);

            if(response.body.passed == false){
                throw new Error("get_pov function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('handle_up_down handles going up and down directions and returns the arrow direction', async function () {
        try {
            const input = { 
                Input : [
                    { incoming : '180', outgoing : '180'},
                    { incoming : '45', outgoing : '180'},
                    { incoming : '180', outgoing : '45'},
                    { incoming : '90', outgoing : '-45'},
                    { incoming : '45', outgoing : '45'} 
                ], 
                Expected : ['not up down' , '7' , '5' , '6' , 'not up down'] 
            }
            const response = await request(app)
                .post('/handle_up_down')
                .send(input);

            if(response.body.passed == false){
                throw new Error("handle_up_down function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('get_arrow_dir returns the direction of arrow from input direction to output direction', async function () {
        try {
            const input = { 
                Input : [
                    { incoming_str : '0', outgoing_str : '90'},
                    { incoming_str : '180', outgoing_str : '90'},
                    { incoming_str : '90', outgoing_str : '90'},
                    { incoming_str : '90', outgoing_str : '0'},
                    { incoming_str : '180', outgoing_str : '-90'},
                    { incoming_str : '90', outgoing_str : '-45'} 
                ], 
                Expected : ['2' , '4' , '1' , '4' , '2' , '6'] 
            }
            const response = await request(app)
                .post('/get_arrow_dir')
                .send(input);

            if(response.body.passed == false){
                throw new Error("get_arrow_dir function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('is_moving_up_down handles moving up or down', async function () {
        try {
            const input = { 
                Input : [
                    { incoming : '45', outgoing : '45'},
                    { incoming : '-45', outgoing : '-45'},
                    { incoming : '-45', outgoing : '90'},
                    { incoming : '90', outgoing : '45'},
                    { incoming : '-45', outgoing : '45'}
                ], 
                Expected : [true , true , false , false , false] 
            }
            const response = await request(app)
                .post('/is_moving_up_down')
                .send(input);

            if(response.body.passed == false){
                throw new Error("is_moving_up_down function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('room_num_to_node_id converts string room_num to node_id', async function () {
        try {
            const input = { 
                Input : ['EA-04-16' , 'EA-06-13' , 'EA-01-22' , 17], 
                Expected : [78 , 129 , 166 , 17] 
            }
            const response = await request(app)
                .post('/room_num_to_node_id')
                .send(input);

            if(response.body.passed == false){
                throw new Error("room_num_to_node_id function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('node_id_to_room_num converts node_id to string room_num', async function () {
        try {
            const input = { 
                
                Input : [78 , 129 , 166 , 'EA-06-09'] ,
                Expected : ['EA-04-16' , 'EA-06-13' , 'EA-01-22' , 'EA-06-09']
            }
            const response = await request(app)
                .post('/node_id_to_room_num')
                .send(input);

            if(response.body.passed == false){
                throw new Error("node_id_to_room_num function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('get_diff returns the difference between two arrays', async function () {
        try {
            const input = { 
                Input : [
                    { arr1 : ['42' , '45' , '32' , '37'], arr2 : ['42' , '45' , '32']},
                    { arr1 : ['43' , '32' , '56' , '53' , '35'], arr2 : ['43' , '32' , '56']} ,
                    { arr1 : ['42' , '56' , '78'] , arr2 : ['42' , '56' , '78']} , 
                    { arr1 : [43 , 32], arr2 : [43] }
                ], 
                Expected : [ ['37'] , ['53', '35'] , [] , [43 , 32]] 
            }
            const response = await request(app)
                .post('/get_diff')
                .send(input);

            if(response.body.passed == false){
                throw new Error("get_diff function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('dir_string_to_ENUM should return 1 - 7 according to "East" , "North" etc' , async function() {
        try {
            const input = { 
                Input : ["North" , "East" , "South" , "West" , "Up" , "Down" , "None"], 
                Expected : ['1' , '2' , '3' , '4' , '5' , '6' , '7'] 
            }
            const response = await request(app)
                .post('/dir_string_to_ENUM')
                .send(input);

            if(response.body.passed == false){
                throw new Error("dir_string_to_ENUM function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('break_down_img_path breaks down an image name into its components', async function () {
        try {
            const input = { 
                Input : [
                    "2_50_0_1_East_West_Cross_junction_NIL",
                    "29_375_-110_2_South_North_T_junction_NIL" ,
                    "48_160_-45_3_East_East_Corner_NIL",
                    "31_375_-160_2_None_None_Room_EA-02-21"
                ], 
                Expected : [
                    {node_id : "2" , x_coor : "50" , y_coor : "0" , z_coor : "1" , pov : "East" , arrow : "West" , type : "Cross_junction" , room_num : "NIL"},
                    {node_id : "29" , x_coor : "375" , y_coor : "-110" , z_coor : "2" , pov : "South" , arrow : "North" , type : "T_junction" , room_num : "NIL"},
                    {node_id : "48" , x_coor : "160" , y_coor : "-45" , z_coor : "3" , pov : "East" , arrow : "East" , type : "Corner" , room_num : "NIL"},
                    {node_id : "31" , x_coor : "375" , y_coor : "-160" , z_coor : "2" , pov : "None" , arrow : "None" , type : "Room" , room_num : "EA-02-21"}
                ]
            }
            const response = await request(app)
                .post('/break_down_img_path')
                .send(input);

            if(response.body.passed == false){
                throw new Error("break_down_img_path function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('get_blocked is able to query from database' , async function() {
        try {
            const response = await request(app)
                .post('/get_blocked')

            if(response.body.passed == false){
                throw new Error("get_blocked function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('convert_ENUM_to_angle returns number in string corresponding opposite of input direction', async function () {
        try {
            const input = { 
                Input : ['1' , '2' , '3' , '4' , '5' , '6'], 
                Expected : ['0' , '90' , '180' , '-90' , '45' , '-45'] 
            }
            const response = await request(app)
                .post('/convert_ENUM_to_angle')
                .send(input);
            
            if(response.body.passed == false){
                throw new Error("convert_ENUM_to_angle function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('get_stairs is able to query from database' , async function() {
        try {
            const response = await request(app)
                .post('/get_stairs')

            if(response.body.passed == false){
                throw new Error("get_stairs function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('get_non_sheltered is able to query from database' , async function() {
        try {
            const response = await request(app)
                .post('/get_non_sheltered')

            if(response.body.passed == false){
                throw new Error("get_non_sheltered function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('angle_to_string_dir return direction in words' , async function() {
        try {
            const input = { 
                Input : ['0' , '90' , '180' , '-90' , '45' , '-45' , '30'] ,
                Expected : ["north" , "east" , "south" , "west" , "up" , "down" , "cannot convert"]
                
            }

            const response = await request(app)
                .post('/angle_to_string_dir')
                .send(input);

            if(response.body.passed == false){
                throw new Error("angle_to_string_dir function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('remove_weburl takes in link and returns file name' , async function() {
        try {
            const input = { 
                Input : 
                [
                    'https://bdnczrzgqfqqcoxefvqa.supabase.co/storage/v1/object/public/Pictures/1_0_0_40_None_None_Room_NIL.jpg' , 
                    'https://bdnczrzgqfqqcoxefvqa.supabase.co/storage/v1/object/public/Pictures/3_50_-110_40_North_None_T_junction_NIL.jpg' ,
                    'https://bdnczrzgqfqqcoxefvqa.supabase.co/storage/v1/object/public/Pictures/12_30_-390_80_North_None_Cross_junction_NIL.jpg' ,
                    'https://bdnczrzgqfqqcoxefvqa.supabase.co/storage/v1/object/public/Pictures/15_30_-450_80_West_None_Cross_junction_NIL.jpg'
                ] ,
                Expected : 
                [
                    "1_0_0_40_None_None_Room_NIL.jpg" , 
                    "3_50_-110_40_North_None_T_junction_NIL.jpg" , 
                    "12_30_-390_80_North_None_Cross_junction_NIL.jpg" , 
                    "15_30_-450_80_West_None_Cross_junction_NIL.jpg"
                ]
                
            }

            const response = await request(app)
                .post('/remove_weburl')
                .send(input);

            if(response.body.passed == false){
                throw new Error("remove_weburl function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('get_b4_blocked_unique_id_from_array returns node before blocked node' , async function() {
        try {
            const input = { 
                Input : [
                    {
                        array : ['0' , '3' , '4' , '7' , '2'], 
                        query : "4"
                    } ,
                    {
                        array : ['0' , '2' , '3'], 
                        query : "4"
                    } 
                ] ,
                Expected : ["3" , ""] 
            }

            const response = await request(app)
                .post('/get_b4_blocked_unique_id_from_array')
                .send(input);

            if(response.body.passed == false){
                throw new Error("get_b4_blocked_unique_id_from_array function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('template_instructions returns instructions base on directions , distance etc  ', async function() {
        try {
            
            const input = { 
                Input : 
                [
                    {
                        distance : "70" ,
                        arrow : "1" ,
                        levels : 0 , 
                        node_id : 0 
                    } ,
                    {
                        distance : "80" ,
                        arrow : "6" ,
                        levels : 2 , 
                        node_id : 446
                    } ,
                    {
                        distance : "50" ,
                        arrow : "2" ,
                        levels : 0 ,
                        node_id : 0
                    },
                    {
                        distance : "20" ,
                        arrow : "7" ,
                        levels : 0 ,
                        node_id : 446
                    }
                    
                ] ,
                Expected : 
                [
                    "Walk Straight for 7 metres",
                    "Go Down 2 level from level 7 to level 5",
                    "Turn Right and Walk Straight for 5 metres" ,
                    "Exit the Elevator"
                ]
            }

            const response = await request(app)
                .post('/template_instructions')
                .send(input);

            if(response.body.passed == false){
                throw new Error("template_instructions function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('ENUM_to_left_right return left right straight instruction from ENUM', async function () {
        try {
            const input = { 
                Input : ['1' , '2' , '3' , '4' , '5' , '6' , '7'], 
                Expected : ['Straight' , 'Right' , 'around' , 'Left' , 'Up' , 'Down' , 'None'] 
            }
            const response = await request(app)
                .post('/ENUM_to_left_right')
                .send(input);
            
            if(response.body.passed == false){
                throw new Error("ENUM_to_left_right function failed")
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })
})

describe('Testing Endpoints..........', function () {
    this.timeout(50000);

    it('/locations should return an array of locations', async function () {
        try {
            const response = await request(app)
                .post('/locations');
            
            if(response.body.length <= 0){
                throw new Error("empty array"); 
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('/feedback should append the user feedback into database', async function () {
        const input = {
            feedbackType : "Report bug with website", 
            bugDetails : "there is no bug",
            nodes : ["EA-01-12" , "EA-02-12"]
        }
        try {
            const response = await request(app)
                .post('/feedback')
                .send(input);
            
            if(response.body.message != "Thank you for your feedback!"){
                throw new Error("Not added successfully"); 
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('/InsertFailedLocations should append the failed location into database', async function () {
        const input = [
            { source : "EA-01-11" , destination : "EA-05-11"} , 
            { source : "EA-03-11" , destination : "E1-03-14"}
        ]
        try {
            const response = await request(app)
                .post('/InsertFailedLocations')
                .send(input);
            if(response.body.message != "Data added to database successfully."){
                throw new Error("Not added successfully"); 
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('/FailedLocations get all failed locations from the database', async function () {
        try {
            const response = await request(app)
                .post('/FailedLocations')

            if(response.body.length <= 0){
                throw new Error("empty array"); 
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('/DeleteFailedLocations deletes all failed locations from the database', async function () {
        try {
            const response = await request(app)
                .post('/DeleteFailedLocations')

            if(response.body.message != "Data deleted from database successfully."){
                throw new Error("Not deleted successfully"); 
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('/insertBlocked updates the node as blocked in the database', async function () {
        const input = { img_string : "3_50_-110_40_North_None_T_junction_NIL.jpg" } ;
        try {
            const response = await request(app)
                .post('/insertBlocked')
                .send(input);

            if(response.body.message != "Data added to database successfully."){
                throw new Error("Not added successfully"); 
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('/getfloor gets all other nodes with same floor as the input node', async function () {
        const input = { node_id : 706 };
        try {
            const response = await request(app)
                .post('/getfloor')
                .send(input);

            if(response.body.length <= 0){
                throw new Error("empty array"); 
            }
            const Edge = response.body[0];
            const connections = Edge.connections[0];
           
            if(typeof(Edge.id) != "number" || typeof(Edge.label) != "string"){
                throw new Error("wrong format"); 
            }
            if(typeof(connections.id) != "number" || typeof(connections.distance) != "number" || typeof(connections.direction) != "string"){
                throw new Error("wrong format"); 
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('/convert_unique_id_filename get filepath using a unique id', async function () {
        const input = { unique_id : 211 };
        try {
            const response = await request(app)
                .post('/convert_unique_id_filename')
                .send(input);
            
            if(response.body.filepath != "2_50_0_40_North_North_Cross_junction_NIL.jpg"){
                throw new Error("wrong filepath"); 
            }
            
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    })

    it('/get_image_links should return an array of image links', async function () {
        try {
            const response = await request(app)
                .post('/get_image_links');
            
            if(response.body.link_array.length <= 0){
                throw new Error("empty array"); 
            }
        } catch (error){
            throw error;
        }
        if (global.gc) {
            global.gc();
        }
    }) 
})

describe('Testing features....', function () {
    this.timeout(20000);

    it('Test for multi-stop', async function () {
        try {
            
            const non_block_result = await performTest(['EA-02-09' , 'E1A-07-03' , 'E1-07-19'] , []);
            let blocked = {blocked_filepath : '' , index : 0}
            if(non_block_result.passed || non_block_result.error_can_handle){
                blocked = await choose_middle_blocked(non_block_result.HTML);
            }else{
                throw new Error("did not pass the test");
            }

            let block_result = {HTML : "" , passed : true , error_can_handle : false}; 
            
            if(blocked.blocked_filepath != ''){
                block_result = await performBlockedTest(['EA-02-09' , 'E1A-07-03' , 'E1-07-19'] , blocked , non_block_result);
            }

            if(!block_result.passed && !block_result.error_can_handle){
                throw new Error("did not pass the test");
            }
            
            if (global.gc) {
                global.gc();
            }
            
        } catch (error) {
            throw error;
        }
    });

    it('Test for No Stairs', async function () {
        try {
            
            const no_filter_result = await performTest(['E1-04-12' , 'EA-02-14'] , []);
            //console.log(no_filter_result.nodes_path);
            const response = await request(app)
                .post('/checkforstairs')
                .send(no_filter_result.nodes_path);
            
            if(response.body.NoStairs == false){
                
                const filter_result = await performTestNoStairs(['E1-04-12' , 'EA-02-14'] , []);
                //console.log(filter_result.nodes_path)
                const new_response = await request(app)
                .post('/checkforstairs')
                .send(filter_result.nodes_path);
                //console.log(new_response.body)
                if(new_response.body.NoStairs != true){
                    throw new Error("no stairs filter did not work")
                }
            }
            
            if (global.gc) {
                global.gc();
            }
            
        } catch (error) {
            throw error;
        }
    });

    it('Test for sheltered path', async function () {
        try {
                
            const filter_result = await performTestSheltered(['E1-04-12' , 'EA-02-14'] , []);
            
            const new_response = await request(app)
            .post('/checkforsheltered')
            .send(filter_result.nodes_path);
            
            if(new_response.body.sheltered != true){
                throw new Error("sheltered filter did not work")
            }
            
            if (global.gc) {
                global.gc();
            }
            
        } catch (error) {
            throw error;
        }
    });
});

describe('Testing whether location pairs output correct number of pictures', function () {
    this.timeout(10000000);

    it('All location pairs tested', async function () {
        try {
            const response = await request(app)
                .post('/locations');

            let locations = response.body;
            let no_of_locations = locations.length;
            let test_cases = no_of_locations * (no_of_locations - 1);
            
            const tasks = [];
            let result = new TestResult(test_cases);
            //NOTE SET DEBUG = FALSE IN DEBUG_LOG() FUNCTION IN ROUTER.JS BEFORE STARTING TEST
            for (let source of locations) {
                for (let destination of locations) {
                    //source = 'EA-02-11';
                    //destination = 'EA-03-08';
                    if (source !== destination) {
                        
                        tasks.push(async () => {  
                            const non_block_result = await performTest([source , destination] , []);
                            let blocked = {blocked_filepath : '' , index : 0}
                            if(non_block_result.passed || non_block_result.error_can_handle){
                                result.incre_non_block_pass();
                                blocked = await choose_middle_blocked(non_block_result.HTML);
                            }else{
                                result.append_failed(source , destination);
                            }
                            
                            let block_result = {HTML : "" , passed : true , error_can_handle : false}; 
                            
                            if(blocked.blocked_filepath != ''){
                                block_result = await performBlockedTest([source , destination] , blocked , non_block_result);
                            }
                            result.process_block_result(block_result ,source , destination);
                            result.incre_process_count();
                            result.log_progress();
                            
                            if (global.gc) {
                                global.gc();
                            }
                        });
                    }
                }
            }

            await limitConcurrency(tasks, 10); // Adjust the concurrency limit as necessary

            try {
                await request(app).post('/DeleteFailedLocations');
            } catch (error) {
                throw error;
            }

            try {
                await request(app).post('/InsertFailedLocations').send(result.failed_locations);
            } catch (error) {
                throw error;
            }
            
            result.print_result();

            const percentage_pass = 0.5 / 100;
            if((result.no_of_cases - result.non_block_pass) == percentage_pass * 0.005){
                throw new Error("No. of test cases failed is above margin for non blocking");
            }
            if((result.no_of_cases - result.block_pass - result.no_path) == percentage_pass * 0.005){
                throw new Error("No. of test cases failed is above margin for blocking");
            }
            
        } catch (error) {
            throw error;
        }
    });
});
