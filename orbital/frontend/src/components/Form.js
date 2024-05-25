import React, { useState } from 'react';

import axios from 'axios';

function Form() {

const [formData, setFormData] = useState({

name: "",

email: "",

});

const handleChange = (e) => {

const { name, value } = e.target;

setFormData({ ...formData, [name]: value });

};

const handleSubmit = async (e) => {

e.preventDefault();

try {

const response = await axios.post('http://localhost:3000/formPost', formData);

console.log('Form data submitted successfully:', response.data);

} catch (error) {

console.error('Error submitting form data:', error);

}

};

return (

<form onSubmit={handleSubmit}>

<label>

Name:

<input

type="text"

name="name"

value={formData.name}

onChange={handleChange}

/>

</label>

<br />

<label>

Email:

<input

type="email"

name="email"

value={formData.email}

onChange={handleChange}

/>

</label>

<br />

<button type="submit">Submit</button>

</form>

);

}

export default Form;