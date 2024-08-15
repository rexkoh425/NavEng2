import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { NavLink, Outlet} from 'react-router-dom';

//Component for the website's Navbar

export default function ButtonAppBar() {
  return (
    <>
    <Box sx={{ flexGrow: 1}}>
      <AppBar position="static" sx ={{ bgcolor: "#cdd8e6"}}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}> <img src="NavEng_transparent_logo_new.png" className="NavEng_Logo" alt="NavEng" width="100" ></img>
          </Typography>
          <Button component={NavLink} to="/" color="inherit">Home</Button>
          <Button component={NavLink} to="/feedback" color="inherit">Feedback</Button>
        </Toolbar>
      </AppBar>
    </Box>
    <Outlet/>
    </>
  );
}