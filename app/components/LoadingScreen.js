import React from 'react';

export default class LoadingScreen extends React.Component {
  render() {
    return (
      <div style={{ backgroundColor: 'red' }}>
        <h1>Loading...</h1>
      </div>
    );
  }
}
