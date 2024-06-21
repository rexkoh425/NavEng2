import { useState, useEffect } from "react"
import axios from "axios"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Typography } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import "@fontsource/lexend"; // Defaults to weight 400
import "@fontsource/lexend/400.css";
import "@fontsource/lexend/300.css";
import Tooltip from '@mui/material/Tooltip';
import FileUpload from "./FileUpload";
import CalculateTime from './CalculateTime';
import ConvertToMetres from './ConvertToMetres';
import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';


function PromptFormMobile() {

    const [sourceLocation, setSourceLocation] = useState('')
    const [destinationLocation, setDestinationLocation] = useState('')
    const [messageError, setMessageError] = useState(``) //using messageError variable for html content as well
    const [selectData, setSelectData] = useState([])
    const [selectValue, setSelectValue] = useState('')
    const [selectLocations, setSelectLocations] = useState([])
    const [totalDistance, setTotalDistance] = useState(``)
    const [distanceArray, setDistanceArray] = useState([])
    const [debug, SetDebug] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [arrayposition, setCount] = useState(0);
    const [blockedMessage, setBlockedMessage] = useState('');
    const [beforeBlocked, setBeforeBlocked] = useState('');
    const [blocked, setBlocked] = useState('');
    const [blockedNodeID, setBlockedNodeID] = useState('');
    const [disableRightButton, setDisableRightButton] = useState(false);
    const [disableLeftButton, setDisableLeftButton] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    let arrayFromString = messageError.split('<br>');
    const [selectedFile, setSelectedFile] = useState(null);
    const [sheltered, setSheltered] = useState(false);

    let blockedNodeid = ""
    let parts = blocked.split('/');
    let remainder = parts.slice(8).join('/');
    let indexOfQuote = remainder.indexOf('"');
    let beforeQuote = remainder.slice(0, indexOfQuote);

    let beforeparts = beforeBlocked.split('/');
    let beforeremainder = beforeparts.slice(8).join('/');
    let beforeindexOfQuote = beforeremainder.indexOf('"');
    let beforebeforeQuote = beforeremainder.slice(0, beforeindexOfQuote);
    const node_string = beforebeforeQuote.split("_")[0];
    const before_node_id = parseInt(node_string);

    const incrementCounter = (e) => {
        e.preventDefault();
        if (arrayposition !== (arrayFromString.length - 2)) { //Using -2 due to nature of splitting string
            setCount(arrayposition + 1);
            setBlocked(arrayFromString[arrayposition + 1])
            setBeforeBlocked(arrayFromString[arrayposition])
        }
        if (arrayposition === (arrayFromString.length - 3)) {
            setDisableRightButton(true)
        }
        setDisableLeftButton(false)
    };

    const decrementCounter = (e) => {
        e.preventDefault();
        if (arrayposition !== (0)) {
            setCount(arrayposition - 1);
            setBlocked(arrayFromString[arrayposition - 1])
            if (arrayposition !== (1)) {
            setBeforeBlocked(arrayFromString[arrayposition-2])
        }
        }
        if (arrayposition === 1) {
            setDisableLeftButton(true)
        }
        setDisableRightButton(false)
    };

    useEffect( () => {
        let processing = true
        axiosFetchData(processing)
        axiosFetchLocations(processing)
        SetDebug(true);
        return () => {
            processing = false
        }
    },[])
    
    const axiosFetchData = async (processing) => {
        //await axios.get('https://naveng-backend-vercel.vercel.app/users')

        await axios.get('http://localhost:4000/test')

            .then(res => {
                if (processing) {
                    setSelectData(res.data)
                }
            })
            .catch(err => console.log("Fetch Error!!"))

    }

    const axiosFetchLocations = async (processing) => {
        //await axios.post('https://naveng-backend-vercel.vercel.app/locations')
        await axios.post('http://localhost:4000/locations')
            .then(res => {
                setSelectLocations(res.data)
            })
            .catch(err => console.log("Fetch Location Error!!"))
    }

    const axiosPostData = async () => {
        const postData = {
            source: sourceLocation,
            destination: destinationLocation,
            Debugging: debug,
            current_blocked: blockedNodeID,
            sheltered: sheltered,
        };

        try {
            const response = await axios.post("http://localhost:4000/formPost", postData);

            // Update state variables with the response data
            setMessageError(response.data['HTML']);
            setTotalDistance(response.data['Distance'] / 10);
            const distArray = response.data['Dist_array'];
            handleConvertToMetres(distArray)

            // Perform split operation inside the then block
            const arrayFromString = response.data['HTML'].split('<img src');
            setBlocked(arrayFromString[1]);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const axiosPostDataRefresh = async () => {
        const postData = {
            source: before_node_id,
            destination: destinationLocation,
            Debugging: debug,
            current_blocked: blockedNodeID,
            sheltered: sheltered,
        };

        try {
            const response = await axios.post("http://localhost:4000/blockRefresh", postData);

            // Update state variables with the response data
            setMessageError(response.data['HTML']);
            setTotalDistance(response.data['Distance'] / 10);
            const distArray = response.data['Dist_array'];
            handleConvertToMetres(distArray)

            // Perform split operation inside the then block
            const arrayFromString = response.data['HTML'].split('<img src');
            setBlocked(arrayFromString[1]);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault()

        console.log(sourceLocation + ' | ' + selectValue + ' | ' + destinationLocation)

        if (sourceLocation === destinationLocation) {
            alert('Entries cannot be the same');
            return;
        }

        if (!destinationLocation) {
            setMessageError("Destination is empty. Please enter a Destination.")
        } else {
            setMessageError("")
        }
        setMessageError("");
        axiosPostData();
        setFormSubmitted(true);
        setCount(0);
        setDisableRightButton(false);
        setDisableLeftButton(true);
    }

    const handleSubmitRefresh = (e) => {
        e.preventDefault()

        console.log(sourceLocation + ' | ' + selectValue + ' | ' + destinationLocation)

        if (sourceLocation === destinationLocation) {
            alert('Entries cannot be the same');
            return;
        }

        if (!destinationLocation) {
            setMessageError("Destination is empty. Please enter a Destination.")
        } else {
            setMessageError("")
        }
        setMessageError("");
        axiosPostDataRefresh();
        setFormSubmitted(true);
        setCount(0);
        setDisableRightButton(false);
        setDisableLeftButton(true);
        setShowUpload(false);
    }

    const axiosPostBlock = async (e) => {
        try {
          const postData = {
            img_string: beforeQuote
          };
    
          // Send POST request to insertBlocked endpoint
          const response = await axios.post("http://localhost:4000/insertBlocked", postData);
    
          // Update state variables after successful response
          setShowUpload(true);
          const blockdata = response.data;
          setBlockedMessage(blockdata['message']);
          console.log("blocked message: " + blockdata['message']); // Log the message
          console.log("blocked nodeID: " + blockdata['node']); // Log the node ID
          console.log("blocked nodeID variable: " + blockedNodeid); // Log the node ID
          console.log("before_node_id" + before_node_id)
          setBlockedNodeID(blockdata['node'])

        } catch (error) {
          console.error('Error posting block:', error);
        }
      };

    const handleConvertToMetres = (distArray) => {
        const dividedDistance = ConvertToMetres({ distanceArrayx10: distArray }); 
        setDistanceArray(dividedDistance); 
    }

    const handleCheckbox = (event) => {
        setSheltered(event.target.checked);
      };

    return (
        <>
        <form className="mobileForm">
        <center>
            <label className="StartAndEndLocation">Start Location</label>
            <Typography  className="description" sx={{marginBottom: "10px" , fontFamily: "Lexend"}}>Search or select the location closest to you</Typography>
            <Autocomplete
            options={selectLocations} sx={{ width: 250 }} renderInput={(params) => (
                <TextField {...params} label="Start Location"></TextField>
            )}
            onChange={(event, value) => {
                if (value) {
                    setSourceLocation(value);
                } else {
                    setSourceLocation(""); // Handle case when value is cleared
                }
            }
        }
            >
            </Autocomplete>
            <br></br>
            <br></br>
            <label className="StartAndEndLocation">End Location</label>
            <Typography className="description" sx={{marginBottom: "10px" , fontFamily: "Lexend"}}>Search or select the location closest to your end point</Typography>
            
            <Autocomplete
            options={selectLocations} sx={{ width: 250 }} renderInput={(params) => (
                <TextField {...params} label="End Location"></TextField>
            )}
            onChange={(event, value) => {
                if (value) {
                    setDestinationLocation(value);
                } else {
                    setDestinationLocation(""); // Handle case when value is cleared
                }
            }
        }
            >
            </Autocomplete>
            <br></br>
                        <FormControlLabel control={<Checkbox defaultChecked sx={{
                            color: "#cdd8e6",
                            '&.Mui-checked': {
                                color: "#F05C2C",
                            },
                        }} checked={sheltered}
                        onChange={handleCheckbox}/>} label="Sheltered Path" sx={{ fontFamily: "Lexend" }} />
            <br></br>
            <Button variant="contained" type="submit" onClick={handleSubmit} sx ={{ bgcolor: "#cdd8e6", "&:hover": { bgcolor: "#F05C2C"}, }}>Submit</Button>
            <br></br>
            <br></br>
            <Box component="section" sx={{ p: 2, border: '1px grey', bgcolor: '#F5F5F5'}}>
            <h1 className="InstructionsTitle">How to use</h1>
            <p className="InstructionsContent">1) Simply select your closest starting and end location and click Submit!</p>
            <p className="InstructionsContent">2) Wait for the pictures to load...</p>
            <p className="InstructionsContent">3) The first and last picture show the doors to the starting location and end location respectively</p>
            <p className="InstructionsContent">4) With your back facing towards the door of your starting location, refer to the second picture onwards and follow the arrows!</p>
    </Box>
    </center>
        </form>
        
        
        <div className="child2mobile">
            {!formSubmitted 
            && <div><Box 
            component="section"  
            display="flex"
            alignItems="center"
             sx={{ p: 2, border: '1px grey', bgcolor: '#F5F5F5', height: "68vh", marginRight:"0px" , 
             textAlign: 'center', justifyContent: 'center', color: 'grey'}}>Please select the starting and ending <br></br> locations to view the pictures</Box></div>}
            
            <center>
            {formSubmitted && <p className="parametricsDescription">Total Distance: </p>}     
                        {formSubmitted && <p className="parametricsContent">{totalDistance}m</p>}

                        <div></div>
                        {formSubmitted && <p className="parametricsDescription">Total Estimated Time Taken: </p>}
                        {formSubmitted && <div className="parametricsContent"><CalculateTime distance={totalDistance} /></div>}
                        <br></br>
                        <br></br>
                        {formSubmitted && <p className="parametricsDescription">Remaining Distance: </p>}
                        {formSubmitted && <p className="parametricsContent">{distanceArray[arrayposition]}m</p>}

                        <div></div>
                        {formSubmitted && <p className="parametricsDescription">Time to Destination: </p>}
                        {formSubmitted && <div className="parametricsContent"><CalculateTime distance={distanceArray[arrayposition]} /></div>}

            {formSubmitted && <p className="imageCountMobile">{arrayposition+1}/{arrayFromString.length-1}</p>}
             { formSubmitted && <div className="containerMobile">
             <Button variant="contained" type="submit" onClick={decrementCounter} 
             sx ={{ bgcolor: "#D95328" , "&:hover": { bgcolor: "#F05C2C"}, minWidth: 'unset', 
             textAlign: 'center !important', px: '0px', py: '0px', height: "15vh", width: "10vw"}}><ArrowLeftIcon></ArrowLeftIcon></Button>
                                     <div className="imageContainer">
                            <div className="htmlContent" dangerouslySetInnerHTML={{ __html: arrayFromString[arrayposition] }} />
                            <br></br>
                            <Tooltip title="Block?" arrow>
                                <Button className="overlay-button-mobile" onClick={axiosPostBlock}><img src="block_logo.png" className="block-logo"></img></Button>
                            </Tooltip>
                            {showUpload && <div className="overlay-refresh">
                            <Button variant="contained" type="submit" onClick={handleSubmitRefresh} sx={{ bgcolor: "#D95328", "&:hover": { bgcolor: "#F05C2C" }, fontFamily: "Lexend" }}>Give me an alternate path</Button>
                        </div>}
                            
                        </div>
          <Button variant="contained" type="submit" onClick={incrementCounter} 
          sx ={{ bgcolor: "#D95328" , "&:hover": { bgcolor: "#F05C2C"}, minWidth: 'unset', 
          textAlign: 'center !important', px: '0px', py: '0px', height: "15vh", width: "10vw"}}><ArrowRightIcon></ArrowRightIcon></Button>
          

        </div>}
        {showUpload && <div><FileUpload /></div>}
        </center>
        </div>
        
        </>
    )
}

export default PromptFormMobile