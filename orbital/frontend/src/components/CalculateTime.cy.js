import React from 'react'
import CalculateTime from './CalculateTime'

describe('<CalculateTime />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<CalculateTime />)
  })
})

describe('Checking whether calculate time has the desired output', () => {
  it('displays the correct output when distance is 0', () => {
    cy.mount(<CalculateTime distance={0} />); 

    cy.get('.time-taken').should('contain.text', '< 1 minute');
  });

  it('displays the correct output when distance results in "< 1 minute"', () => {

    cy.mount(<CalculateTime distance={34} />); 
   
    cy.get('.time-taken').should('contain.text', '< 1 minute');
  });

  it('displays the correct output when distance results in exactly 0.5 minutes', () => {
   
    cy.mount(<CalculateTime distance={36} />); 

    cy.get('.time-taken').should('contain.text', '1 minute');
  });

  it('displays the correct output when distance results in "one minute"', () => {
  
    cy.mount(<CalculateTime distance={37} />); 

    cy.get('.time-taken').should('contain.text', '1 minute'); 
  });

  it('displays the correct output when distance results in the upper boundary of "one minute"', () => {
  
    cy.mount(<CalculateTime distance={107} />); 

    cy.get('.time-taken').should('contain.text', '1 minute'); 
  });

  it('displays the correct output when distance results in more than one minute', () => {
  
    cy.mount(<CalculateTime distance={108} />); 

    cy.get('.time-taken').should('contain.text', Math.round((108/1.2)/60) + ' minute'); 
  });

  it('displays the correct output when distance results in more than one minute', () => {
  
    cy.mount(<CalculateTime distance={450} />); 

    cy.get('.time-taken').should('contain.text', Math.round((450/1.2)/60) + ' minute'); 
  });
});
