import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Hidden } from '@mui/material';

const Instructions = () => {
    const [expanded, setExpanded] = useState(false);
    const [arrowRotation, setArrowRotation] = useState(0);
   const [isMobile, setIsMobile] = useState(false);


   useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.matchMedia("only screen and (max-width: 768px)").matches);
    };
    checkIsMobile();

    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      console.log("Mobile")
      setArrowRotation(180)
      setExpanded(false)
     } else {
      console.log("Desktop")
      setArrowRotation(0)
      setExpanded(true)
     }
  }, [isMobile])

    const toggleExpanded = () => {
        setExpanded(!expanded);
        setArrowRotation(arrowRotation === 0 ? 180 : 0);
      };

return (
<Box component="section" sx={{ p: 2, paddingTop: 0, border: '1px grey', bgcolor: '#F5F5F5' , transition: 'height 0.3s ease-in-out',  position: 'relative',
    overflow: 'hidden',
    height: expanded ? 'auto' : '85px', }}>
        <Box component="section" sx={{ p: 2, border: '1px grey', bgcolor: '#F5F5F5' ,transition: 'height 0.3s ease-in-out', marginTop: '0px'}}>
    <h1 className="InstructionsTitle">How to use</h1>
    <p className="InstructionsContent">1) Simply select your closest starting and end location and click Submit!</p>
    <p className="InstructionsContent">2) Wait for the pictures to load...</p>
    <p className="InstructionsContent">3) The first and last picture show the doors to the starting location and end location respectively</p>
    <p className="InstructionsContent">4) With your back facing towards the door of your starting location, refer to the second picture onwards and follow the arrows!</p>
    <p className="InstructionsContent">5) If any location along your path is blocked, please press the block <img src="block_logo.png" alt="Block the location?"  className="instruction-img"></img> button, and an alternate path will be provided for you</p>
    <Hidden mdUp><p className="InstructionsContent">6) You can swipe the image to access the next image</p></Hidden>
    </Box>
    <IconButton          sx={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          translate: '-20px ', // Center horizontally
          backgroundColor: '#fff',
          bottom: '5px',
          transition: 'transform 0.3s ease', // Add transition for smooth rotation
          '&:hover': {
            backgroundColor: 'white', // Ensure button remains clickable
          },
          transform: `rotate(${arrowRotation+180}deg)`, // Rotate the arrow based on arrowRotation state
        }}
         onClick={toggleExpanded}>
        <ExpandMoreIcon />
      </IconButton>
    </Box>
    )
}
export default Instructions;
