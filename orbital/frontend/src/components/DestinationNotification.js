import React from 'react';

const DestinationNotification = ({ stopsIndex, arrayposition, MultiStopArray, pathInstructions}) => {
    if (arrayposition === 0) {
        return (
            <p className="startNotification">You are at the starting location {MultiStopArray[0]}</p>
        )
    }
    else if (stopsIndex.includes(arrayposition)) {
        let index = stopsIndex.indexOf(arrayposition);
        return (
            <p className="destinationNotification">You have arrived at {MultiStopArray[index+1]}</p>
        )
    }
    else {
        return (
            <p className="pathInstructions">{pathInstructions[arrayposition]}</p>
        )
        
    }
};

export default DestinationNotification;