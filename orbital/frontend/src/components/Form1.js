import React, { useState, useEffect } from 'react';

function Form1() {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch('/formPost', { method: 'POST' })
      .then(response => response.text())
      .then(text => setHtmlContent(text))
      .catch(error => console.error('Error:', error));
  };

  return (
    <div>
      {/* Render other components */}
      <div id="image_path" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}

export default Form1;
