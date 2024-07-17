import React from "react";

function imageOutputMobile({ imgPath , arrayposition}) {
    if (arrayposition != 0) {
      return (
        <img
          src={imgPath}
          alt="cannot be displayed"
          className="htmlContentMobile" 
        />
    );
  }
}

  export default imageOutputMobile