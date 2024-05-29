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
    let HTMLstuff = ``

    useEffect( () => {
        let processing = true
        axiosFetchData(processing)
        return () => {
            processing = false
        }
    },[])

    const axiosFetchData = async(processing) => {
        await axios.get('http://localhost:4000/users')
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

        await axios.post("http://localhost:4000/formPost", postData)
        .then(res => setMessageError(res.data))
        //console.log(messageError); // Log the HTML content
    }
    
    const handleSubmit = (e) => {
        e.preventDefault()

        console.log(email + ' | ' + selectValue + ' | ' + message)
        
        if (!message) {
                setMessageError("Destination is empty. Please enter a Destination.")
            } else 
            {
                setMessageError("")
            }
            setMessageError("")
            axiosPostData()     
    }
    const locations = ['EA-02-08', 'EA-02-09', 'EA-02-10', 'EA-02-11', 'EA-02-14', 'EA-02-16', 'EA-02-17', 'EA-02-18'];
    const myHTML = `<img src = "/Pictures/East/East/3_3_0_1_East_East_Cross_junction_NIL.png" alt = "cannot be displayed" width = "100" height = "100"></img><br></br>`; //For debugging

    return (
        <>
<div style={{display: "flex", flexDirection: "row" }} >
    <div class="child1"><center>
        <form>
            <label className="StartAndEndLocation">Start Location</label>
            <Typography  className="description">Search or select the location closest to you</Typography>
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
            <Typography className="description">Search or select the location closest to your end point</Typography>
            
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

        </form>
        </center> </div>
        <div class="child2">
            <center><div dangerouslySetInnerHTML={{ __html: messageError }} /></center>
        </div>
        </div>
        </>
    )
}

export default PromptForm