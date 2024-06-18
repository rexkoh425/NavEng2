import React from 'react';

const CalculateTime = ({ distance }) => {
    console.log("eek" + distance)
    if (Math.round((distance/1.4)/60) > 1.5) {return (
        <div className='time-taken'>
          {Math.round((distance/1.4)/60)} minute
          
        </div>
      )}
      else if (Math.round((distance/1.4)/60) > 0.5) {return (
        <div className='time-taken'>
          1 minute
        </div>
      )}
      else { return (
        <div className='time-taken'>Less than one minute</div>
      )}
  
};

export default CalculateTime;