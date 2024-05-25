/*import React, {useState} from 'react'

function Navbar() {
  return (
    <>
    <nav className="nav-bar">
      <img src="NavEng_transparent_logo.png" alt="NavEng" width="100" ></img>
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
        <a href="/feedback">Feedback</a>
        </li>
      </ul>
    </nav>
    </>
  )
} 

export default Navbar */

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

export default function NavBar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            News
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}