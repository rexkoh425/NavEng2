function splitTextBeforeSlash(text) {
  const parts = text.split('/');
  return parts[0]; // Return the first part before the '/'
}

function splitTextAfterSlash(text) {
  const parts = text.split('/');
  return parts[1]; // Return the first part before the '/'
}

describe("User can use pathfinding functionality", () => {
  it('user can open view the images when they select a start location and end location and submit the form', () => {
    // see: https://on.cypress.io/mounting-react
    cy.visit('http://localhost:3000/')
    cy.findByRole('combobox', {  name: /start location/i}).type("EA-02-11")
    cy.findByRole('option', { name: "EA-02-11" }).click()
    cy.findByRole('combobox', {
      name: /end location/i
    }).type("EA-02-09")
    cy.findByRole('option', { name: "EA-02-09" }).click()
    cy.findByRole('button', {  name: /submit/i}).click()
    cy.findByRole('img', {name: /cannot be displayed/i})
    cy.wait(1000)
    cy.get('.imageCount')
    .invoke('text') 
    .then(text => {
      const img_no = splitTextBeforeSlash(text);
      const total_img = splitTextAfterSlash(text);
      cy.log(`Image No.: ${img_no}`);
      cy.log(`Total number of images: ${total_img}`);
      for (let i = 0; i < total_img -1; i ++) {
        cy.findByTestId('ArrowRightIcon').click()
      }})
  })
})

describe("access the feedback page and submit feedback about a bug", () => {
  it('allows users to open the page and submit feedback successfully', () => {
    // see: https://on.cypress.io/mounting-react
    cy.visit('http://localhost:3000/')
    cy.findByRole('link', {
      name: /feedback/i
    }).click()
    cy.findByText(/we appreciate your comments and any feedback you might have for us/i)
    cy.findByRole('combobox', {  name: /issue/i}).type('Report bug with website')
    cy.findByRole('option', { name: 'Report bug with website' }).click()
    cy.findByRole('textbox').type('Test Message')
    cy.findByRole('button', {
      name: /submit/i
    }).click()
    cy.findByText(/thank you for your feedback!/i)
  })
})

describe("access the feedback page and submit feedback to report a path", () => {
  it('allows users to open the page and submit feedback successfully', () => {
    cy.visit('http://localhost:3000/')
    cy.findByRole('link', {
      name: /feedback/i
    }).click()
    cy.findByRole('combobox', {  name: /issue/i}).type('Report a path')
    cy.findByRole('option', { name: 'Report a path' }).click()
    cy.findByRole('combobox', {  name: /node 1/i}).type('EA-02-11')
    cy.findByRole('option', { name: 'EA-02-11' }).click()
    cy.findByRole('button', {
      name: /submit/i
    }).click()
    cy.findByText(/thank you for your feedback!/i)
  })
})


describe("User can use pathfinding functionality", () => {
  it('user can open view the images when they select a start location and end location and submit the form', () => {
    // see: https://on.cypress.io/mounting-react
    cy.visit('http://localhost:3000/')
    cy.findByRole('combobox', {  name: /start location/i}).type("EA-02-11")
    cy.findByRole('option', { name: "EA-02-11" }).click()
    cy.findByRole('combobox', {
      name: /end location/i
    }).type("EA-02-09")
    cy.findByRole('option', { name: "EA-02-09" }).click()
    cy.findByRole('button', {  name: /submit/i}).click()
    cy.findByRole('img', {name: /cannot be displayed/i})
    cy.get('.imageCount')
    .invoke('text') 
    .then(text => {
      const img_no = splitTextBeforeSlash(text);
      const total_img = splitTextAfterSlash(text);
      cy.log(`Image No.: ${img_no}`);
      cy.log(`Total number of images: ${total_img}`);
      for (let i = 0; i < total_img -1; i ++) {
        cy.findByTestId('ArrowRightIcon').click()
      }})
      cy.findByRole('img', {  name: /cannot be displayed/i})
  })
}) 
/*

describe("Paths with stairs", () => {
  it('suggests paths with stairs', () => {
    cy.visit('http://localhost:3000/')
    cy.findByRole('combobox', {  name: /start location/i}).type("EA-02-10")
    cy.findByRole('option', { name: "EA-02-10" }).click()
    cy.findByRole('combobox', {
      name: /end location/i
    }).type("EA-05-50")
    cy.findByRole('option', { name: "EA-05-50" }).click()
    cy.findByRole('button', {  name: /submit/i}).click()
    cy.wait(1000);
    cy.findByRole('img', {name: /cannot be displayed/i})
    let stairsfound = false;
    cy.wait(1000);
    cy.get('.imageCount')
    .invoke('text') 
    .then(text => {
      const img_no = splitTextBeforeSlash(text);
      const total_img = splitTextAfterSlash(text);
      const stairs = 'Stairs';
      cy.log(`Image No.: ${img_no}`);
      cy.log(`Total number of images: ${total_img}`);
      for (let i = 0; i < total_img -1; i ++) {
        cy.findByTestId('ArrowRightIcon').click()
        cy.wait(1000);
        cy.get('img').each(($img) => {
          cy.wrap($img).invoke('attr', 'src').then((src) => {
            if (src.includes(stairs)) {
              stairsfound = true;
              return false;
            }
          })
        });
      }
    }).then(() => {expect(stairsfound).to.be.true;})
  })
})
*/

describe("Using no stairs filter", () => {
  it('suggests paths with no stairs', () => {
    cy.visit('http://localhost:3000/')
    cy.findByRole('combobox', {  name: /start location/i}).type("EA-02-10")
    cy.findByRole('option', { name: "EA-02-10" }).click()
    cy.findByRole('combobox', {
      name: /end location/i
    }).type("EA-05-50")
    cy.findByRole('option', { name: "EA-05-50" }).click()
    cy.findByRole('checkbox', {  name: /no stairs/i}).click()
    cy.findByRole('button', {  name: /submit/i}).click()
    cy.findByRole('img', {name: /cannot be displayed/i})
    cy.wait(1000);
    cy.get('.imageCount')
    .invoke('text') 
    .then(text => {
      const img_no = splitTextBeforeSlash(text);
      const total_img = splitTextAfterSlash(text);
      const stairs = 'Stairs';
      cy.log(`Image No.: ${img_no}`);
      cy.log(`Total number of images: ${total_img}`);
      for (let i = 0; i < total_img -1; i ++) {
        cy.findByTestId('ArrowRightIcon').click()
        cy.get('img').each(($img) => {
          cy.wrap($img).invoke('attr', 'src').should('not.contain', stairs);
        });
      }})
  })
})

describe("Users can see map,buttons, distance and time if path exists", () => {
  it('does appear', () => {
    cy.visit('http://localhost:3000/')
    cy.findByRole('combobox', {  name: /start location/i}).type("EA-02-11")
    cy.findByRole('option', { name: "EA-02-11" }).click()
    cy.findByRole('combobox', {
      name: /end location/i
    }).type("EA-02-09")
    cy.findByRole('option', { name: "EA-02-09" }).click()
    cy.findByRole('button', {  name: /submit/i}).click()
    cy.findByRole('img', {name: /cannot be displayed/i})
    cy.wait(1000)
    cy.findByText(/total distance:/i)
    cy.findByText(/total estimated time taken:/i)
    cy.get('#root > div:nth-child(2) > div > div > div:nth-child(1) > center > form > svg')
    
  })
})


describe("Users cannot see map or buttons if no path exists", () => {
  it('does not appear', () => {
    cy.visit('http://localhost:3000/')
    cy.findByRole('combobox', {  name: /start location/i}).type("EA-02-11")
    cy.findByRole('option', { name: "EA-02-11" }).click()
    cy.findByRole('combobox', {
      name: /end location/i
    }).type("EA-02-09")
    cy.findByRole('option', { name: "EA-02-09" }).click()
    cy.findByRole('button', {  name: /submit/i}).click()
    cy.findByRole('img', {name: /cannot be displayed/i})
    cy.wait(1000)
    
    cy.findByTestId('ArrowRightIcon').click()
    cy.findByRole('img', {
      name: /cannot display/i
    }).click()
    cy.findByRole('button', {
      name: /block this point\?/i
    }).click()
    cy.findByRole('button', {
      name: /give me an alternate path/i
    }).click()
    cy.findByText(/total distance:/i).should('not.exist')
    cy.findByText(/total estimated time taken:/i).should('not.exist')
    cy.get('#root > div:nth-child(2) > div > div > div:nth-child(1) > center > form > svg').should('not.exist')
  })
})

describe("User can choose more than one stop", () => {
  it ('allows users to get successful paths with multistop', () => {
    cy.visit('http://localhost:3000/')
    cy.findByRole('combobox', {  name: /start location/i}).type("EA-02-11")
    cy.findByRole('option', { name: "EA-02-11" }).click()
    cy.findByRole('combobox', {
      name: /end location/i
    }).type("EA-02-09")
    cy.findByRole('option', { name: "EA-02-09" }).click()
    cy.findByTestId('AddCircleOutlineIcon')
    
  })
})