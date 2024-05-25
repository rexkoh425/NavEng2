import React from 'react';

class MyComponent extends React.Component {
  render() {
    // HTML content that you want to render
    const htmlContent = '<div>Hello, <strong>world!</strong></div>';

    return (
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
  }
}

export default MyComponent;