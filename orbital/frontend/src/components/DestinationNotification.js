import React from 'react';

const DestinationNotification = ({ stopsIndex, arrayposition, MultiStopArray, pathInstructions, blockedIndicator}) => {
    if (arrayposition === 0 && !blockedIndicator) {
        return (
            <p className="startNotification">You are at the starting location {MultiStopArray[0]}</p>
        )
    }
    else if (arrayposition === 0) {
        return (
            <p className="startNotification">Please follow the new path</p>
        )
    }
    else if (stopsIndex.includes(arrayposition)) {
        let index = stopsIndex.indexOf(arrayposition);
        return (
            <p className="destinationNotification">You have arrived at {MultiStopArray[index+1]}</p>
        )
    }
    else if (arrayposition > stopsIndex) {
        return
    }
    else {
        return (
            <p className="pathInstructions">{pathInstructions[arrayposition]}</p>
        )
        
    }
};

export default DestinationNotification;