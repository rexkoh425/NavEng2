import React from 'react';

const CalculateTime = ({ distance }) => {
    if (Math.round((distance/1.4)/60) > 1.5) {return (
        <p className='time-taken'>
          {Math.round((distance/1.4)/60)} minute
          
        </p>
      )}
      else if (Math.round((distance/1.4)/60) > 0.5) {return (
        <p className='time-taken'>
          1 minute
        </p>
      )}
      else { return (
        <p className='time-taken'>Less than one minute</p>
      )}
  
};

export default CalculateTime;