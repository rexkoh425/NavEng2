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