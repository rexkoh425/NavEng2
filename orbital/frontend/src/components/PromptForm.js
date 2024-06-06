import { useState, useEffect} from "react"
import axios from "axios"
import logo from '../logo.svg'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Typography } from "@mui/material";
import Container from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';

function PromptForm() {

    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [messageError, setMessageError] = useState(``)
    const [selectData, setSelectData] = useState([])
    const [selectValue, setSelectValue] = useState('')
    const [formSubmitted, setFormSubmitted] = useState(false);
    let HTMLstuff = ``
    let arrayFromString = messageError.split('<br>');
    let arrayposition = 0;

    useEffect( () => {
        let processing = true
        axiosFetchData(processing)
        return () => {
            processing = false
        }
    },[])
    
    const axiosFetchData = async(processing) => {
        await axios.get('https://naveng-backend-vercel.vercel.app/users')
        //await axios.get('http://localhost:4000/users')
        .then(res => {
            if (processing) {
            setSelectData(res.data)
        }
    })
        .catch(err => console.log("Fetch Error!!"))

    }

    const axiosPostData = async() => {
        const postData = {
            /*source: email,
            destination: selectValue,
            message: message */
            source: email,
            destination: message
            
        }

        await axios.post("https://naveng-backend-vercel.vercel.app/formPost", postData)
        //await axios.post("http://localhost:4000/formPost", postData)
        .then(res => setMessageError(res.data))
        arrayFromString = messageError.split('<img src');
        //console.log(messageError); // Log the HTML content
    }

    const increment = (e) => {
        e.preventDefault()
        e++
    }
 
    const handleSubmit = (e) => {
        e.preventDefault()

        console.log(email + ' | ' + selectValue + ' | ' + message)
        
        if (email === message) {
            alert('Entries cannot be the same');
            return;
        }

        if (!message) {
                setMessageError("Destination is empty. Please enter a Destination.")
            } else 
            {
                setMessageError("")
            }
        setMessageError("")
        setFormSubmitted(true);
        axiosPostData()     
    }
    const locations = ['EA-02-08', 'EA-02-09', 'EA-02-10', 'EA-02-11', 'EA-02-14', 'EA-02-16', 'EA-02-17', 'EA-02-18'];
    const myHTML = `<img src = "https://bdnczrzgqfqqcoxefvqa.supabase.co/storage/v1/object/public/Pictures/11_30_-330_2_North_North_T_junction_NIL.png" alt = "cannot be displayed" width = "100" height = "100"></img><br></br>`; //For debugging

    return (
        <>
<div style={{display: "flex", flexDirection: "row" }} >
    <div className="child1"><center>
        <form>
            <label className="StartAndEndLocation">Start Location</label>
            <Typography  className="description" sx={{marginBottom: "10px"}}>Search or select the location closest to you</Typography>
            <Autocomplete
            options={locations} sx={{ width: 250 }} renderInput={(params) => (
                <TextField {...params} label="Start Location"></TextField>
            )}
            onChange={(event, value) => {
                if (value) {
                    setEmail(value);
                } else {
                    setEmail(""); // Handle case when value is cleared
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
            options={locations} sx={{ width: 250 }} renderInput={(params) => (
                <TextField {...params} label="End Location"></TextField>
            )}
            onChange={(event, value) => {
                if (value) {
                    setMessage(value);
                } else {
                    setMessage(""); // Handle case when value is cleared
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
            
            {arrayFromString[1]}
            <Button variant="contained" type="submit" onClick={handleSubmit}>Ree</Button>
    </Box>
            
            

        </form>
        </center> </div>
        <div className="child2">
            {!formSubmitted 
            && <div><Box 
            component="section"  
            display="flex"
            alignItems="center"
            
             sx={{ p: 2, border: '1px grey', bgcolor: '#F5F5F5', height: "68vh", marginRight:"100px" , textAlign: 'center', justifyContent: 'center', color: 'grey'}}>Please select the starting and ending <br></br> locations to view the pictures</Box></div>}
            <div dangerouslySetInnerHTML={{ __html: arrayFromString[arrayposition] }} />
        </div>
        </div>
        </>
    )
}

export default PromptForm