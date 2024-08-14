//using mocha to run image processing stuff to simulate endpoint request

const request = require('supertest');
const app = require('../app');

if (global.gc) {
    global.gc(); 
} else {
    console.warn('No GC hook! Start your program with `node --expose-gc file.js`.');
}

describe('test full_query', function(){

    this.timeout(500000);
    it('full_query', async function(){
        
        try {
            const response = await request(app)
            .post('/convert__to_-')

        } catch(error){
            throw error;
        }
    });
});

