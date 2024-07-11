import React from "react";

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