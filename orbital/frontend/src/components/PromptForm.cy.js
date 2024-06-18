import React from 'react'
import PromptForm from './PromptForm'

describe('<PromptForm />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<PromptForm />)
  })
})