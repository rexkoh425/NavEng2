import { useState, useEffect} from "react"
import axios from "axios"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Typography } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';

function PromptForm() {

    const [sourceLocation, setSourceLocation] = useState('')
    const [destinationLocation, setDestinationLocation] = useState('')
    const [messageError, setMessageError] = useState(``) //using messageError variable for html content as well
    const [selectData, setSelectData] = useState([])
    const [selectValue, setSelectValue] = useState('')
    const [selectLocations, setSelectLocations] = useState([])
    const [debug , SetDebug ] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [arrayposition, setCount] = useState(0);
    let arrayFromString = messageError.split('<br>');

    const incrementCounter = (e) => {
        e.preventDefault();
        if(arrayposition !== (arrayFromString.length-2)) { //Using -2 due to nature of splitting string
            setCount(arrayposition + 1);
        }
      };

      const decrementCounter = (e) => {
        e.preventDefault();
        if(arrayposition !== (0)) {
            setCount(arrayposition - 1);
        }
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
        await axios.get('http://localhost:4000/users')
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
    
    const axiosPostData = async() => {
        const postData = {
            source: sourceLocation,
            destination: destinationLocation,
            Debugging : debug
        }

        //await axios.post("https://naveng-backend-vercel.vercel.app/formPost", postData)
        await axios.post("http://localhost:4000/formPost", postData)
        .then(res => setMessageError(res.data['HTML']));
        arrayFromString = messageError.split('<img src');
    }
 
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
        setFormSubmitted(true);
        axiosPostData();   
    }

    return (
        <>
<div style={{display: "flex", flexDirection: "row" }} >
    <div className="child1"><center>
        <form>
            <label className="StartAndEndLocation">Start Location</label>
            <Typography  className="description" sx={{marginBottom: "10px"}}>Search or select the location closest to you</Typography>
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
            <Typography className="description" sx={{marginBottom: "10px"}}>Search or select the location closest to your end point</Typography>
            
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
            
            

        </form>
        
        </center> </div>
        <div className="child2">
            {!formSubmitted 
            && <div><Box 
            component="section"  
            display="flex"
            alignItems="center"
             sx={{ p: 2, border: '1px grey', bgcolor: '#F5F5F5', height: "68vh", marginRight:"100px" , 
             textAlign: 'center', justifyContent: 'center', color: 'grey'}}>Please select the starting and ending <br></br> locations to view the pictures</Box></div>}
            {formSubmitted && <p className="imageCount">{arrayposition+1}/{arrayFromString.length-1}</p>}
             { formSubmitted && <div className="container">
             <Button variant="contained" type="submit" onClick={decrementCounter} sx ={{ bgcolor: "#D95328" , "&:hover": { bgcolor: "#F05C2C"}, minWidth: 'unset', textAlign: 'center !important', justifyContent: 'center' , px: '0px', py: '0px', display: "inline-block", height: "100px", width: "50px"}}><ArrowLeftIcon></ArrowLeftIcon></Button>
             <div className="htmlContent" dangerouslySetInnerHTML={{ __html: arrayFromString[arrayposition] }} />
          <Button variant="contained" type="submit" onClick={incrementCounter} sx ={{ bgcolor: "#D95328" , "&:hover": { bgcolor: "#F05C2C"}, minWidth: 'unset', textAlign: 'center !important', justifyContent: 'center', px: '0px', py: '0px', display: "inline-block", height: "100px", width: "50px"}}><ArrowRightIcon></ArrowRightIcon></Button>

        </div>}

        </div>
        </div>
        </>
    )
}

export default PromptForm