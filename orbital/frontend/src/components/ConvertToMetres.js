import React from 'react';

//Component to convert distance to metres and store in decrementing array

// Functional component to divide each element of an array by 10
const ConvertToMetres = ({ distanceArrayx10 }) => {
  // Map over the array and divide each element by 10
  

  const dividedNumbers = distanceArrayx10.map(num => num / 10.0);
  let distArray = dividedNumbers.map(num => Math.round(num))

  const totalDistance = distArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  const remainingDistances = distArray.reduce((acc, distArray) => {
  
    acc.push(acc[acc.length - 1] - distArray);
    return acc;
}, [totalDistance]); 


  return remainingDistances;

}
export default ConvertToMetres;