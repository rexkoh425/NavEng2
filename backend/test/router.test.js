const request = require('supertest');
const app = require('../app'); // Import the app instance

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
            return false;
        }
        
        return true;
    } catch (error) {
        console.log(`${error}`);
        console.log(`${receivedData.source} to ${receivedData.destination} : failed`);
    }
}

describe('get all the locations available', function(){

    this.timeout(300000);
    it('should test all location pairs', async function(){
        try {
            const response = await request(app)
            .post('/locations')

            let locations = response.body;
            let no_of_locations = locations.length;
            let test_cases = no_of_locations*(no_of_locations - 1);
            let passed = 0;
            for (let source of locations) {
                for (let destination of locations) {
                    if (source !== destination) {
                        const inputData = {
                            source: `${source}`,
                            destination: `${destination}`,
                            Debugging : false
                        };
                        let pass_fail = await sendSecondRequest(inputData);
                        if(pass_fail){
                            passed ++;
                        }
                        if(passed > 0 && passed % 100 == 0){ console.log(`${passed} out of ${test_cases} test cases passed`)}
                        if (global.gc) {
                            global.gc(); // Force garbage collection
                        }
                    }
                }
            }
            console.log(`${passed} out of ${test_cases} test cases passed`);
            console.log(`${test_cases - passed} out of ${test_cases} test cases failed`);
            done();
        } catch (error) {
            throw error;
        }
    });
});
