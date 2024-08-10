
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

async function performTestNoStairs(destinations , blocked_input) {
    const inputData = {
        blocked_array: blocked_input,
        sheltered: false , 
        NoStairs : true , 
        MultiStopArray : destinations
    };
    return await CheckLocation(inputData);
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


/*
describe('test one path only', function(){

    this.timeout(10000);
    it('test path', async function(){
        const input = [{ source : 'E1-01-11' , destination : 'E1-01-22'}];
        try {
            const response = await request(app)
            .post('/InsertFailedLocations')
            .send(input)
            console.log(response.body);
        } catch(error){
            throw error;
        }
    });
});
/*
describe('test one path only', function(){

    this.timeout(10000);
    it('test path', async function(){
        try {
            const response = await request(app)
            .post('/DeleteFailedLocations')
            console.log(response.body);
        } catch(error){
            throw error;
        }
    });
});
*/
/*
describe('test one path only', function(){

    this.timeout(10000);
    it('test path', async function(){
        const input = { img_string : "57_200_-275_3_East_East_T_junction_NIL.jpg"};
        try {
            const response = await request(app)
            .post('/insertBlocked')
            .send(input)
            console.log(response.body);
        } catch(error){
            throw error;
        }
    });
});

describe('test full_query', function(){

    this.timeout(500000);
    it('full_query', async function(){
        
        try {
            const response = await request(app)
            .post('/convert__to_-')

            //console.log(response.body);
        } catch(error){
            throw error;
        }
    });
});
*/
describe('Testing whether no stairs filter works', function () {
    this.timeout(20000);

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
                    throw new Error("filter did not work")
                }
            }
            
            if (global.gc) {
                global.gc();
            }
            
        } catch (error) {
            throw error;
        }
    });
});
