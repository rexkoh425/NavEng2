const request = require('supertest');
const app = require('../app');

if (global.gc) {
    global.gc(); // Expose garbage collection if enabled
} else {
    console.warn('No GC hook! Start your program with `node --expose-gc file.js`.');
}

describe('test one path only', function(){

    this.timeout(10000);
    it('test path', async function(){
        try {
            const response = await request(app)
            .post('/FailedLocations')
            console.log(response.body);
        } catch(error){
            throw error;
        }
    });
});