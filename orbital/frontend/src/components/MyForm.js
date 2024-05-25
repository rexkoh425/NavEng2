import React, { useState } from 'react';

function MyForm() {
  const [formData, setFormData] = useState({
    // Initialize form fields
    field1: '',
    field2: '',
    // Add more fields if needed
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/formPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formData }),
      });
      const responseData = await response.json();
      console.log(responseData);
      // Handle success response here
    } catch (error) {
      console.error('Error:', error);
      // Handle error here
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Field 1:
        <input
          type="text"
          name="field1"
          value={formData.field1}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
        Field 2:
        <input
          type="text"
          name="field2"
          value={formData.field2}
          onChange={handleChange}
        />
      </label>
      <br />
      {/* Add more fields as needed */}
      <button type="submit">Submit</button>
    </form>
  );
}

export default MyForm;