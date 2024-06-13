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

describe('Testing Failed Locations', function(){

    this.timeout(100000);
    it('Testing Failed Locations From Full Test', async function(){
        try {
            const response = await request(app)
            .post('/FailedLocations')

            let location_pairs = response.body;
            let test_cases = location_pairs.length;
            let passed = 0;
            let failed_locations = [];
            location_pairs.forEach(async element => {
                const source = element.source;
                const destination = element.destination;
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
                    if (global.gc) {
                        global.gc(); // Force garbage collection
                    }
                }
            });
            
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