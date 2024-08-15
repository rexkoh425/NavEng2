import React from "react";

//To output the image on desktop

function imageOutput({ imgPath }) {
    return (
        <img
          src={imgPath}
          alt="cannot be displayed"
          className="htmlContent" 
        />
    );
  }

  export default imageOutput