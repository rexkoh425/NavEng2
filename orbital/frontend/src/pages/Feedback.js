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




function Feedback() {
    const [feedbackType, setFeedbackType] = useState('')

    const [showBugQs, setShowBugQs] = useState(false)
    const [showSuggestPathQs, setShowSuggestPathQs] = useState(false)

    const [bugDetails, setBugDetails] = useState('')
    const [nodes, setnodes] = useState([""]); // State to store autocomplete nodes

    const handlenodeChange = (index, value) => {
        const newnodes = [...nodes];
        newnodes[index] = value;
        setnodes(newnodes);
      };
      
    const addnode = () => {
       setnodes([...nodes, '']);
    };
    
    const removenode = (index) => {
        const newnodes = [...nodes];
        newnodes.splice(index, 1);
        setnodes(newnodes);
      };

    const [feedbackSubmission, setFeedbackSubmission] = useState('')
    const [feedbackMessage, setFeedbackMessage] = useState('')

    const [sourceLocation, setSourceLocation] = useState('')
    const [destinationLocation, setDestinationLocation] = useState('')
    const [messageError, setMessageError] = useState(``) //using messageError variable for html content as well
    const [selectData, setSelectData] = useState([])
    const [selectValue, setSelectValue] = useState('')
    const [selectLocations, setSelectLocations] = useState([])
    const [distance, setDistance] = useState(``)
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

    const axiosPostDataFeedback = async() => {
        const postData = {
            feedbackType: feedbackType,
            bugDetails: bugDetails,
            sourceLocation: sourceLocation,
            destinationLocation: destinationLocation,
            nodes: nodes,
        }

        //await axios.post("https://naveng-backend-vercel.vercel.app/formPost", postData)
        await axios.post("http://localhost:4000/feedback", postData)
        .then(res => {
            setFeedbackSubmission(res.data)
        })
        .catch(err => console.log("Fetch Location Error!!"))
    }

    const axiosPostDataPathFind = async() => {
        const postData = {
            source: sourceLocation,
            destination: destinationLocation,
        }

        //await axios.post("https://naveng-backend-vercel.vercel.app/formPost", postData)
        await axios.post("http://localhost:4000/formPost", postData)
        .then(res => {
            setMessageError(res.data['HTML']);
            setDistance(res.data['Distance']/10);
        })

        arrayFromString = messageError.split('<img src');
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setFeedbackSubmission("")

        if (!feedbackType) {
            setFeedbackMessage("Please select an issue type");
            return;
        }
        if (showBugQs && !bugDetails) {
            setFeedbackMessage("Please provide some details about the bug")
            return;
        }
        setFeedbackMessage('')
        console.log('feedback type:' + feedbackType + ' | bug details:' + bugDetails)
        console.log("Path:", sourceLocation + '|' + destinationLocation)
        console.log("Nodes:", nodes)

        axiosPostDataFeedback();
        if (sourceLocation && destinationLocation) {
        axiosPostDataPathFind();
        setFormSubmitted(true);
        }
    }

    const typeOfFeedback = ["Report bug with website", "Suggest a better path"]

    const handleFeedbackType = (event, value) => {
    // To determine what type of questions to show
    if (value) {
        setFeedbackType(value);
    } else {
        setFeedbackType(''); // Handle case when value is cleared
    }
    if (value === "Report bug with website"){
            
            setSourceLocation("")
            setDestinationLocation("")
            setFormSubmitted(false)
        }
        if (value === "Suggest a better path"){
            
            setBugDetails("")
            setSourceLocation("")
            setDestinationLocation("")
            setFormSubmitted(false)
        }
        if (value === "Report blocked location"){
            
            setBugDetails("")
            setSourceLocation("")
            setDestinationLocation("")
            setFormSubmitted(false)
        }
        setShowSuggestPathQs(value === "Suggest a better path")
        setShowBugQs(value === "Report bug with website");
    }

    const handleBugDetails = (event) => {
        // To determine what type of questions to show
        const value = event.target.value;
        if (value) {
            setBugDetails(value);
        } else {
            setBugDetails(''); // Handle case when value is cleared
        }
        }

    return (
        <>
        
        <form className="feedbackForm">
        <center>
        <Box component="section" sx={{ p: 2, border: '1px grey', bgcolor: '#F5F5F5'}}>
            <h1 className="InstructionsTitle">Feedback</h1>
            <p className="InstructionsContent">We appreciate your comments and any feedback you might have for us</p>
            <p className="InstructionsContent">Please fill out the form below to submit any feedback regarding the pathfinding. You can fill out the form to:</p>
            <p className="InstructionsContent">1) Report any bugs with the website</p>
            <p className="InstructionsContent">2) Suggest a path which you think is better than the path shown by the website</p>
        </Box>
            <Typography sx={{marginBottom: "10px", fontFamily: "Lexend"}}>What is your issue?</Typography>
            <Autocomplete
            options={typeOfFeedback} sx={{ width: 350 }} renderInput={(params) => (
                <TextField {...params} label="Issue"></TextField>
            )}
            onChange={handleFeedbackType}>
            </Autocomplete>
            <br></br>

            {showBugQs && <div>
                <Typography sx={{marginBottom: "10px", fontFamily: "Lexend"}}>Please give us the details of the bug</Typography>
                <TextField sx={{ width: 350 }}  onChange={handleBugDetails}></TextField>
            </div>}

            {showSuggestPathQs && <div>
                <Typography sx={{marginBottom: "10px", fontFamily: "Lexend"}}>Please provide us with the step by step nodes along your path</Typography>
                {nodes.map((node, index) => (
                    <Autocomplete
                    key={index}
                    options={selectLocations}
                    sx={{ width: 350 }}
                    value={node}
                    onChange={(e, newValue) => handlenodeChange(index, newValue)}
                    renderInput={(params) => <TextField {...params} label={`Node ${index + 1}`} variant="outlined" />}
                    />
        
      ))}
      <br></br>
      <br></br>
      <Button variant="contained" sx ={{ bgcolor: "#D95328" , "&:hover": { bgcolor: "#F05C2C"} , fontFamily: "Lexend" }} onClick={addnode}>
        Add Node
      </Button>
      {nodes.length > 1 && (
        <Button variant="contained" sx ={{ bgcolor: "#D95328" , "&:hover": { bgcolor: "#F05C2C"}, margin: "10px" , fontFamily: "Lexend" }} onClick={() => removenode(nodes.length - 1)}>
          Remove Previous Node
        </Button>
      )}
      </div>}
            <br></br>
            <div className="feedbackUserInfo">{feedbackMessage}</div>
            <br></br>
            <Button variant="contained" type="submit" onClick={handleSubmit} sx={{ bgcolor: "#cdd8e6", "&:hover": { bgcolor: "#F05C2C" }, fontFamily: "Lexend" }}>Submit</Button>
            <br></br>
            <br></br>
            {feedbackSubmission}
    </center>
        </form>
        
        </>
    )
}

export default Feedback