import { useState, useEffect } from "react"
import axios from "axios"
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import Autocomplete from '@mui/material/Autocomplete';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import "@fontsource/lexend"; // Defaults to weight 400
import "@fontsource/lexend/500.css";
import "@fontsource/lexend/400.css";
import "@fontsource/lexend/300.css";
import Tooltip from '@mui/material/Tooltip';
import FileUpload from "./FileUpload";
import CalculateTime from './CalculateTime';
import ConvertToMetres from './ConvertToMetres';
import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Instructions from "./Instructions";
import DestinationNotification from "./DestinationNotification";
import { useSwipeable } from 'react-swipeable';
import TopDownMapMobile from "./TopDownMapMobile";
import ImageOutputMobile from "./ImageOutputMobile";
import CircularProgress from "@mui/material/CircularProgress";
import circularProgressClasses from '@mui/material/CircularProgress';
import SwipeIcon from '@mui/icons-material/Swipe';
import Swipe from "@mui/icons-material/Swipe";


function PromptFormMobile() {

    const [sourceLocation, setSourceLocation] = useState('')
    const [destinationLocation, setDestinationLocation] = useState('')
    const [disableSubmit, setDisableSubmit] = useState(true) //Boolean to disable and enable Submit Button
    const [autocompleteFields, setAutocompleteFields] = useState([]); //Multistop fields
    const [MultiStopArrayDuplicate, setMultiStopArrayDuplicate] = useState([]); //Duplicate Array to store temporary Multistop Array
    const [MultiStopArray, setMultiStopArray] = useState([]);
    const [MultiStopArrayNotification, setMultiStopArrayNotification] = useState([]);
    const [messageError, setMessageError] = useState(``) //using messageError variable for html content as well
    const [selectLocations, setSelectLocations] = useState([])
    const [totalDistance, setTotalDistance] = useState(``)
    const [distanceArray, setDistanceArray] = useState([])
    const [debug, SetDebug] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [arrayposition, setCount] = useState(0);//Current image which the user is viewing
    const [blockedMessage, setBlockedMessage] = useState(''); //Message to display whenever user blocks a node
    const [blocked, setBlocked] = useState('');
    const [blockedIMGName, setBlockedIMGName] = useState('');
    const [blockedNodeID, setBlockedNodeID] = useState(); //Also being used as the current node
    const [disableRightButton, setDisableRightButton] = useState(false);
    const [disableLeftButton, setDisableLeftButton] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    let arrayFromString = messageError.split(' '); //To split HTML code into array
    const [sheltered, setSheltered] = useState(false);
    const [NoStairs, setNoStairs] = useState(false);
    const [beforeBlocked, setBeforeBlocked] = useState('');
    const [blockedNodeIndex, setBlockedNodeIndex] = useState("");
    //const [blockedNodeIndexArray, setBlockedNodeIndexArray] = useState("")
    const [blockedArray, setBlockedArray] = useState([]); //Array of all of the nodes which were blocked by the users (In image name format: X_X_X_X_Direction_Direction_Type.jpg)
    const [stopsIndex, setStopsIndex] = useState([]);
    const [nodesPath, setNodesPath] = useState([]);
    const [noPath, setNoPath] = useState("");
    const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);
    const [hideTimeTaken, setHideTimeTaken] = useState(false)
    const [pathInstructions, setPathInstructions] = useState([])
    const [Node_id_array, setNode_id_array] = useState([]);
    const [blockedIndicator, setBlockedIndicator] = useState(false)
    const [submitTrigger, setSubmitTrigger] = useState(false)
    const [visited, setVisited] = useState(["0"])
    const [temp, setTemp] = useState([])
    const [graphnodes, setGraphnodes] = useState([])
    const [loading, setLoading] = useState(false)


    const Local = process.env.REACT_APP_LOCAL;
    let websitelink = ""
    if (Local == "true") {
        websitelink = "http://localhost:4000"
    } else {
        websitelink = "https://naveng-backend-vercel.vercel.app"
    }

    function hasSameEntries(array) {
        let set = new Set();

        for (let element of array) {
            if (set.has(element)) {
                return true;
            }
            set.add(element);
        }

        return false;
    }

    function preloadNextImage() {
        const nextImageIndex = (arrayposition + 2) % arrayFromString.length;
        const imgContainer = document.createElement('div');
        imgContainer.innerHTML = arrayFromString[nextImageIndex];
        const img = imgContainer.firstChild;
    }

    useEffect(() => {
        const nextImageIndex = (arrayposition + 1) % arrayFromString.length;
        const imgContainer = document.createElement('div');
        imgContainer.innerHTML = arrayFromString[nextImageIndex];
        // Optionally handle onload and onerror events here
    }, [arrayposition, arrayFromString]);

    const handleSwipe = (direction) => {
        if (direction === 'left') {
            incrementCounter()
        } else if (direction === 'right') {
            decrementCounter()
        }
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => handleSwipe('left'),
        onSwipedRight: () => handleSwipe('right'),
        preventScrollOnSwipe: true
    });

    useEffect(() => {
        // Update clumpedArray whenever front, center, or end change
        const newClumpedArray = [sourceLocation, ...MultiStopArrayDuplicate, destinationLocation];
        setMultiStopArray(newClumpedArray);
        disableSubmitButton(newClumpedArray)
    }, [sourceLocation, MultiStopArrayDuplicate, destinationLocation]);

    useEffect(() => {
        const image = arrayFromString[arrayposition]

        const URL = 'https://bdnczrzgqfqqcoxefvqa.supabase.co/storage/v1/object/public/Pictures/Specials/No_alternate_path.png?t=2024-06-22T15%3A22%3A29.729Z'

        if (image === URL) {
            setNoPath(true);
        } else {
            setNoPath(false); // Ensure it's false if condition is not met
        }
    }, [arrayFromString, arrayposition]);

    useEffect(() => {
        if (nodesPath && blockedNodeID) {
            updateMap()
        }
    }, [nodesPath, blockedNodeID])

    const disableSubmitButton = (MultiStopArray) => {
        const noEmptyStrings = MultiStopArray.every(item => item !== "");
        const hasNullValues = MultiStopArray.some(item => item === null);
        if (noEmptyStrings && !hasNullValues) {
            setDisableSubmit(false)
        } else {
            setDisableSubmit(true)
        }

    }

    const blockConfirmation = () => {
        setShowBlockConfirmation(true)
        return;
    }

    const addAutocomplete = () => {
        setAutocompleteFields([...autocompleteFields, {}]);
        setMultiStopArrayDuplicate([...MultiStopArrayDuplicate, null]);
    };

    const removeAutocomplete = (index) => {
        const updatedAutocompletes = [...autocompleteFields];
        updatedAutocompletes.splice(index, 1);
        setAutocompleteFields(updatedAutocompletes);

        const updatedMultiStopArray = [...MultiStopArrayDuplicate];
        updatedMultiStopArray.splice(index, 1);
        setMultiStopArrayDuplicate(updatedMultiStopArray);
    };

    const handleAutocompleteChange = (index, value) => {
        const updatedValues = [...MultiStopArrayDuplicate];
        updatedValues[index] = value;
        setMultiStopArrayDuplicate(updatedValues);
    };

    useEffect(() => {
        if (blocked && typeof blocked === 'string') {
            const parts = blocked.split('/');
            const remainder = parts.slice(8).join('/');
            const indexOfQuote = remainder.indexOf('"');
            const BlockedIMGNameVariable = remainder.slice(0, indexOfQuote)
            setBlockedIMGName(remainder.slice(0, indexOfQuote));

            const node_string = BlockedIMGNameVariable.split("_")[0];
            const before_node_id = parseInt(node_string);
            setBlockedNodeID(before_node_id)
        }
    }, [blocked]);

    let beforeparts = beforeBlocked.split('/');
    let beforeremainder = beforeparts.slice(8).join('/');
    let beforeindexOfQuote = beforeremainder.indexOf('"');
    let beforebeforeQuote = beforeremainder.slice(0, beforeindexOfQuote);
    const node_string = beforebeforeQuote.split("_")[0];
    const before_node_id = parseInt(node_string);

    const updateMap = () => {
        axiosGetFloor()
    }

    const incrementCounter = (e) => { //counter for image array
        preloadNextImage()
        if (arrayposition !== (arrayFromString.length - 1)) { //Using -2 due to nature of splitting string
            setCount(arrayposition + 1);
            setBlocked(arrayFromString[arrayposition + 1])
            setBeforeBlocked(arrayFromString[arrayposition])
            setBlockedNodeIndex(arrayposition + 1)

            const newVisited = nodesPath.slice(0, arrayposition + 2)
            setVisited(newVisited)
        }
        if (arrayposition === (arrayFromString.length - 2)) {
            setDisableRightButton(true)
            setHideTimeTaken(true)
        }
        setDisableLeftButton(false)
        setShowBlockConfirmation(false)
    };

    const decrementCounter = (e) => {
        if (arrayposition !== (0)) {
            setCount(arrayposition - 1);
            setBlocked(arrayFromString[arrayposition - 1])
            setBlockedNodeIndex(arrayposition - 1)
            const newVisited = nodesPath.slice(0, arrayposition)
            setVisited(newVisited)
            if (arrayposition !== (1)) {
                setBeforeBlocked(arrayFromString[arrayposition - 2])
            }
        }
        if (arrayposition === 1) {
            setDisableLeftButton(true)
        }
        setDisableRightButton(false)
        setHideTimeTaken(false)
        setShowBlockConfirmation(false)
    };

    useEffect(() => {
        let processing = true
        axiosFetchData(processing)
        axiosFetchLocations(processing)
        SetDebug(true);
        return () => {
            processing = false
        }
    }, [])

    useEffect(() => {
        // Update clumpedArray whenever front, center, or end change
        const newClumpedArray = [sourceLocation, ...MultiStopArrayDuplicate, destinationLocation];
        setMultiStopArray(newClumpedArray);
    }, [sourceLocation, MultiStopArrayDuplicate, destinationLocation]);

    const axiosFetchData = async (processing) => {
        await axios.get(websitelink + '/test')

            .then(res => {
                if (processing) {
                }
            })
            .catch(err => console.log("Fetch Error!!"))
    }

    const axiosFetchLocations = async (processing) => {
        await axios.post(websitelink + '/locations')
            .then(res => {
                setSelectLocations(res.data)
            })
            .catch(err => console.log("Fetch Location Error!!"))
    }

    const axiosPostData = async () => { //Sending main form data
        setLoading(true)

        const postData = {
            blocked_array: blockedArray,
            sheltered: sheltered,
            NoStairs: NoStairs,
            MultiStopArray: MultiStopArray
        };

        try {
            const response = await axios.post(websitelink + '/formPost', postData);
            setLoading(false)

            // Update state variables with the response data
            setMessageError(response.data['HTML']);
            setTotalDistance(response.data['Distance'] / 10);
            const distArray = response.data['Dist_array'];
            setPathInstructions(response.data['Instructions'])

            setNodesPath(response.data['compressed_nodes_path'])
            setStopsIndex(response.data['Stops_index']);
            handleConvertToMetres(distArray);
            setNode_id_array(response.data['nodes_path']);
            setBlockedIndicator(false)
            setVisited(["0"])

            // Perform split operation inside the then block
            const arrayFromString = response.data['HTML'].split('<img src');
            setBlocked(arrayFromString[0]);
            setStopsIndex(response.data['Stops_index']);
            
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const axiosPostDataRefresh = async () => { //Sending data when alternate path button is clicked
        setLoading(true)

        const postData = {
            blocked_array: blockedArray,
            Node_id_array: Node_id_array,
            blocked_img_path: blockedIMGName,
            sheltered: sheltered,
            NoStairs: NoStairs,
            MultiStopArray: MultiStopArray,
            Stops_index: stopsIndex,
            BlockedNodeIndex: blockedNodeIndex
        };

        try {
            const response = await axios.post(websitelink + '/blockRefresh', postData);
            setLoading(false)
            // Update state variables with the response data
            setMessageError(response.data['HTML']);
            setTotalDistance(response.data['Distance'] / 10);
            const distArray = response.data['Dist_array'];
            handleConvertToMetres(distArray);
            setNode_id_array(response.data['nodes_path']);
            setStopsIndex(response.data['Stops_index']);
            setMultiStopArray(response.data['Destinations']);
            setMultiStopArrayNotification(response.data['Destinations'])
            const arrayFromString = response.data['HTML'].split('<img src');
            setBlocked(arrayFromString[0]);

            setNodesPath(response.data['compressed_nodes_path'])
            setPathInstructions(response.data['Instructions'])
            setBlockedIndicator(true)
            setSubmitTrigger(!submitTrigger)
            

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const axiosGetFloor = async () => {
        try {
            let postData = {
                node_id: blockedNodeID
            };

            const response = await axios.post(websitelink + '/getfloor', postData);
            setGraphnodes(response.data)


        } catch (error) {
            console.error('Error getting floor:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault()

        if (hasSameEntries(MultiStopArray)) {
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
        setHideTimeTaken(false)
        setDisableLeftButton(true);
        setShowBlockConfirmation(false)
        setMultiStopArrayNotification(MultiStopArray)
        setSubmitTrigger(!submitTrigger)
    }

    const handleSubmitRefresh = (e) => {
        e.preventDefault()

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
        setHideTimeTaken(false)
        setDisableLeftButton(true);
        setShowUpload(false);
    }

    const axiosPostBlock = async (e) => { //Sending data when block button is clicked
        try {
            let postData = {
                img_string: blockedIMGName
            };

            // Send POST request to insertBlocked endpoint
            const response = await axios.post(websitelink + '/insertBlocked', postData);

            // Update state variables after successful response
            setShowUpload(true);
            const blockdata = response.data;
            setBlockedMessage(blockdata['message']);
            const new_blocked = blockdata['node'];
            const newBlockedArray = [...blockedArray, new_blocked];
            setBlockedArray(newBlockedArray)
            setShowBlockConfirmation(false)
            //const newBlockedNodeIndex = blockedNodeIndex
            //const newBlockedIndexArray = [...blockedNodeIndexArray, newBlockedNodeIndex];
            //setBlockedNodeIndexArray(newBlockedIndexArray)

        } catch (error) {
            console.error('Error posting block:', error);
        }
    };

    const handleConvertToMetres = (distArray) => {
        const dividedDistance = ConvertToMetres({ distanceArrayx10: distArray });
        setDistanceArray(dividedDistance);
    }

    const handleShelteredCheckbox = (event) => {
        setSheltered(event.target.checked);
    };

    const handleStairsCheckbox = (event) => {
        setNoStairs(event.target.checked);
    };

    return (
        <>
            <form className="mobileForm">
                <center>
                    <label className="StartAndEndLocation">Start Location</label>
                    <Typography className="description" sx={{ marginBottom: "10px", fontFamily: "Lexend" }}>Search or select the location closest to you</Typography>
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
                    <Typography className="description" sx={{ marginBottom: "10px", fontFamily: "Lexend" }}>Search or select the location closest to your end point</Typography>

                    <div >

                        {autocompleteFields.map((_, index) => (

                            <div className="Autocomplete-container" key={index}>
                                <div className="centered-element">
                                    <Autocomplete
                                        options={selectLocations} // Replace with your options array
                                        value={MultiStopArrayDuplicate[index] || null}
                                        sx={{ width: 250, fontFamily: 'Georgia, serif' }}
                                        onChange={(event, value) => handleAutocompleteChange(index, value)}
                                        renderInput={(params) => (
                                            <TextField {...params} label={"Enter a destination"} variant="outlined" fullWidth />
                                        )}
                                    />
                                </div>
                                <div className="right-element">
                                    <Button color="secondary" sx={{ color: "#F05C2C" }} onClick={() => removeAutocomplete(index)}>
                                        <RemoveCircleOutlineIcon />
                                    </Button>
                                </div>
                            </div>

                        ))}

                    </div>

                    <div>

                        <div className="Autocomplete-container">
                            <div className="centered-element">
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
                            </div>
                            <div className="right-element">
                                <Button color="primary" onClick={addAutocomplete}>
                                    <AddCircleOutlineIcon />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <br></br>
                    <FormControlLabel control={<Checkbox sx={{
                        color: "#cdd8e6",
                        '&.Mui-checked': {
                            color: "#F05C2C",
                        },
                    }} checked={NoStairs}
                        onChange={handleStairsCheckbox} />} label="No Stairs" sx={{ fontFamily: "Lexend" }} />
                    <FormControlLabel control={<Checkbox defaultChecked sx={{
                        color: "#cdd8e6",
                        '&.Mui-checked': {
                            color: "#F05C2C",
                        },
                    }} checked={sheltered}
                        onChange={handleShelteredCheckbox} />} label="Sheltered Path" sx={{ fontFamily: "Lexend" }} />
                    <br></br>
                    <Button variant="contained" type="submit"  disabled={disableSubmit} onClick={handleSubmit} sx={{ bgcolor: "#F05C2C", "&:hover": { bgcolor: "#F05C2C" }, fontFamily: "Lexend" }}>Submit</Button>
                    <br></br>
                    <br></br>
                    <Instructions formSubmitted={formSubmitted}></Instructions>
                </center>
            </form>
            <br></br>


            <div className="child2mobile">
                {!formSubmitted
                    && <div><Box
                        component="section"
                        display="flex"
                        alignItems="center"
                        sx={{
                            p: 2, border: '1px grey', bgcolor: '#F5F5F5', height: "68vh", marginRight: "0px",
                            textAlign: 'center', justifyContent: 'center', color: 'grey'
                        }}>Please select the starting and ending <br></br> locations to view the pictures</Box></div>}

                <center>
                    {stopsIndex && !noPath && formSubmitted && <TopDownMapMobile nodes={graphnodes} visited={visited} originNodeId={blockedNodeID} nodesPath={nodesPath} stopsIndex={stopsIndex} Node_id_array={Node_id_array} blockedIMGName={blockedIMGName}></TopDownMapMobile>}
                    <div className="two-columns-container">
                        <div className="column">
                            {!noPath && formSubmitted && !hideTimeTaken && <img src="Distance_Icon.png" className="distanceIcon"></img>}
                            {!noPath && formSubmitted && !hideTimeTaken && <p className="parametricsContent">{distanceArray[arrayposition]}m</p>}
                        </div>
                        <div className="column">

                            <div></div>
                            {!noPath && formSubmitted && !hideTimeTaken && <img src="Time_Icon.png" className="timeIcon"></img>}
                            {!noPath && formSubmitted && !hideTimeTaken && <div className="parametricsContent"><CalculateTime distance={distanceArray[arrayposition]} /></div>}


                        </div>

                    </div>
                    <br></br>
                    <div className="spacing"></div>
                    {!noPath && formSubmitted && <DestinationNotification stopsIndex={stopsIndex} arrayposition={arrayposition} MultiStopArray={MultiStopArrayNotification} pathInstructions={pathInstructions} blockedIndicator={blockedIndicator} />}
                    <center>
                        {formSubmitted && <div className="containerMobile2">
                            <div className="leftArrow">
                                {!noPath && <Button variant="contained" type="submit" onClick={decrementCounter} disabled={disableLeftButton} sx={{ bgcolor: "#D95328", "&:hover": { bgcolor: "#F05C2C" }, minWidth: 'unset', textAlign: 'center !important', px: '0px', py: '0px', height: "55vh", width: "8vw", marginBottom: "8vh", marginRight: "1vw"}}><ArrowLeftIcon></ArrowLeftIcon></Button>}
                            </div>

                            <div className="MiddleContent">
                            {formSubmitted && loading && <React.Fragment>
                                        <svg width={0} height={0}>
                                            <defs>
                                                <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#F05C2C" />
                                                    <stop offset="100%" stopColor="#cdd8e6" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <CircularProgress sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} />
                                    </React.Fragment>}

                                <div {...handlers} className="NoMargins" style={{ overflow: 'hidden' }}>

                                <div style={{ display: 'none' }}>
                                {/* Preload the next image */}
                                <ImageOutputMobile imgPath={arrayFromString[(arrayposition + 1) % arrayFromString.length]} />
                            </div>

                                {!loading && <ImageOutputMobile imgPath={arrayFromString[arrayposition]} arrayposition={arrayposition} />}

                                </div>
                                <Tooltip title="Block?" arrow>
                                    {!loading && !noPath && !showBlockConfirmation && <Button className="overlay-button-mobile" onClick={blockConfirmation}><img src="block_logo.png" alt="cannot display" className="block-logo-mobile"></img></Button>}
                                </Tooltip>

                                    {!noPath && showBlockConfirmation && <Button variant="contained" className="overlay-confirmation-button-mobile" sx={{ bgcolor: "#D95328", "&:hover": { bgcolor: "#F05C2C" }, fontFamily: "Lexend" }} onClick={axiosPostBlock}>Block this point?</Button>}

                                    {showUpload && <div className="overlay-refresh-mobile">
                                    <Button variant="contained" type="submit" onClick={handleSubmitRefresh} sx={{ bgcolor: "#D95328", "&:hover": { bgcolor: "#F05C2C" }, fontFamily: "Lexend" }}>Give me an alternate path</Button>
                                    </div>}
                                    {!loading && !noPath && <Box className="overlay-image-count-mobile" component="section" display="flex" alignItems="center" borderRadius={16} sx={{ p: 0, background: "white", textAlign: 'center', justifyContent: 'center' }}><p className="imageCount">{arrayposition + 1}/{arrayFromString.length}</p></Box>}
                            </div>
                            

                            <div className="rightArrow">
                                {!noPath && <Button variant="contained" type="submit" onClick={incrementCounter} disabled={disableRightButton} sx={{ bgcolor: "#D95328", "&:hover": { bgcolor: "#F05C2C" }, minWidth: 'unset', textAlign: 'center !important', px: '0px', py: '0px', height: "55vh", width: "8vw", marginBottom: "8vh", marginLeft: "1vw" }}><ArrowRightIcon></ArrowRightIcon></Button>}
                            </div>
                        </div>}
                        {!noPath && formSubmitted && <SwipeIcon  style={{
        animation: 'shiftIcon 3s infinite'
      }} sx={{marginTop: '-3vh', color: "#F05C2C"}}/>}
                    </center>
                    {showUpload && <div className="fileupload-mobile"><FileUpload/></div>}
                </center>

                <br></br>



            </div>

        </>
    )
}

export default PromptFormMobile