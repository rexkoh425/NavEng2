import Box from '@mui/material/Box';
import React, { useState } from 'react';
import axios from "axios"
//import { Button, Grid, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

//Component to allow users to upload picture of blocked path

const FileUpload = () => {

  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const Local = process.env.REACT_APP_LOCAL;
  let websitelink = ""
  if (Local == "true") {
    websitelink = "http://localhost:4000"
  } else {
    websitelink = "https://naveng-backend-vercel.vercel.app"
  }

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage("")
  };

  const axiosPostData = async () => {
    const formData = new FormData();
    // Append the file to FormData with the field name 'photo'
    formData.append('photo', selectedFile);
  
    try {
      const response = await axios.post(websitelink + '/blocked_img', formData);
  
      setMessage(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleUpload = () => {
    
    console.log('Selected File:', selectedFile);
    // Resetting selected file state after upload
    setSelectedFile(null);
    axiosPostData();
  };

  return (
    <Box component="section"  
    display="flex"
    alignItems="center"
     sx={{ p: 2, border: '1px grey', bgcolor: '#F5F5F5', marginTop: "20px",
     textAlign: 'center', justifyContent: 'center', color: 'grey', fontFamily: "Lexend"}}>
    <p>If you would like to help identify a location as blocked for all of the users, please send a picture of the blockage</p>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="file-upload-button"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload-button">
          <Button variant="contained" component="span" sx ={{ bgcolor: "#cdd8e6", "&:hover": { bgcolor: "#F05C2C"}, fontFamily: "Lexend" }}>
            Choose File
          </Button>
          <br></br>
          <Typography variant="body1" sx ={{ fontFamily: "Lexend", fontSize: "12px", marginTop: "10px"}}>{message}</Typography>
        </label>
        {selectedFile && (<>
          <Typography variant="body1" sx ={{ fontFamily: "Lexend", fontSize: "12px", marginTop: "10px"}}>
            Selected File: {selectedFile.name}
          </Typography>
          </>
        )}
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary" sx ={{ bgcolor: "#cdd8e6", "&:hover": { bgcolor: "#F05C2C"}, fontFamily: "Lexend" }}
          onClick={handleUpload}
          disabled={!selectedFile}
        >
          Upload
        </Button>
      </Grid>
    </Grid>
    </Box>
  );
};

export default FileUpload;