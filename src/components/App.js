import React from 'react';
import logo from '../assets/images/starlink_logo.svg';
import '../styles/App.css';
import Header from './Header';
import Footer from './Footer';
import Main from './Main'
function App() {
  return (
    <div className="App">
      <Header/>
      <Main/>
    <Footer/>
    </div>
  );
}

export default App;
