const request = require('supertest');
const app = require('../app'); 

/*
const {
    app ,
    template_img,
    NESW_ENUM,
    get_pov , 
    handle_up_down,
    get_arrow_dir,
    is_moving_up_down,
    room_num_to_node_id,
    get_diff 
} = require('../app'); 
*/

if (global.gc) {
    global.gc(); // Expose garbage collection if enabled
} else {
    console.warn('No GC hook! Start your program with `node --expose-gc file.js`.');
}


/*
describe('Testing all functions.......', function(){

    it('template_img function', () => {
        const imgHtml = template_img("test_image.jpg");
        console.log(imgHtml);
        console.log(typeof(imgHtml));
        console.log(typeof(`<img src = "test_image.jpg" alt = "cannot be displayed" class="htmlData"><br>`));
        if (imgHtml !== `<img src = "test_image.jpg" alt = "cannot be displayed" class="htmlData"><br>`) {
            throw new Error('template_img did not return correct HTML');
        }
    });

    it('NESW_ENUM function', () => {
        if (NESW_ENUM('0') !== '1') {
            throw new Error('NESW_ENUM did not return correct direction for input 0');
        }
        if (NESW_ENUM('90') !== '2') {
            throw new Error('NESW_ENUM did not return correct direction for input 90');
        }
        if (NESW_ENUM('180') !== '3') {
            throw new Error('NESW_ENUM did not return correct direction for input 90');
        }
        if (NESW_ENUM('-90') !== '3') {
            throw new Error('NESW_ENUM did not return correct direction for input 90');
        }
        if (NESW_ENUM('45') !== 'not NESW') {
            throw new Error('NESW_ENUM did not return correct direction for input 90');
        }
    });

    it('get_pov function', () => {
        if (get_pov('0', '90') !== '1') {
            throw new Error('get_pov did not return correct POV for inputs 0 and 90');
        }
        if (get_pov('90', '180') !== '2') {
            throw new Error('get_pov did not return correct POV for inputs 90 and 180');
        }
        if (get_pov('-90', '0') !== '4') {
            throw new Error('get_pov did not return correct POV for inputs 90 and 180');
        }
        if (get_pov('45', '180') !== '3') {
            throw new Error('get_pov did not return correct POV for inputs 90 and 180');
        }
        // Add more assertions as needed
    });
    
    
});
*/

async function CheckLocation(receivedData) {
    try {
        const res = await request(app)
            .post('/formPost')
            .send(receivedData)
            .timeout({ deadline: 3000 });

        let data = res.body;

        if (data['Expected'] !== data['Queried']) {
            console.log(data['Expected']);
            console.log(data['Queried']);
            console.log(`${receivedData.source} to ${receivedData.destination} : failed`);
            const res_obj = { source: `${receivedData.source}`, destination: `${receivedData.destination}`, passed: false };
            return res_obj;
        }

        return { source: receivedData.source, destination: receivedData.destination, passed: true };
    } catch (error) {
        console.log(`${error}`);
        console.log(`${receivedData.source} to ${receivedData.destination} : failed`);
        return { source: receivedData.source, destination: receivedData.destination, passed: false };
    }
}

async function performTest(source, destination) {
    const inputData = {
        source: `${source}`,
        destination: `${destination}`,
        Debugging: false
    };
    return await CheckLocation(inputData);
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

describe('Testing Functions..........', function () {
    this.timeout(500000);

    it('template_img converts image path to HTML usable code', async function () {
        try {
            const input = { 
                Input : 'test_image.jpg', 
                Expected : `<img src = "test_image.jpg" alt = "cannot be displayed" class="htmlData"><br>` 
            }
            const response = await request(app)
                .post('/template_img')
                .send(input);

            if(response.body.passed == false){
                throw new Error("template_img function failed")
            }
        } catch (error){
            throw error;
        }
    })

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
    })

    it('room_num_to_node_id converts string room_num to node_id', async function () {
        try {
            const input = { 
                Input : ['EA-04-16' , 'EA-06-13' , 'EA-01-22'], 
                Expected : [78 , 129 , 166] 
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
    })

})

describe('Testing all location pairs now', function () {
    this.timeout(500000);

    it('all location pairs tested', async function () {
        try {
            const response = await request(app)
                .post('/locations');

            let locations = response.body;
            let no_of_locations = locations.length;
            let test_cases = no_of_locations * (no_of_locations - 1);
            let failed_locations = [];
            let passed = 0;
            const tasks = [];

            for (let source of locations) {
                for (let destination of locations) {
                    if (source !== destination) {
                        
                        tasks.push(async () => {
                            const result = await performTest(source, destination);
                            if (result.passed) {
                                passed++;
                            } else {
                                failed_locations.push({ source: result.source, destination: result.destination });
                                console.log("inserted failed location");
                            }
                            if (passed > 0 && passed % 100 == 0) {
                                console.log(`${passed} out of ${test_cases} test cases passed`);
                            }
                            if (global.gc) {
                                global.gc(); // Force garbage collection
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
                await request(app).post('/InsertFailedLocations').send(failed_locations);
            } catch (error) {
                throw error;
            }

            console.log(`${passed} out of ${test_cases} test cases passed`);
            console.log(`${test_cases - passed} out of ${test_cases} test cases failed`);
        } catch (error) {
            throw error;
        }
    });
});