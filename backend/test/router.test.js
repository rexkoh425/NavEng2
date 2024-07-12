const request = require('supertest');
const app = require('../app'); 

if (global.gc) {
    global.gc(); // Expose garbage collection if enabled
} else {
    console.warn('No GC hook! Start your program with `node --expose-gc file.js`.');
}

async function CheckLocation(receivedData) {
    try {
        const res = await request(app)
            .post('/formPost')
            .send(receivedData)
            .timeout({ deadline: 5000 });

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
            .timeout({ deadline: 5000 });

        let data = res.body;
        data['source'] = receivedData.MultiStopArray[0];
        data['destination'] = receivedData.MultiStopArray[1];
        if (data['passed'] && data['Expected'] !== data['Queried']){
            console.log(data['Expected']);
            console.log(data['Queried']);
            console.log(`${receivedData.MultiStopArray[0]} to ${receivedData.MultiStopArray[1]} : with blocking failed`);
            data['passed'] = false;
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
    //console.log(inputData);
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

    process_block_result(block_result){
        if(block_result.passed){   
            this.block_pass ++;  
        }else if(block_result.error_can_handle){
            this.no_path ++;
        }
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
})

describe('Testing whether location pairs output correct number of pictures', function () {
    this.timeout(5000000);

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
                            }
                            let block_result = {HTML : "" , passed : true , error_can_handle : false}; 
                            
                            if(blocked.blocked_filepath != ''){
                                block_result = await performBlockedTest([source , destination] , blocked , non_block_result);
                            }
                            result.process_block_result(block_result);
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

            const percentage_pass = 0.005;
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