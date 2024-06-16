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
    const [showBlockedPathQs, setShowBlockedPathQs] = useState(false)

    const [bugDetails, setBugDetails] = useState('')
    const [blockedNode, setBlockedNode] = useState('')
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
            blockedNode: blockedNode,
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
        if (showBlockedPathQs && !blockedNode) {
            setFeedbackMessage("Please select a blocked location")
            return;
        }
        if (showBlockedPathQs && !sourceLocation) {
            setFeedbackMessage("Please select a start location")
            return;
        }
        if (showBlockedPathQs && !destinationLocation) {
            setFeedbackMessage("Please select an end location")
            return;
        }
        setFeedbackMessage('')
        console.log('feedback type:' + feedbackType + ' | bug details:' + bugDetails + ' | Blocked Node:' + blockedNode)
        console.log("Path:", sourceLocation + '|' + destinationLocation)
        console.log("Nodes:", nodes)

        axiosPostDataFeedback();
        if (sourceLocation && destinationLocation) {
        axiosPostDataPathFind();
        setFormSubmitted(true);
        }
    }

    const typeOfFeedback = ["Report bug with website", "Suggest a better path", "Report blocked location"]

    const handleFeedbackType = (event, value) => {
    // To determine what type of questions to show
    if (value) {
        setFeedbackType(value);
    } else {
        setFeedbackType(''); // Handle case when value is cleared
    }
    if (value === "Report bug with website"){
            
            setBlockedNode("")
            setSourceLocation("")
            setDestinationLocation("")
            setFormSubmitted(false)
        }
        if (value === "Suggest a better path"){
            
            setBugDetails("")
            setBlockedNode("")
            setSourceLocation("")
            setDestinationLocation("")
            setFormSubmitted(false)
        }
        if (value === "Report blocked location"){
            
            setBugDetails("")
            setBlockedNode("")
            setSourceLocation("")
            setDestinationLocation("")
            setFormSubmitted(false)
        }
        setShowBlockedPathQs(value === "Report blocked location")
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
            <p className="InstructionsContent">3) Report any blocked locations so that the website can provide you with an alternate path</p>
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
      <Button variant="contained" sx ={{ bgcolor: "#D95328" , "&:hover": { bgcolor: "#F05C2C"}}} onClick={addnode}>
        Add Node
      </Button>
      {nodes.length > 1 && (
        <Button variant="contained" sx ={{ bgcolor: "#D95328" , "&:hover": { bgcolor: "#F05C2C"}, margin: "10px" }} onClick={() => removenode(nodes.length - 1)}>
          Remove Previous Node
        </Button>
      )}
      </div>}

            {showBlockedPathQs && <div>
                <Typography sx={{marginBottom: "10px", fontFamily: "Lexend"}}>Which location is blocked?</Typography>
                <Autocomplete
                options={selectLocations} sx={{ width: 250 }} renderInput={(params) => (
                <TextField {...params} label="Location"></TextField>
                )}
                 onChange={(event, value) => {
                    if (value) {
                      setBlockedNode(value);
                    }else {
                        setBlockedNode(''); // Handle case when value is cleared
                    }
                }
                
                }
            >
            </Autocomplete>
            <br></br>
            <label className="blockedNodeLocation">Where did you originally want to get to and from?</label>
            <br></br>
            <br></br>

            <label className="StartAndEndLocation">Start Location</label>
            
            <Autocomplete
            options={selectLocations} sx={{ width: 250 }} renderInput={(params) => (
                <TextField {...params} label="Start Location"></TextField>
            )}
            onChange={(event, value) => {
                if (value) {
                    setSourceLocation(value);
                } else {
                    setSourceLocation(''); // Handle case when value is cleared
                }
            }
        }
            >
            </Autocomplete>
            <br></br>
            <label className="StartAndEndLocation">End Location</label>
            
            <Autocomplete
            options={selectLocations} sx={{ width: 250 }} renderInput={(params) => (
                <TextField {...params} label="End Location"></TextField>
            )}
            onChange={(event, value) => {
                if (value) {
                    setDestinationLocation(value);
                } else {
                    setDestinationLocation(''); // Handle case when value is cleared
                }
            }
        }
            >
            </Autocomplete>
            </div>}
            <br></br>
            <div className="feedbackUserInfo">{feedbackMessage}</div>
            <br></br>
            <Button variant="contained" type="submit" onClick={handleSubmit} sx ={{ bgcolor: "#cdd8e6", "&:hover": { bgcolor: "#F05C2C"}, }}>Submit</Button>
            <br></br>
            <br></br>
            {feedbackSubmission}
    </center>
        </form>
        
            <div className="child2mobile">
                {!formSubmitted && showBlockedPathQs
                && <div><Box 
                component="section"  
                display="flex"
                alignItems="center"
                 sx={{ p: 2, border: '1px grey', bgcolor: '#F5F5F5', height: "68vh", marginRight:"0px" , 
                 textAlign: 'center', justifyContent: 'center', color: 'grey'}}>Please select the starting and ending <br></br> locations to view the pictures</Box>
            </div>}
            
            <center>
            {formSubmitted && <p className= "parametricsDescription">Distance: </p>}
            {formSubmitted && <p className= "parametricsContent">{distance}m</p>}
            <div></div>
            
            {formSubmitted && <p className= "parametricsDescription">Time Taken: </p>}
            {formSubmitted && <p className= "parametricsContent">{Math.round((distance/1.4)/60)} minutes</p>}
            {formSubmitted && <p className="imageCountMobile">{arrayposition+1}/{arrayFromString.length-1}</p>}
             { formSubmitted && <div className="containerMobile">
             <Button variant="contained" type="submit" onClick={decrementCounter} 
             sx ={{ bgcolor: "#D95328" , "&:hover": { bgcolor: "#F05C2C"}, minWidth: 'unset', 
             textAlign: 'center !important', px: '0px', py: '0px', height: "15vh", width: "10vw"}}><ArrowLeftIcon></ArrowLeftIcon></Button>
             <div className="htmlContent" dangerouslySetInnerHTML={{ __html: arrayFromString[arrayposition] }} />
          <Button variant="contained" type="submit" onClick={incrementCounter} 
          sx ={{ bgcolor: "#D95328" , "&:hover": { bgcolor: "#F05C2C"}, minWidth: 'unset', 
          textAlign: 'center !important', px: '0px', py: '0px', height: "15vh", width: "10vw"}}><ArrowRightIcon></ArrowRightIcon></Button>

        </div>}
        </center>
        </div>
        
        </>
    )
}

export default Feedback