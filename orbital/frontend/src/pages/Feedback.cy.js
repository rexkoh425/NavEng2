import React from 'react'
import Feedback from './Feedback'

describe('<Feedback />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Feedback />)
  })
})

describe('Test whether users can select the different feedback types', () => {
  it('is possible (option 1)', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Feedback />)
    cy.findByRole('combobox', {  name: /issue/i}).type('Report bug with website')
    cy.findByRole('option', { name: 'Report bug with website' }).click()
  })

  it('is possible (option 2)', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Feedback />)
    cy.findByRole('combobox', {  name: /issue/i}).type('Report a path')
    cy.findByRole('option', { name: 'Report a path' }).click()
  })
})

describe('Test whether user can see the corresponding form depending on feedback type', () => {
  it('is possible (option 1)', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Feedback />)
    cy.findByRole('combobox', {  name: /issue/i}).type('Report bug with website')
    cy.findByRole('option', { name: 'Report bug with website' }).click()
    cy.findByText(/please give us the details of the bug/i)
  })

  it('is possible (option 2)', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Feedback />)
    cy.findByRole('combobox', {  name: /issue/i}).type('Report a path')
    cy.findByRole('option', { name: 'Report a path' }).click()
    cy.findByText(/Please provide us with the stops along the path/i)
  })
})

describe('Test whether user can submit form', () => {
  it('is possible (option 1)', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Feedback />)
    cy.findByRole('combobox', {  name: /issue/i}).type('Report bug with website')
    cy.findByRole('option', { name: 'Report bug with website' }).click()
    cy.findByRole('textbox').type('Test Message')
    cy.findByRole('button', {
      name: /submit/i
    }).click()
    cy.findByText(/thank you for your feedback!/i)
  })

  it('is possible (option 2)', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Feedback />)
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

describe('Test whether user receives appropriate warning if filled wrong', () => {
  it('gets warning (option 1)', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Feedback />)
    cy.findByRole('combobox', {  name: /issue/i}).type('Report bug with website')
    cy.findByRole('option', { name: 'Report bug with website' }).click()
    cy.findByRole('button', {
      name: /submit/i
    }).click()
    cy.findByText(/Please provide some details about the bug/i)
  })

  it('gets warning (option 2)', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Feedback />)
    cy.findByRole('combobox', {  name: /issue/i}).type('Report a path')
    cy.findByRole('option', { name: 'Report a path' }).click()
    cy.findByRole('button', {
      name: /submit/i
    }).click()
    cy.findByText(/Please fill out the nodes/i)
  })
})
