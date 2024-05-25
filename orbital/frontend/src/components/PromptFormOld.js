import { useState, useEffect} from "react"
import axios from "axios"

function PromptFormOld() {

    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [messageError, setMessageError] = useState('')
    const [selectData, setSelectData] = useState([])
    const [selectValue, setSelectValue] = useState('')

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
            email: email,
            website: selectValue,
            message: message
        }

        await axios.post("http://localhost:4000/contact", postData)
        .then(res => setMessageError(<p className="success">{res.data}</p>))
    }

    const SelectDropdown = () => {
        return (
            <select value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
                {
                    selectData?.map( (item) => (
                        <option value={item.website} key={item.website}>{item.website}</option>
                    ))
                }
            </select>
        )
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

    return (
        <>
        <h1>Contact Us</h1>

        <form>
            <label>Email</label>
            <input type="text" id="email" name="email" value={email} onChange={ (e) => setEmail(e.target.value) }/>

            <label>How Did You Hear About Us?</label>
            <SelectDropdown/>

            <label>Message</label>
            <textarea id="message" name="message" value={message} onChange={ (e) => setMessage(e.target.value) }></textarea>

            {messageError}

            <button type="submit" onClick={handleSubmit}>Submit</button>
        </form>
        </>
    )
}

export default PromptFormOld