import React from 'react';

// Functional component to divide each element of an array by 10
const ConvertToMetres = ({ distanceArrayx10 }) => {
  // Map over the array and divide each element by 10
  const dividedNumbers = distanceArrayx10.map(num => num / 10);

  // Return the modified array (dividedNumbers)
  return dividedNumbers;
}
export default ConvertToMetres; // Export the component as default