import React from "react";

//To output the image on mobile

function imageOutputMobile({ imgPath }) {
    return (
        <img
          src={imgPath}
          alt="cannot be displayed"
          className="htmlContentMobile" 
        />
    );
  }

  export default imageOutputMobile