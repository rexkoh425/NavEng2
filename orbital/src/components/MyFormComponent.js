import React, { useState} from 'react';

function MyFormComponent() {
    const [formData, setFormData] = useState({
        source: '',
        destination: ''
      });

      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        fetch('/formPost', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        .then(response => {
            return response.text();
        }) // Parse the response as text
        .then(text => {
            return text;
        })
        .then(htmlContent => {
            // Update the HTML content of the "image_path" div with the received HTML
            document.getElementById("image_path").innerHTML = htmlContent;
        })
        .catch(error => console.error('Error:', error));
      };

  return (
    <div>
      <form action="/formPost" method="post" id="SDForm" encType="application/x-www-form-urlencoded" >
        <label htmlFor="source">Current Location :</label> <br />
        <input type="text" id="source" name="source" required /> <br />
        <label htmlFor="destination">Destination :</label> <br />
        <input type="text" id="destination" name="destination" required /> <br /><br />
        <button type="submit" id="submit"> Submit </button>
      </form>
      {handleSubmit}
    </div>
    

  );
}

export default MyFormComponent;