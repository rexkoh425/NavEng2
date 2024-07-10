import React from 'react';

// Functional component to divide each element of an array by 10
const ConvertToMetres = ({ distanceArrayx10 }) => {
  // Map over the array and divide each element by 10
  

  const dividedNumbers = distanceArrayx10.map(num => num / 10.0);
  let distArray = dividedNumbers.map(num => Math.round(num))
  //let distArray = dividedNumbers.map(str => parseInt(str, 10));
  console.log("Total Distance array:" + distArray)
  const totalDistance = distArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  console.log("Total Distance:" + totalDistance)

  const remainingDistances = distArray.reduce((acc, distArray) => {
    // Subtract each distance from the accumulator (starting with totalDistance)
    acc.push(acc[acc.length - 1] - distArray);
    return acc;
}, [totalDistance]); // Start with an array containing totalDistance as the first element



  // Return the modified array (dividedNumbers)
  return remainingDistances;

}
export default ConvertToMetres; // Export the component as default