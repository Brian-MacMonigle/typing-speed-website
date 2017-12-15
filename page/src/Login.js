import React, { Component } from 'react';
//import { Link } from 'react-router-dom';


class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      password: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    var headers = new Headers();
    headers.append('Content-type', 'application/json');

    fetch('/login', {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify({
        'name': this.state.name,
        'password': this.state.password,
      })
    })
    .then(res => res.json())
    .then(json => {
      console.log(json);
      if(json.user.name === this.state.name) {
        this.props.loginFunc(json.user);
        this.props.history.push('/');
      }
    })
    .catch(err => console.log(err));
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  render() {
    if(this.props.login !== undefined) {
      return (
        <div className="wrapper">
          <h1>You are already logged in {this.props.login.name}!</h1>
        </div>
      );
    }

    return (
    	<div className="wrapper">
        <h1>Welcome to the login page!</h1>
        <form ref={e => this.form = e} onSubmit={this.handleSubmit}>
          <div className="form-entry">
            <span className="form-label">Name:</span>
            <input type="text" name="name" value={this.state.name} onChange={this.handleChange} />
          </div>
          <div className="form-entry">
            <span className="form-label">Password:</span>
            <input type="password" name="password" value={this.state.password} onChange={this.handleChange} />
          </div>
          <div className="form-submit">
            <input type="submit" name="login" value="Login" />
          </div>
        </form>
    	</div>
    );
  }
}

export default Login;
