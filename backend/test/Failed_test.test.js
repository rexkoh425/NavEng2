
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
            .timeout({ deadline: 10000 });

        let data = res.body;
        data['source'] = receivedData.MultiStopArray[0];
        data['destination'] = receivedData.MultiStopArray[1];
        if (data['passed'] && data['Expected'] !== data['Queried']){
            console.log(data['Expected']);
            console.log(data['Queried']);
            console.log(`${receivedData.MultiStopArray[0]} to ${receivedData.MultiStopArray[1]} : with blocking failed`);
            data['passed'] = false;
        }

        if (!data['passed'] && !data['error_can_handle']){
            console.log(receivedData.Node_id_array)
            console.log(receivedData.blocked_img_path);
            console.log(`${receivedData.MultiStopArray[0]} to ${receivedData.MultiStopArray[1]} : with blocking failed`);
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

describe('Testing whether location pairs output correct number of pictures', function () {
    this.timeout(5000000);

    it('All location pairs tested', async function () {
        try {
            const response = await request(app)
                .post('/FailedLocations');

            let locations = response.body;
            let no_of_locations = locations.length;
            let test_cases = no_of_locations;
            
            const tasks = [];
            let result = new TestResult(test_cases);
            //NOTE SET DEBUG = FALSE IN DEBUG_LOG() FUNCTION IN ROUTER.JS BEFORE STARTING TEST
            for (let test of locations) {
                tasks.push(async () => { 
                    const source = test.source;
                    const destination = test.destination; 
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