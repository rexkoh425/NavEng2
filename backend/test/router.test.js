const request = require('supertest');
const app = require('../app');

if (global.gc) {
    global.gc(); // Expose garbage collection if enabled
} else {
    console.warn('No GC hook! Start your program with `node --expose-gc file.js`.');
}

async function sendSecondRequest(receivedData) {
    try {
        
        const res = await request(app)
            .post('/formPost')
            .send(receivedData)
            .timeout({deadline : 3000});

        let data = res.body;

        if(data['Expected'] !==  data['Queried']) {
            console.log(data['Expected']);
            console.log(data['Queried']);
            console.log(`${receivedData.source} to ${receivedData.destination} : failed`);
            const res_obj = { source : `${receivedData.source}` , destination : `${receivedData.destination}` , passed : false};
            return res_obj;
        }
        
        return { source : receivedData.source , destination : receivedData.destination , passed : true};
    } catch (error) {
        console.log(`${error}`);
        console.log(`${receivedData.source} to ${receivedData.destination} : failed`);
        return { source : receivedData.source , destination : receivedData.destination , passed : false};
    }
}

describe('Testing all location pairs now', function(){

    this.timeout(500000);
    it('all location pairs tested', async function(){
        try {
            const response = await request(app)
            .post('/locations')

            let locations = response.body;
            let no_of_locations = locations.length;
            let test_cases = no_of_locations*(no_of_locations - 1);
            let failed_locations = [];
            let passed = 0;
            for (let source of locations) {
                for (let destination of locations) {
                    if (source !== destination) {
                        const inputData = {
                            source: `${source}`,
                            destination: `${destination}`,
                            Debugging : false
                        };
                        const result = await sendSecondRequest(inputData);
                        if(result.passed){
                            passed ++;
                        }else{
                            failed_locations.push( {source : result.source , destination : result.destination});
                            console.log("inserted failed location");
                        }
                        if(passed > 0 && passed % 100 == 0){ console.log(`${passed} out of ${test_cases} test cases passed`)}
                        if (global.gc) {
                            global.gc(); // Force garbage collection
                        }
                    }
                }
            }
            
            try {
                const response = await request(app)
                .post('/DeleteFailedLocations')
            } catch (error){
                throw error;
            }

            try {
                const response = await request(app)
                .post('/InsertFailedLocations')
                .send(failed_locations)
            } catch (error){
                throw error;
            }
            console.log(`${passed} out of ${test_cases} test cases passed`);
            console.log(`${test_cases - passed} out of ${test_cases} test cases failed`);
        } catch (error) {
            throw error;
        }
    });
});