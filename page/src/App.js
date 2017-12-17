import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import Type from './Type';
import About from './About';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visitors: 0,
    }

    fetch("/api/visitor", {
      headers: new Headers({
        'Content-type': 'application/json'
      })
    })
    .then(res => res.json())
    .then(json => this.setState({
      visitors: json.visitors
    }))
    .catch(err => console.log("Error: " + err));
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
            <Route exact={true} path="/" render={props => <Type {...props} visitors={this.state.visitors}/>} />
            <Route path='/about' render={props => <About {...props} />} />
          </div>
          {this.footer()}
        </div>
      </Router>
    );
  }
}

export default App;
