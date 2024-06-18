import { useState, useEffect} from "react"
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

function PromptForm() {
    const [sourceLocation, setSourceLocation] = useState('')
    const [destinationLocation, setDestinationLocation] = useState('')
    const [messageError, setMessageError] = useState(``) //using messageError variable for html content as well
    const [selectData, setSelectData] = useState([])
    const [selectValue, setSelectValue] = useState('')
    const [selectLocations, setSelectLocations] = useState([])
    const [distance, setDistance] = useState(``)
    const [debug , SetDebug ] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [arrayposition, setCount] = useState(0);
    const [blocked, setBlocked] = useState('');
    const [disableRightButton, setDisableRightButton] = useState(false);
    const [disableLeftButton, setDisableLeftButton] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    let arrayFromString = messageError.split('<br>');
    const [selectedFile, setSelectedFile] = useState(null);

    let parts = blocked.split('/');
    let remainder = parts.slice(8).join('/');
    let indexOfQuote = remainder.indexOf('"');
    let beforeQuote = remainder.slice(0, indexOfQuote);
    console.log("Before quote:", beforeQuote);

    const incrementCounter = (e) => {
        e.preventDefault();
        if(arrayposition !== (arrayFromString.length-2)) { //Using -2 due to nature of splitting string
            setCount(arrayposition + 1);
            setBlocked(arrayFromString[arrayposition+1])
        }
        if (arrayposition === (arrayFromString.length-3)){
            setDisableRightButton(true)
        }
        console.log("Array length: " + arrayFromString.length)
        setDisableLeftButton(false)
      };

      const decrementCounter = (e) => {
        e.preventDefault();
        if(arrayposition !== (0)) {
            setCount(arrayposition - 1);
            setBlocked(arrayFromString[arrayposition-1])
        }
        if (arrayposition === 1){
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
    
    const axiosFetchData = async(processing) => {
        //await axios.get('https://naveng-backend-vercel.vercel.app/users')

        await axios.get('http://localhost:4000/test')

        .then(res => {
            if (processing) {
            setSelectData(res.data)
        }
    })
        .catch(err => console.log("Fetch Error!!"))

    }


    const axiosFetchLocations = async(processing) => {
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
                Debugging: debug
            };
        
            try {
                const response = await axios.post("http://localhost:4000/formPost", postData);
        
                // Update state variables with the response data
                setMessageError(response.data['HTML']);
                setDistance(response.data['Distance'] / 10);
        
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
            } else 
            {
                setMessageError("")
            }
        setMessageError("");
        axiosPostData();   
        setFormSubmitted(true);
        setCount(0);
        setDisableRightButton(false);
        setDisableLeftButton(true);
    }

    const axiosPostBlock = async() => {
        const postData = {
            blocked: blocked
        }

        //await axios.post("https://naveng-backend-vercel.vercel.app/formPost", postData)
        await axios.post("http://localhost:4000/block", postData)

        .then(res => {
            setShowUpload(true)
        })

        arrayFromString = messageError.split('<img src');
    }
    

    return (
        <>
    <div style={{display: "flex", flexDirection: "row" }} >
    <div className="child1"><center>
        <form className="desktopForm">
            <label className="StartAndEndLocation">Start Location</label>
            <Typography  className="description" sx={{marginBottom: "10px", fontFamily: "Lexend"}}>Search or select the location closest to you</Typography>
            <Autocomplete
            
            options={selectLocations} sx={{ width: 250 , fontFamily: 'Georgia, serif' }} renderInput={(params) => (
                <TextField {...params} label="Start Location" ></TextField>
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
            <Typography className="description2" sx={{marginBottom: "10px", fontFamily: "Lexend"}}>Search or select the location closest to your end point</Typography>
            
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
            <br></br>
            <Button variant="contained" type="submit" onClick={handleSubmit} sx ={{ bgcolor: "#cdd8e6", "&:hover": { bgcolor: "#F05C2C"}, fontFamily: "Lexend" }}>Submit</Button>
            <br></br>
            {showUpload && <div><FileUpload/></div>}
            <br></br>
            <Box component="section" sx={{ p: 2, border: '1px grey', bgcolor: '#F5F5F5'}}>
            <h1 className="InstructionsTitle">How to use</h1>
            <p className="InstructionsContent">1) Simply select your closest starting and end location and click Submit!</p>
            <p className="InstructionsContent">2) Wait for the pictures to load...</p>
            <p className="InstructionsContent">3) The first and last picture show the doors to the starting location and end location respectively</p>
            <p className="InstructionsContent">4) With your back facing towards the door of your starting location, refer to the second picture onwards and follow the arrows!</p>
            <p className="InstructionsContent">5) If any location along your path is blocked, please press the block <img src="block_logo.png" alt="Block the location?"  className="instruction-img"></img> button, and an alternate path will be provided for you</p>
            </Box>
            
        </form>
        </center> </div>

        <div className="child2">
            {!formSubmitted 
            && <div><Box 
            component="section"  
            display="flex"
            alignItems="center"
             sx={{ p: 2, border: '1px grey', bgcolor: '#F5F5F5', height: "68vh", marginRight:"10vh" , 
             textAlign: 'center', justifyContent: 'center', color: 'grey', fontFamily: "Lexend"}}>Please select the starting and ending <br></br> locations to view the pictures</Box></div>}
            <center>
            {formSubmitted && <p className= "parametricsDescription">Distance: </p>}
            {formSubmitted && <p className= "parametricsContent">{distance}m</p>}
            <div></div>
            
            {formSubmitted && <p className= "parametricsDescription">Time Taken: </p>}
            {formSubmitted && <p className="parametricsContent"><CalculateTime distance={distance} /></p>}
            </center>
            {formSubmitted && <p className="imageCount">{arrayposition+1}/{arrayFromString.length-1}</p>}

             { formSubmitted && <div className="container">
             <Button variant="contained" type="submit" onClick={decrementCounter} disabled={disableLeftButton}sx ={{ bgcolor: "#D95328" , "&:hover": { bgcolor: "#F05C2C"}, minWidth: 'unset', textAlign: 'center !important', px: '0px', py: '0px', height: "10vh", width: "3vw"}}><ArrowLeftIcon></ArrowLeftIcon></Button>
             <div className="imageContainer">
             <div className="htmlContent" dangerouslySetInnerHTML={{ __html: arrayFromString[arrayposition] }} />
             <br></br>
             <Tooltip title="Block?" arrow>
             <Button className="overlay-button" onClick={axiosPostBlock}><img src="block_logo.png" className="block-logo"></img></Button>
             </Tooltip>
             </div>
             <div className="rightArrow">
          <Button variant="contained" type="submit" onClick={incrementCounter} disabled={disableRightButton} sx ={{ bgcolor: "#D95328" , "&:hover": { bgcolor: "#F05C2C"}, minWidth: 'unset', textAlign: 'center !important', px: '0px', py: '0px', height: "10vh", width: "3vw"}}><ArrowRightIcon></ArrowRightIcon></Button>
          </div>
        </div>}

        </div>
        </div>
        </>
    )
}

export default PromptForm