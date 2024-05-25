import React, { useState, useEffect } from 'react';

function NavEng() {
  const [imagePath, setImagePath] = useState('');

  useEffect(() => {
    fetch('/formPost', { method: 'POST' })
      .then(response => response.text())
      .then(htmlContent => setImagePath(htmlContent))
      .catch(error => console.error('Error:', error));
  }, []); // Empty dependency array to run the effect only once

  return (
    <html>
      <head>
        <title>NavEng</title>
        <link rel="icon" type="image/x-icon" href="/Pictures/Favicon.jpeg" />
        <meta charset="UTF-8" />
        <meta name="keywords" content="NavEng, NUS tutorial room" />
        <meta name="description" content="Navigate NUS tutorial rooms" />
      </head>
      <body>
        <p>
          <ins>How it works</ins>
          <ol type="1">
            <li>Key in the nearest tutorial room from you</li>
            <li>Follow the pictures according for step-by-step instructions</li>
          </ol>
        </p>
        <div>
          <form action="/formPost" method="post" id="SDForm" encType="application/x-www-form-urlencoded">
            <label htmlFor="source">Current Location:</label><br />
            <input type="text" id="source" name="source" required /><br />
            <label htmlFor="destination">Destination:</label><br />
            <input type="text" id="destination" name="destination" required /><br />
            <br />
            <button type="submit" id="submit">Submit</button>
          </form>
        </div>
        <div id="image_path" className="img_container">{imagePath}</div>
      </body>
    </html>
  );
}

export default NavEng;