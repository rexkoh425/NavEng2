describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/')
  })
})

describe("Start Location Visible", () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.findByRole('combobox', {name: /start location/i}).type("eek");
  })
})