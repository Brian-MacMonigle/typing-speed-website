import React, { Component } from 'react';


class About extends Component {
  render() {
    return (
    	<div className="wrapper">
    		<h1>What is Typing Speed Tester?</h1>
      		<h2>Brief History</h2>
      		<p>
      			This was created by Brian MacMonigle as a fun way to explore the React framework.
      		</p>
      		<p>
      			<span>I used </span> 
      			<a href='http://typing-speed-test.aoeu.eu/'>http://typing-speed-test.aoeu.eu/</a>
      			<span> as a guide</span>
      		</p>
    	</div>
    );
  }
}

export default About;
