import React from "react";

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