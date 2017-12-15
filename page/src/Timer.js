import React, { Component } from 'react';

class Timer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      started: false,
    }

    this.tick = this.tick.bind(this);
  }

  start() {
    if(!this.state.started) {
      this.setState({
        started: true,
      });
      this.timer = setInterval(this.tick, this.props.interval);
    }
  }

  stop() {
    clearInterval(this.timer);
    this.setState({
      started: false,
    });
  }

  componentWillUnmount() {
    this.stop();
  }

  tick() {
    let end = this.props.onTick();
    if(end) {
      this.stop();
      if(this.props.onFinish !== undefined) {
        this.props.onFinish();
      }
    }
  }

  render() {
    return (
      <span className="timer-render">
        {this.props.render()}
      </span>
    )
  }
}

export default Timer;