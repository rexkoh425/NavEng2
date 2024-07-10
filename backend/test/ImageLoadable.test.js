
const request = require('supertest');
const app = require('../app');
const { filter } = require('async');
  
// Replace with your server URL
const serverUrl = 'https://bdnczrzgqfqqcoxefvqa.supabase.co'; 
const folders  = '/storage/v1/object/public/Pictures/';



if (global.gc) {
  global.gc(); // Expose garbage collection if enabled
} else {
  console.warn('No GC hook! Start your program with `node --expose-gc file.js`.');
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

describe('Image Loadability Test', async function() {
  this.timeout(500000);

  it('should load the image correctly', async function() {
    try {
      const response = await request(app)
        .post('/get_image_links');

      const link_array = response.body.link_array;
      const error_links = [];
      let passed = 0;
      const tasks = [];
      
      for(let link of link_array){
        tasks.push(async () => {
          try {
            const res = await request(serverUrl)
              .get(folders + link)
            if(res.status == 200){
              passed++;
            }else{
              //console.log(res.status);
              throw Error("not valid");
            }
          } catch (err) {
            error_links.push(serverUrl + folders + link);
          }

          if (global.gc) {
            global.gc();
          }
        });
      }

      await limitConcurrency(tasks, 50); 
      console.log(error_links);
      console.log(`${error_links.length} out of ${link_array.length} images were not correct`);

    } catch (error) {
      throw error;
    }
  });
});