import React, { Component } from 'react';
import fetch from 'fetch-retry';

function completedWord(word, typed) {
  let list = []
  for(let letNum in word) {
    if(typed.length <= word.length && word[letNum] === typed[letNum]) {
      list.push(<span key={letNum} className="correct">{word[letNum]}</span>);
    } else {
      list.push(<span key={letNum} className="incorrect">{word[letNum]}</span>);
    }
  }
  return (
    <span className="completed">{list}</span>
  );
}

function currentWord(word, typed) {
  let list = []
  for(let letNum in typed) {
    if(typed.length <= word.length && word[letNum] === typed[letNum]) {
      list.push(<span key={letNum} className="correct">{word[letNum]}</span>);
    } else {
      list.push(<span key={letNum} className="incorrect">{word[letNum]}</span>);
    }
  }
  for(let letNum = typed.length; letNum < word.length; letNum++) {
    list.push(word[letNum])
  }
  return (
    <span className="current">{list}</span>
  );
}

function numCorrect(word, typed) {
  let count = 0;
  for(let letNum in typed) {
    if(typed[letNum] === word[letNum]) {
      count++;
    }
  }
  return count;
}

class Timer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      left: props.time,
      onFinish: props.onFinish,
      started: false,
      render: props.render
    }

    this.tick = this.tick.bind(this);
  }

  start() {
    if(!this.state.started) {
      this.setState({
        started: true
      });
      this.timer = setInterval(this.tick, 100);
    }
  }

  getCurrentTime() {
    return this.state.left;
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
    if(this.state.left === 0) {
      this.componentWillUnmount();
      this.state.onFinish();
      return;
    }

    this.setState({
      left: (this.state.left - 1)
    })
  }

  render() {
    return this.state.render(this.state.left);
  }
}

class InputBox extends Component {
  constructor(props) {
    super(props);

    this.keyPressed = this.keyPressed.bind(this);

    this.state = {
      history: [],
      word: "",
      future: [],
      typed: "",
      time: 600,
      cpm: 0,
      wpm: 0
    }

    this.getWords();
  }

  getWords() {
    fetch('/api/random', {
      retries: 3,
      retryDelay: 1000,
    })
      .then(res => res.json())
      .then(json => this.setState({
        word: json.shift(),
        future: json
      }))
      .catch(err => this.setState({
        word: "There",
        future: ["was", "an", "issue", "retrieving", "words", "from", "the", "server.", "Please", "refresh", "the", "page", "and", "try", "again."],
      }));
  }


  keyPressed(e) {
    //e.preventDefault();

    // Removes the F1-12 keys
    if(e.keyCode >= 112 && e.keyCode <= 123) {
      return;
    }

    this.timer.start();

    let word = this.state.word;
    let typed = e.target.value;

    // Next word
    if(e.key === " ") {
      this.state.history.push([word, typed.trim()]);
      
      let next = this.state.future.shift();
      if(next === undefined) {
        next = "";
      }

      this.setState({
        word: next,
        typed: "",
        cpm: this.getCPM(),
        wpm: this.getWPM()
      });

      e.target.value = "";
      if(next === "") {
        e.target.placeholder = "We ran out of words.";
        e.target.disabled = true;
        this.timer.stop();
      } else {
        e.target.placeholder = "";
      }
    } // Go to previous word
    else if(e.key === "Backspace" && this.state.typed === "") {
      if(this.state.history.length > 0) {
        let [pastWord, pastTyped] = this.state.history.pop();
        this.state.future.unshift(this.state.word);
        e.target.value = pastTyped;
        this.setState({
          word: pastWord,
          typed: pastTyped,
          cpm: this.getCPM(),
          wpm: this.getWPM()
        });
      }
    } else {
      this.setState({
        typed: typed,
        cpm: this.getCPM(),
        wpm: this.getWPM()
      });
    }
  }

  componentDidUpdate() {
    if(this.word) {
      const boxStyle = window.getComputedStyle(this.box);
      let boxHeight = this.box.clientHeight - parseInt(boxStyle.paddingTop, 10) - parseInt(boxStyle.paddingBottom, 10);
      this.box.scrollTop = this.word.offsetTop - boxHeight / 2;
    }  }

  timerFinished() {
    this.input.disabled = true;
    this.input.placeholder = "Timer finished.";
    this.input.value = "";
  }

  getCPM() {
    if(this.timer === undefined || this.timer.getCurrentTime() === 0) {
      return this.state.cpm;
    }

    let count = 0;
    for(let pair of this.state.history) {
      count += numCorrect(pair[0], pair[1]);
    }
    count += numCorrect(this.state.word, this.state.typed);

    let time = this.state.time - this.timer.getCurrentTime();
    if(time === 0) { // not enough time has passed yet
      return 0;
    }

    return Math.floor(count / time * this.state.time);
  }

  getWPM() {
    if(this.timer === undefined || this.timer.getCurrentTime() === 0) {
      return this.state.wpm;
    }


    let time = this.state.time - this.timer.getCurrentTime();
    if(time === 0) { // not enough time has passed yet
      return 0;
    }

    return Math.floor(this.state.history.length / time * this.state.time);
  }

  render() {
    let cur = "";
    if(this.state.word !== "") {
      cur = (
        <span id="current-word" className="word current" ref={e => this.word = e}>
          {currentWord(this.state.word, this.state.typed)}
        </span>
      );
    }

    return (
      <div className="input-box">
        <div className="stats">
          <span className="cpm">Corrected CPM: <b>{this.state.cpm}</b>.</span>
          <span className="wpm">WPM: <b>{this.state.wpm}</b>.</span>
          <span className="timer">Time remaining: <b>
            <span ref={e => this.time = e}>
              <Timer ref={e => this.timer = e} time={this.state.time} onFinish={() => this.timerFinished()} render={(time) => (time / 10).toFixed(1)}/>
            </span>
            </b> seconds</span>
        </div>
        <div className="words-box" ref={e => this.box = e}>
          <div className="wrapper">
            {this.state.history.map( (e, i) => 
              <span key={i} className="word">{completedWord(e[0], e[1])}</span>
            )}
            {cur}
            {this.state.future.map( (e, i) => 
              <span key={i} className="word">{e}</span>
            )}
          </div>
        </div>
        <input ref={e => this.input = e} type="text" onKeyUp={this.keyPressed} autoComplete="off" autoFocus="true" placeholder="type here" spellCheck="false"  pattern="[A-Za-z]"/>
      </div>
    );
  }
}

class Type extends Component {
  render() {
    return (
      <div className="wrapper">
        <h1 className="centered">Test Your Typing Speed</h1>
        <p className="centered">
            Type the words you see in the box.  Press space after every word.  Good Luck!
        </p>
        <InputBox />
      </div>
    );
  }
}

export default Type;
