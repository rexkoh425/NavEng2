import { useState, useEffect} from "react"
import axios from "axios"
import logo from '../logo.svg'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Typography } from "@mui/material";
import Container from "@mui/material";

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

    /*const fetchData = async(processing) => {
        await fetch('http://jsonplaceholder.typicode.com/users')
        .then(res => res.json())
        .then(data => {
            if (processing) {
            setSelectData(data)
        }
    })
        .catch(err => console.log("Fetch Error!!"))
    } */

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
        //.then(res => setMessageError(<p className="success">{res.data}</p>))
        .then(res => setMessageError(res.data))
        //console.log(messageError); // Log the HTML content
    }

    /*const SelectDropdown = () => {
        return (
            <select value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
                {
                    selectData?.map( (item) => (
                        <option value={item.website} key={item.website}>{item.website}</option>
                    ))
                }
            </select>
        )
    } */
    
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

    const myHTML = `<img src = "/Pictures/East/East/3_3_0_1_East_East_Cross_junction_NIL.png" alt = "cannot be displayed" width = "100" height = "100"></img><br></br>`;

    return (
        <>
<div style={{display: "flex", flexDirection: "row" }} >
    <div class="child1"><center>
        <form>
            <label className="StartAndEndLocation">Start Location</label>
            <Typography  className="description">Search or select the location closest to you</Typography>
            <TextField id="outlined-basic" label="Enter Start Location (EA-04-04)" variant="outlined" type="text"  name="email" value={email} onChange={ (e) => setEmail(e.target.value) }/>
            <br></br>
            <br></br>
            <label className="StartAndEndLocation">End Location</label>
            <Typography className="description">Search or select the location closest to your end point</Typography>
            <TextField id="outlined-basic" label="Enter End Location (EA-04-04)" variant="outlined" type="text"  name="destination" value={message} onChange={ (e) => setMessage(e.target.value) }/>
            <br></br>
            <br></br>
            <Button variant="contained" type="submit" onClick={handleSubmit} sx ={{ bgcolor: "#cdd8e6", "&:hover": { bgcolor: "#F05C2C"}, }}>Submit</Button>
            <br></br>
            <br></br>
            

        </form>
        </center> </div>
        <div class="child2">
            <center><div dangerouslySetInnerHTML={{ __html: messageError }} /></center>
            <img src="https://bdnczrzgqfqqcoxefvqa.supabase.co/storage/v1/object/sign/Pictures/10_50_-210_2_None_None_Room_EA-02-14.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJQaWN0dXJlcy8xMF81MF8tMjEwXzJfTm9uZV9Ob25lX1Jvb21fRUEtMDItMTQuanBnIiwiaWF0IjoxNzE2ODY5MjE5LCJleHAiOjQ4NzA0NjkyMTl9.eDqskJpWzzfTdodHHb6hXYMD2-6w15wTpVqBdvwK55A&t=2024-05-28T04%3A06%3A59.449Z"></img>
        </div>
        </div>
        </>
    )
}

export default PromptForm