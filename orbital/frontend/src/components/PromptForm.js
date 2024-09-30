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
import TopDownMap from "./TopDownMap";
import ImageOutput from "./ImageOutput";
import CircularProgress from "@mui/material/CircularProgress";
import circularProgressClasses from '@mui/material/CircularProgress';


function PromptForm() {

    const [sourceLocation, setSourceLocation] = useState('') //Source Location for pathfinding
    const [destinationLocation, setDestinationLocation] = useState('') //Last Location for pathfinding
    const [disableSubmit, setDisableSubmit] = useState(true) //Boolean to disable and enable Submit Button
    const [autocompleteFields, setAutocompleteFields] = useState([]); //Multistop fields
    const [MultiStopArrayDuplicate, setMultiStopArrayDuplicate] = useState([]); //Duplicate Array to store temporary Multistop Array
    const [MultiStopArray, setMultiStopArray] = useState([]); //Multistop Array of all the stops the user requires
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
    const [blockedIndicator, setBlockedIndicator] = useState(false)
    const [submitTrigger, setSubmitTrigger] = useState(false)

    const [Node_id_array, setNode_id_array] = useState([]);
    const [visited, setVisited] = useState(["0"])
    const [graphnodes, setGraphnodes] = useState([]);

    const [nodeDirection, setNodeDirection] = useState([]);
    const [loading, setLoading] = useState(false)


    const Local = process.env.REACT_APP_LOCAL;
    const repo = process.env.REACT_APP_REPO;

    let websitelink = ""
    if (Local == "true") {
        websitelink = "http://localhost:4000"
    } else {
        if(repo == "rex"){
            websitelink = "https://orbital-website-cyan.vercel.app"
        }else{
            websitelink = "https://naveng-backend-vercel.vercel.app"
        }
        
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

    useEffect(() => {
        // Update clumpedArray whenever front, center, or end change
        const newClumpedArray = [sourceLocation, ...MultiStopArrayDuplicate, destinationLocation];
        setMultiStopArray(newClumpedArray);
        disableSubmitButton(newClumpedArray)
    }, [sourceLocation, MultiStopArrayDuplicate, destinationLocation, submitTrigger]);

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
            setBlockedIMGName(BlockedIMGNameVariable);

            const direction = BlockedIMGNameVariable.split("_")[4];
            setNodeDirection(direction)


            const node_string = BlockedIMGNameVariable.split("_")[0];
            const before_node_id = parseInt(node_string);
            setBlockedNodeID(before_node_id)

        }
    }, [blocked]);

    let beforeparts = beforeBlocked.split('/');
    let beforeremainder = beforeparts.slice(8).join('/');
    let beforeindexOfQuote = beforeremainder.indexOf('"');
    const beforebeforeQuote = beforeremainder.slice(0, beforeindexOfQuote);
    let node_string = beforebeforeQuote.split("_")[0];
    let before_node_id = parseInt(node_string);

    const updateMap = () => {
        axiosGetFloor()
    }

    const incrementCounter = (e) => { //counter for image array
        e.preventDefault();
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
        e.preventDefault();
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
            .catch(err => console.log("Fetch Error!"))
    }

    const axiosFetchLocations = async (processing) => {
        await axios.post(websitelink + '/locations')
            .then(res => {
                setSelectLocations(res.data)
            })
            .catch(err => console.log("Fetch Location Error!"))
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
            const distArray = response.data['Dist_array'];
            setPathInstructions(response.data['Instructions'])

            setNodesPath(response.data['compressed_nodes_path'])
            setNode_id_array(response.data['nodes_path']);
            setStopsIndex(response.data['Stops_index']);
            setNode_id_array(response.data['nodes_path']);
            handleConvertToMetres(distArray);

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
            BlockedNodeIndex: blockedNodeIndex,
        };

        try {
            const response = await axios.post(websitelink + '/blockRefresh', postData);

            // Update state variables with the response data
            setLoading(false)
            setMessageError(response.data['HTML']);
            const distArray = response.data['Dist_array'];
            handleConvertToMetres(distArray);
            setStopsIndex(response.data['Stops_index']);
            setMultiStopArray(response.data['Destinations']);
            setMultiStopArrayNotification(response.data['Destinations'])
            setNode_id_array(response.data['nodes_path']);
            const arrayFromString = response.data['HTML'].split('<img src');
            setBlocked(arrayFromString[0]);

            setPathInstructions(response.data['Instructions'])
            setBlockedIndicator(true)
            setSubmitTrigger(!submitTrigger)
            setNodesPath(response.data['compressed_nodes_path'])
            setVisited(["0"])



        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const axiosGetFloor = async () => {
        try {
            let postData = {
                node_id: blockedNodeID
            };

            const response = await axios.post(websitelink + '/getfloor', postData, {
                timeout: 30000 
            });
            setGraphnodes(response.data)


        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.error('Error getting floor: Request timed out');
            } else {
                console.error('Error getting floor:', error);
            }
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
        setTotalDistance(dividedDistance[0])
    }

    const handleShelteredCheckbox = (event) => {
        setSheltered(event.target.checked);
    };

    const handleStairsCheckbox = (event) => {
        setNoStairs(event.target.checked);
    };

    return (
        <>
            <div style={{ display: "flex", flexDirection: "row" }} >
                <div className="child1"><center>
                    <form className="desktopForm">
                        <label className="StartAndEndLocation">Start Location</label>
                        {!formSubmitted && <Typography className="description1" sx={{ fontFamily: "Lexend" }}>Search or select the location closest to you</Typography>}
                        <div className="centered-element1">
                            <Autocomplete

                                options={selectLocations} sx={{ width: 250, fontFamily: 'Georgia, serif' }} renderInput={(params) => (
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
                        </div>
                        <br></br>
                        <label className="StartAndEndLocation">End Location</label>
                        {!formSubmitted && <Typography className="description" sx={{ fontFamily: "Lexend", marginBottom: 1 }}>Search or select the location closest to your end point</Typography>}

                        <div >

                            {autocompleteFields.map((_, index) => (

                                <div className="Autocomplete-container" key={index}>
                                    <div className="centered-element">
                                        <Autocomplete
                                            options={selectLocations}
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

                        <FormControlLabel control={<Checkbox sx={{
                            color: "#cdd8e6",
                            '&.Mui-checked': {
                                color: "#F05C2C",
                            },
                        }} checked={NoStairs}
                            onChange={handleStairsCheckbox} />} label="No Stairs" sx={{ fontFamily: "Lexend" }} />

                        <FormControlLabel control={<Checkbox sx={{
                            color: "#cdd8e6",
                            '&.Mui-checked': {
                                color: "#F05C2C",
                            },
                        }} checked={sheltered}
                            onChange={handleShelteredCheckbox} />} label="Sheltered Path" sx={{ fontFamily: "Lexend" }} />
                        <br></br>
                        <Button variant="contained" type="submit" disabled={disableSubmit} onClick={handleSubmit} sx={{ bgcolor: "#cdd8e6", color: 'white', "&:hover": { bgcolor: "#F05C2C" }, fontFamily: "Lexend" }}>Submit</Button>

                        <br></br>
                        {showUpload && <div><FileUpload /></div>}
                        <br></br>
                        <Instructions formSubmitted={formSubmitted}></Instructions>
                        {formSubmitted && stopsIndex && !noPath &&
                            <TopDownMap nodes={graphnodes} visited={visited} originNodeId={blockedNodeID} nodesPath={nodesPath} stopsIndex={stopsIndex} Node_id_array={Node_id_array} blockedIMGName={blockedIMGName}></TopDownMap>}


                    </form>
                </center> </div>

                <div className="child2">
                    {!formSubmitted
                        && <div><Box
                            component="section"
                            display="flex"
                            alignItems="center"
                            sx={{
                                p: 2, border: '1px grey', bgcolor: '#F5F5F5', height: "68vh", marginRight: "10vh",
                                textAlign: 'center', justifyContent: 'center', color: 'grey', fontFamily: "Lexend"
                            }}>Please select the starting and ending <br></br> locations to view the pictures</Box></div>}
                    <div className="bottomAligncontent">
                        <div>
                            <center>
                                {!noPath && formSubmitted && <div>
                                    {!noPath && formSubmitted && <p className="parametricsDescription">Total Distance: </p>}
                                    {!noPath && formSubmitted && <p className="parametricsContent">{totalDistance}m</p>}

                                    <div></div>
                                    {!noPath && formSubmitted && <p className="parametricsDescription">Total Estimated Time Taken: </p>}
                                    {!noPath && formSubmitted && <div className="parametricsContent"><CalculateTime distance={totalDistance} /></div>}
                                    <br></br>
                                    <br></br>
                                    {!noPath && formSubmitted && !hideTimeTaken && <p className="parametricsDescription">Distance Remaining: </p>}
                                    {!noPath && formSubmitted && !hideTimeTaken && <p className="parametricsContent">{distanceArray[arrayposition]}m</p>}

                                    <div></div>
                                    {!noPath && formSubmitted && !hideTimeTaken && <p className="parametricsDescription">Time to Destination: </p>}
                                    {!noPath && formSubmitted && !hideTimeTaken && <div className="parametricsContent"><CalculateTime distance={distanceArray[arrayposition]} /></div>}

                                </div>}
                            </center>
                            {!noPath && formSubmitted && <p className="imageCount">{arrayposition + 1}/{arrayFromString.length}</p>}
                            {!noPath && formSubmitted && <DestinationNotification stopsIndex={stopsIndex} arrayposition={arrayposition} MultiStopArray={MultiStopArrayNotification} pathInstructions={pathInstructions} blockedIndicator={blockedIndicator} />}
                            <div style={{ display: 'none' }}>
                                {/* Preload the next image */}
                                <ImageOutput imgPath={arrayFromString[(arrayposition + 1) % arrayFromString.length]} />
                            </div>

                            <div className="container">
                                {formSubmitted && !loading && !noPath && <Button variant="contained" type="submit" onClick={decrementCounter} disabled={disableLeftButton} sx={{ bgcolor: "#D95328", "&:hover": { bgcolor: "#F05C2C" }, minWidth: 'unset', textAlign: 'center !important', px: '0px', py: '0px', height: "10vh", width: "3vw" }}><ArrowLeftIcon></ArrowLeftIcon></Button>}
                                <div className="imageContainer">
                                    {formSubmitted && !loading && <ImageOutput imgPath={arrayFromString[arrayposition]} />}
                                    <br></br>
                                    <Tooltip title="Block?" arrow>
                                        {formSubmitted && !loading && !noPath && !showBlockConfirmation && <Button className="overlay-button" onClick={blockConfirmation}><img src="block_logo.png" alt="cannot display" className="block-logo"></img></Button>}
                                    </Tooltip>
                                    {!noPath && showBlockConfirmation && <Button variant="contained" className="overlay-confirmation-button" sx={{ bgcolor: "#D95328", "&:hover": { bgcolor: "#F05C2C" }, fontFamily: "Lexend" }} onClick={axiosPostBlock}>Block this point?</Button>}
                                    {showUpload && <div className="overlay-refresh">
                                        <Button variant="contained" type="submit" onClick={handleSubmitRefresh} sx={{ bgcolor: "#D95328", "&:hover": { bgcolor: "#F05C2C" }, fontFamily: "Lexend" }}>Give me an alternate path</Button>
                                    </div>}
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

                                </div>
                                <div className="rightArrow">
                                    {formSubmitted && !loading && !noPath && <Button variant="contained" type="submit" onClick={incrementCounter} disabled={disableRightButton} sx={{ bgcolor: "#D95328", "&:hover": { bgcolor: "#F05C2C" }, minWidth: 'unset', textAlign: 'center !important', px: '0px', py: '0px', height: "10vh", width: "3vw" }}><ArrowRightIcon></ArrowRightIcon></Button>}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PromptForm