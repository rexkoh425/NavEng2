import React from 'react';

const DestinationNotification = ({ stopsIndex, arrayposition, destinationLocation, MultiStopArray}) => {

    if (stopsIndex.includes(arrayposition)) {
        let index = stopsIndex.indexOf(arrayposition);
        return (
            <p className="destinationNotification">You have arrived at {MultiStopArray[index+1]}</p>
        )
    }
};

export default DestinationNotification;