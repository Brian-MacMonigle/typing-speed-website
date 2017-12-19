import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import Type from './Type';
import About from './About';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visitor: 0,
    }

    fetch("/api/visitor", {
      headers: new Headers({
        'Content-type': 'application/json'
      })
    })
    .then(res => res.json())
    .then(json => {
      if(json.status === 'success') {
        this.setState({visitor: json.message});
      } else {
        return Promise.reject(json.message);  
      }
    })
    .catch(err => console.log("Error: ", err));
  }

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
        <p>
          <b>
            Brian MacMonigle
          </b>
        </p>
      </footer>
    );
  }

  render() {
    return (
      <Router>
        <div id="page">
          {this.header()}
          <div id="content">
            <Route exact={true} path="/" render={props => <Type {...props} visitor={this.state.visitor}/>} />
            <Route path='/about' render={props => <About {...props} />} />
          </div>
          {this.footer()}
        </div>
      </Router>
    );
  }
}

export default App;
