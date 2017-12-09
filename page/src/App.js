import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import Type from './Type';
import About from './About';


class App extends Component {

  header() {
    return (
      <header>
        <Link to={'/'}>
          Home
        </Link>
        <Link to={'/about'}>
          About
        </Link>
      </header>
    );
  }

  footer() {
    return (
      <footer>
        <p>This website was programed by:</p>
        <p><b>Brian MacMonigle</b></p>
      </footer>
    );
  }

  render() {
    return (
      <Router>
        <div id="page">
          {this.header()}
          <div id="content">
            <Route exact={true} path="/" component={Type}/>
            <Route path='/about' component={About}/>
          </div>
          {this.footer()}
        </div>
      </Router>
    );
  }
}

export default App;
