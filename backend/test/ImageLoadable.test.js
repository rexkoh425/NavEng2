
import { use, expect } from 'chai'
import chaiHttp from 'chai-http'
const chai = use(chaiHttp)

describe('Image Check Test', function() {
  it('should check image', function(done) {
    chai.request('https://upload.wikimedia.org')
      .get('/wikipedia/commons/5/51/Google.png')
      .end(function(err, res) {
        expect(res).to.have.status(200);
        done(err); // Call done with err to propagate any errors
      });
  });
});




















/*
const { JSDOM } = require('jsdom');
const assert = require('assert');

describe('Image Load Test', function() {
  let window;

  before(function() {
    try{
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        window = dom.window;
        global.document = window.document;
        global.Image = window.Image; // Mock Image object in Node.js environment
    }catch(error){
        console.log(error);
    }
  });

  it('should load an image successfully', function(done) {
    this.timeout(5000); // Extend the timeout if necessary

    const imageUrl = 'https://bdnczrzgqfqqcoxefvqa.supabase.co/storage/v1/object/public/Pictures/100_230_140_200_North_North_Lane_NIL.jpg?t=2024-07-03T08%3A02%3A28.268Z';

    const img = new Image();

    img.onload = function() {
      console.log("called");
      assert.strictEqual(img.width > 0, true); // Example assertion
      done(); // Call done to indicate test completion
    };

    img.onabort = function() {
        console.error('Image load aborted');
        done(new Error('Image load aborted'));
    };

    img.src = imageUrl;
  });

  after(function() {
    delete global.document;
    delete global.Image;
    window.close();
  });
});
*/