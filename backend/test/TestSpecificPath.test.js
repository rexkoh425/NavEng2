
const request = require('supertest');
const app = require('../app');

if (global.gc) {
    global.gc(); // Expose garbage collection if enabled
} else {
    console.warn('No GC hook! Start your program with `node --expose-gc file.js`.');
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
*/
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
