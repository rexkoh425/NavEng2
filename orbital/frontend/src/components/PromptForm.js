import { useState, useEffect} from "react"
import axios from "axios"
import logo from '../logo.svg'

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

        <form>
            <label className="StartAndEndLocation">Start Location</label>
            <p className="description">Search or select the location closest to you</p>
            <input type="text" id="email" name="email" value={email} onChange={ (e) => setEmail(e.target.value) }/>
            <br></br>
            <br></br>
            <label className="StartAndEndLocation">End Location</label>
            <p className="description">Search or select the location closest to your end point</p>
            <input type="text" id="destination" name="destination" value={message} onChange={ (e) => setMessage(e.target.value) }/>
            <br></br>
            <br></br>

            <button type="submit" onClick={handleSubmit}>Submit</button>
            <div dangerouslySetInnerHTML={{ __html: messageError }} />

        </form>
        </>
    )
}

export default PromptForm