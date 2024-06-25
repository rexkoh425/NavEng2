import React from 'react'
import DestinationNotification from './DestinationNotification'

describe('<DestinationNotification />', () => {
  it('does not display any message if the array position < stopsIndex', () => {
    cy.mount(<DestinationNotification stopsIndex={[5]} MultiStopArray={["L1","L2"]} arrayposition={4}/>)
    cy.get('.destinationNotification').should('not.exist');
  })

  it('does not display any message if the array position > stopsIndex', () => {
    cy.mount(<DestinationNotification stopsIndex={[5]} MultiStopArray={["L1","L2"]} arrayposition={6}/>)
    cy.get('.destinationNotification').should('not.exist');
  })

  it('displays message if the array position = stopsIndex', () => {
    cy.mount(<DestinationNotification stopsIndex={[5]} MultiStopArray={["L1","L2"]} arrayposition={5}/>)
    cy.get('.destinationNotification').should('contain.text', 'You have arrived at L2');
  })

  it('displays message if the array position = stopsIndex for multistop', () => {
    cy.mount(<DestinationNotification stopsIndex={[5,7]} MultiStopArray={["L1","L2","L3"]} arrayposition={5}/>)
    cy.get('.destinationNotification').should('contain.text', 'You have arrived at L2');
  })

  it('displays message if the array position = stopsIndex for multistop', () => {
    cy.mount(<DestinationNotification stopsIndex={[5,7]} MultiStopArray={["L1","L2","L3"]} arrayposition={7}/>)
    cy.get('.destinationNotification').should('contain.text', 'You have arrived at L3');
  })
})