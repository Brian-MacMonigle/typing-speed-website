import React, { Component } from 'react';
import Timer from './Timer';


function randomWords(amount) {
  let out = [];
  for(let i = 0; i < amount; i++) {
    let rand = Math.floor(Math.random() * simpleWords.length);
    out.push(simpleWords[rand]);
  }
  return out;
}

function completedWord(word, typed) {
  let list = []
  for(let letNum in word) {
    if(typed.length <= word.length + 1 && word[letNum] === typed[letNum]) {
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
    if(typed.length <= word.length + 1 && word[letNum] === typed[letNum]) {
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

class InputBox extends Component {
  constructor(props) {
    super(props);

    this.keyPressed = this.keyPressed.bind(this);
    this.getWords = this.getWords.bind(this);
    this.refresh = this.refresh.bind(this);
    this.timerRender = this.timerRender.bind(this);
    this.timerTick = this.timerTick.bind(this);
    this.timerFinished = this.timerFinished.bind(this);

    let words = randomWords(50);

    this.state = {
      history: [],
      word: words.shift(),
      future: words,
      typed: "",
      initTime: 60000,
      time: 60000,
      interval: 1000,
      cpm: 0,
      wpm: 0
    }
  }

  refresh() {   
    let words = randomWords(50); 
    this.setState({
      history: [],
      word: words.shift(),
      future: words,
      typed: "",
      time: this.state.initTime,
      cpm: 0,
      wpm: 0
    });
    this.input.disabled = false;
    this.input.placeholder="type here";
  }

  getWords() {
    let words = randomWords(50);

    this.setState({
      future: this.state.future.concat(words)
    });
  }

  keyPressed(e) {
    //e.preventDefault();
    if(this.time <= 0) {
    	return;
    }

    // Removes the F1-12 keys
    if(e.keyCode >= 112 && e.keyCode <= 123) {
      return;
    }

    this.timer.start();

    // Next word
    if(e.key === " ") {
      this.state.history.push([this.state.word, e.target.value.slice(0, e.target.value.length - 1)]);
      e.target.value = "";

      let next = this.state.future.shift();
      if(next === undefined) {
        this.setState({
          word: "",
          typed: "",
        });
        e.target.placeholder = "We ran out of words.";
        e.target.disabled = true;
        this.timer.stop();
      } else {
        this.setState({
          word: next,
          typed: "",
        });
        e.target.placeholder = "";
      }

      if(this.state.future.length < 25) {
        this.getWords();
      }
    } // Go to previous word
    else if(e.key === "Backspace" && this.state.typed === "" && this.state.history.length > 0) {
      let [pastWord, pastTyped] = this.state.history.pop();
      this.state.future.unshift(this.state.word);
      e.target.value = pastTyped;
      this.setState({
        word: pastWord,
        typed: pastTyped,
      });
    } else {
      this.setState({
        typed: e.target.value
      });
    }
  }

  componentDidUpdate() {
    if(this.word) {
      const boxStyle = window.getComputedStyle(this.box);
      let boxHeight = this.box.clientHeight - parseInt(boxStyle.paddingTop, 10) - parseInt(boxStyle.paddingBottom, 10);
      this.box.scrollTop = this.word.offsetTop - boxHeight / 2;
    }  
  }

  getCPM() {
    let count = 0;
    for(let pair of this.state.history) {
      count += numCorrect(pair[0], pair[1]);
    }
    count += numCorrect(this.state.word, this.state.typed);

    let time = this.state.initTime - this.state.time;

    return Math.floor(count / time * 60000);
  }

  getWPM() {
    let time = this.state.initTime - this.state.time;
    if(time === 0) { // not enough time has passed yet
    	return 0;
    }

    return Math.floor(this.state.history.length / time * 60000);
  }

  timerTick() {
  	// We set state here because we need the time updated before getCPM and getWPM are set.
  	// We dont call setState twice because that is too expensive
  	// eslint-disable-next-line
  	this.state.time = this.state.time - this.state.interval;
  	this.setState({
  		cpm: this.getCPM(),
  		wpm: this.getWPM(),
  	});
  	return this.state.time <= 0;
  }

  timerFinished() {
    this.input.disabled = true;
    this.input.placeholder = "Timer finished.";
    this.input.value = "";
  }

  timerRender() {
  	return (this.state.time / 1000).toFixed(0);
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
          <span className="timer">
            <span className="label">Time remaining: </span>
            <b>
              <span ref={e => this.time = e}>
                <Timer ref={e => this.timer = e} render={this.timerRender} onTick={this.timerTick} interval={this.state.interval} onFinish={this.timerFinished}/>
              </span>
            </b>
            <span className="label"> seconds</span>
          </span>
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
        <input className="text-box" ref={e => this.input = e} type="text" onKeyUp={this.keyPressed} autoComplete="off" autoFocus="true" placeholder="type here" spellCheck="false" />
        <input type="button" value="Refresh" className="refresh" onClick={this.refresh} />
      </div>
    );
  }
}

class Type extends Component {
  render() {
    let visitor = "";
    if(this.props.visitor > 0) {
      visitor = (
        <p className="centered">
          You are visitor number <b>{this.props.visitor}</b>
        </p>
        );
    }

    return (
      <div className="wrapper">
        <h1 className="centered">Test Your Typing Speed</h1>
        <p className="centered">
          Type the words you see in the box.  Press space after every word.  Good Luck!
        </p>
        {visitor}
        <InputBox />
      </div>
    );
  }
}

export default Type;


const simpleWords = ['a', 'aback', 'abase', 'abash', 'abate', 'abbas', 'abbe', 'abbey', 'abbot', 'abc', 'abed', 'abet', 'abhor', 'abide', 'able', 'abode', 'abort', 'about', 'above', 'abuse', 'abut', 'abyss', 'ace', 'ache', 'acid', 'acme', 'acorn', 'acre', 'acrid', 'act', 'actor', 'acute', 'ad', 'adage', 'adapt', 'add', 'addle', 'adept', 'adieu', 'admit', 'admix', 'ado', 'adobe', 'adopt', 'adore', 'adorn', 'adult', 'aegis', 'aerie', 'afar', 'affix', 'afire', 'afoot', 'afro', 'aft', 'again', 'agar', 'agate', 'agave', 'age', 'agent', 'agile', 'ago', 'agog', 'agone', 'agony', 'agree', 'ague', 'ah', 'ahead', 'ahem', 'ahoy', 'aid', 'aide', 'ail', 'aile', 'aim', "ain't", 'air', 'airy', 'aisle', 'ajar', 'akin', 'ala', 'alai', 'alan', 'alarm', 'alb', 'alba', 'album', 'alder', 'ale', 'aleph', 'alert', 'alga', 'algae', 'algal', 'alia', 'alias', 'alibi', 'alien', 'align', 'alike', 'alive', 'all', 'allay', 'alley', 'allot', 'allow', 'alloy', 'ally', 'allyl', 'alma', 'aloe', 'aloft', 'aloha', 'alone', 'along', 'aloof', 'aloud', 'alp', 'alpha', 'also', 'altar', 'alter', 'alto', 'alum', 'am', 'amass', 'amaze', 'amber', 'amble', 'amen', 'amend', 'ami', 'amid', 'amide', 'amigo', 'amino', 'amiss', 'amity', 'ammo', 'amok', 'among', 'amort', 'amp', 'ample', 'amply', 'amra', 'amuse', 'amy', 'an', 'ana', 'and', 'anent', 'anew', 'angel', 'anger', 'angle', 'angry', 'angst', 'ani', 'anion', 'anise', 'ankle', 'annal', 'annex', 'annoy', 'annul', 'annum', 'anode', 'ant', 'ante', 'anti', 'antic', 'anus', 'anvil', 'any', 'aorta', 'apart', 'ape', 'apex', 'aphid', 'apple', 'apply', 'apron', 'apse', 'apt', 'aqua', 'arc', 'arch', 'are', 'area', 'arena', 'argo', 'argon', 'argot', 'argue', 'arhat', 'aria', 'arid', 'arise', 'ark', 'arm', 'army', 'aroma', 'arose', 'array', 'arrow', 'arson', 'art', 'arty', 'arum', 'aryl', "a's", 'as', 'ascii', 'ash', 'ashen', 'ashy', 'aside', 'ask', 'askew', 'aspen', 'ass', 'assai', 'assay', 'asset', 'aster', 'at', 'ate', 'atlas', 'atoll', 'atom', 'atone', 'atop', 'attic', 'audio', 'audit', 'auger', 'augur', 'auk', 'aunt', 'aura', 'aural', 'auric', 'auto', 'auxin', 'avail', 'aver', 'avert', 'avian', 'avid', 'avoid', 'avow', 'await', 'awake', 'award', 'aware', 'awash', 'away', 'awe', 'awful', 'awl', 'awn', 'awoke', 'awry', 'ax', 'axe', 'axial', 'axiom', 'axis', 'axle', 'axon', 'aye', 'azure', 'b', 'babe', 'baby', 'back', 'bacon', 'bad', 'bade', 'badge', 'bag', 'baggy', 'bah', 'bail', 'bait', 'bake', 'bald', 'baldy', 'bale', 'balk', 'balky', 'ball', 'balm', 'balmy', 'balsa', 'bam', 'ban', 'banal', 'band', 'bandy', 'bane', 'bang', 'banjo', 'bank', 'bar', 'barb', 'bard', 'bare', 'barge', 'bark', 'barn', 'baron', 'barre', 'basal', 'base', 'bash', 'basic', 'basil', 'basin', 'basis', 'bask', 'bass', 'bassi', 'basso', 'baste', 'bat', 'batch', 'bate', 'bater', 'bath', 'bathe', 'batik', 'baton', 'batt', 'baud', 'bawd', 'bawdy', 'bawl', 'bay', 'bayou', 'be', 'beach', 'bead', 'beady', 'beak', 'beam', 'bean', 'bear', 'beard', 'beast', 'beat', 'beau', 'beaux', 'bebop', 'beck', 'bed', 'bedim', 'bee', 'beech', 'beef', 'beefy', 'been', 'beep', 'beer', 'beet', 'befit', 'befog', 'beg', 'began', 'begat', 'beget', 'begin', 'begot', 'begun', 'beige', 'being', 'bel', 'belch', 'belie', 'bell', 'belle', 'belly', 'below', 'belt', 'beman', 'bench', 'bend', 'bent', 'beret', 'berg', 'berne', 'berry', 'berth', 'beryl', 'beset', 'best', 'bet', 'beta', 'betel', 'beth', 'bevel', 'bevy', 'bey', 'bezel', 'bhoy', 'bias', 'bib', 'bibb', 'bicep', 'bid', 'biddy', 'bide', 'bien', 'big', 'bigot', 'bike', 'bile', 'bilge', 'bilk', 'bill', 'billy', 'bin', 'bind', 'bing', 'binge', 'biota', 'birch', 'bird', 'birth', 'bison', 'bit', 'bitch', 'bite', 'bitt', 'biz', 'blab', 'black', 'blade', 'blame', 'blanc', 'bland', 'blank', 'blare', 'blast', 'blat', 'blaze', 'bleak', 'bleat', 'bled', 'bleed', 'blend', 'bless', 'blest', 'blew', 'blimp', 'blind', 'blink', 'blip', 'bliss', 'blitz', 'bloat', 'blob', 'bloc', 'block', 'bloke', 'blond', 'blood', 'bloom', 'bloop', 'blot', 'blow', 'blown', 'blue', 'bluet', 'bluff', 'blunt', 'blur', 'blurb', 'blurt', 'blush', 'boa', 'boar', 'board', 'boast', 'boat', 'bob', 'bobby', 'bock', 'bode', 'body', 'bog', 'bogey', 'boggy', 'bogus', 'bogy', 'boil', 'bold', 'bole', 'bolo', 'bolt', 'bomb', 'bon', 'bona', 'bond', 'bone', 'bong', 'bongo', 'bonus', 'bony', 'bonze', 'boo', 'booby', 'book', 'booky', 'boom', 'boon', 'boor', 'boost', 'boot', 'booth', 'booty', 'booze', 'bop', 'borax', 'bore', 'boric', 'born', 'borne', 'boron', 'bosom', 'boson', 'boss', 'bossy', 'botch', 'both', 'bough', 'bound', 'bourn', 'bout', 'bow', 'bowel', 'bowie', 'bowl', 'box', 'boxy', 'boy', 'boyar', 'brace', 'bract', 'brad', 'brae', 'brag', 'braid', 'brain', 'brake', 'bran', 'brand', 'brant', 'brash', 'brass', 'brave', 'bravo', 'brawl', 'bray', 'bread', 'break', 'bream', 'bred', 'breed', 'breve', 'brew', 'briar', 'bribe', 'brick', 'bride', 'brief', 'brig', 'brim', 'brine', 'bring', 'brink', 'briny', 'brisk', 'broad', 'broil', 'broke', 'brood', 'brook', 'broom', 'broth', 'brow', 'brown', 'bruit', 'brunt', 'brush', 'brute', "b's", 'bub', 'buck', 'bud', 'buddy', 'budge', 'buff', 'bug', 'buggy', 'bugle', 'build', 'built', 'bulb', 'bulge', 'bulk', 'bulky', 'bull', 'bully', 'bum', 'bump', 'bumpy', 'bun', 'bunch', 'bundy', 'bunk', 'bunny', 'bunt', 'buoy', 'buret', 'burg', 'burl', 'burly', 'burn', 'burnt', 'burp', 'burro', 'burst', 'bury', 'bus', 'bush', 'bushy', 'buss', 'bust', 'busy', 'but', 'butch', 'buteo', 'butt', 'butte', 'butyl', 'buxom', 'buy', 'buzz', 'buzzy', 'by', 'bye', 'bylaw', 'byte', 'byway', 'c', 'cab', 'cabal', 'cabin', 'cable', 'cacao', 'cache', 'cacti', 'caddy', 'cadet', 'cadre', 'cafe', 'cage', 'cagey', 'cairn', 'cake', 'calf', 'call', 'calla', 'calm', 'calve', 'calyx', 'cam', 'came', 'camel', 'cameo', 'camp', 'can', 'canal', 'candy', 'cane', 'canna', 'canny', 'canoe', 'canon', "can't", 'cant', 'canto', 'cap', 'cape', 'caper', 'capo', 'car', 'card', 'care', 'caret', 'cargo', 'carne', 'carob', 'carol', 'carp', 'carry', 'cart', 'carte', 'carve', 'case', 'cash', 'cask', 'cast', 'caste', 'cat', 'catch', 'cater', 'caulk', 'cause', 'cave', 'cavil', 'caw', 'cease', 'cedar', 'cede', 'ceil', 'cell', 'cent', 'cf', 'chafe', 'chaff', 'chain', 'chair', 'chalk', 'champ', 'chant', 'chaos', 'chap', 'char', 'chard', 'charm', 'chart', 'chase', 'chasm', 'chat', 'chaw', 'cheap', 'cheat', 'check', 'cheek', 'cheer', 'chef', 'chert', 'chess', 'chest', 'chevy', 'chew', 'chewy', 'chi', 'chic', 'chick', 'chide', 'chief', 'child', 'chili', 'chill', 'chime', 'chin', 'china', 'chine', 'chink', 'chip', 'chirp', 'chit', 'chive', 'chock', 'choir', 'choke', 'chomp', 'chop', 'chord', 'chore', 'chose', 'chow', 'chub', 'chuck', 'chuff', 'chug', 'chum', 'chump', 'chunk', 'churn', 'chute', 'cider', 'cigar', 'cilia', 'cinch', 'circa', 'cit', 'cite', 'city', 'civet', 'civic', 'civil', 'clad', 'claim', 'clam', 'clamp', 'clan', 'clang', 'clank', 'clap', 'clash', 'clasp', 'class', 'claw', 'clay', 'clean', 'clear', 'cleat', 'clef', 'cleft', 'clerk', 'click', 'cliff', 'climb', 'clime', 'cling', 'clink', 'clip', 'cloak', 'clock', 'clod', 'clog', 'clomp', 'clone', 'close', 'clot', 'cloth', 'cloud', 'clout', 'clove', 'clown', 'cloy', 'club', 'cluck', 'clue', 'clump', 'clung', 'co', 'coach', 'coal', 'coast', 'coat', 'coax', 'cob', 'cobra', 'coca', 'cock', 'cocky', 'coco', 'cocoa', 'cod', 'coda', 'code', 'codex', 'codon', 'coed', 'cog', 'coil', 'coin', 'coke', 'col', 'cola', 'cold', 'colic', 'colon', 'colt', 'colza', 'coma', 'comb', 'come', 'comet', 'comic', 'comma', 'con', 'conch', 'cone', 'coney', 'conic', 'conn', 'cony', 'coo', 'cook', 'cooky', 'cool', 'coon', 'coop', 'coot', 'cop', 'cope', 'copra', 'copy', 'coral', 'cord', 'core', 'cork', 'corn', 'corny', 'corps', 'cos', 'cosec', 'coset', 'cosh', 'cost', 'cosy', 'cot', 'cotta', 'cotty', 'couch', 'cough', 'could', 'count', 'coup', 'coupe', 'court', 'cove', 'coven', 'cover', 'covet', 'cow', 'cowl', 'cowry', 'cox', 'coy', 'coyly', 'coypu', 'cozen', 'cozy', 'cpu', 'crab', 'crack', 'craft', 'crag', 'cram', 'cramp', 'crane', 'crank', 'crap', 'crash', 'crass', 'crate', 'crave', 'craw', 'crawl', 'craze', 'crazy', 'creak', 'cream', 'credo', 'creed', 'creek', 'creep', 'crepe', 'crept', 'cress', 'crest', 'crew', 'crib', 'crime', 'crimp', 'crisp', 'criss', 'croak', 'crock', 'croft', 'crone', 'crony', 'crook', 'croon', 'crop', 'crore', 'cross', 'crow', 'crowd', 'crown', 'crud', 'crude', 'cruel', 'crumb', 'crump', 'crush', 'crust', 'crux', 'cry', 'crypt', "c's", 'csnet', 'cub', 'cubby', 'cube', 'cubic', 'cubit', 'cud', 'cue', 'cuff', 'cull', 'culpa', 'cult', 'cumin', 'cup', 'cur', 'curb', 'curd', 'cure', 'curia', 'curie', 'curio', 'curl', 'curry', 'curse', 'curt', 'curve', 'cusp', 'cut', 'cute', 'cycad', 'cycle', 'cynic', 'cyst', 'czar', 'd', 'dab', 'dad', 'daddy', 'daffy', 'dairy', 'dais', 'daisy', 'dal', 'dale', 'dally', 'dam', 'dame', 'damn', 'damp', 'dance', 'dandy', 'dang', 'dank', 'dare', 'dark', 'darn', "d'art", 'dart', 'dash', 'data', 'date', 'dater', 'datum', 'daub', 'daunt', 'davit', 'dawn', 'day', 'daze', 'de', 'dead', 'deaf', 'deal', 'dealt', 'dean', 'dear', 'death', 'debar', 'debit', 'debt', 'debug', 'debut', 'decal', 'decay', 'deck', 'decor', 'decoy', 'decry', 'deed', 'deem', 'deep', 'deer', 'defer', 'deft', 'defy', 'degas', 'degum', 'deify', 'deign', 'deity', 'deja', 'delay', 'dell', 'delta', 'delve', 'demi', 'demit', 'demon', 'demur', 'den', 'dense', 'dent', 'deny', 'depot', 'depth', 'derby', 'desk', 'deter', 'deuce', 'deus', 'devil', 'dew', 'dewar', 'dewy', 'dey', 'dial', 'diary', 'dice', 'dick', 'dicta', 'did', 'die', 'diem', 'diet', 'diety', 'dig', 'digit', 'dill', 'dim', 'dime', 'din', 'dine', 'ding', 'dingo', 'dingy', 'dint', 'diode', 'dip', 'dire', 'dirge', 'dirt', 'dirty', 'disc', 'dish', 'disk', 'ditch', 'ditto', 'ditty', 'diva', 'divan', 'dive', 'dizzy', 'do', 'dock', 'dodge', 'dodo', 'doe', 'doff', 'dog', 'dogma', 'dolce', 'dole', 'doll', 'dolly', 'dolt', 'dome', 'don', 'done', 'donor', "don't", 'doom', 'door', 'dope', 'dose', 'dot', 'dote', 'doubt', 'douce', 'dough', 'dour', 'douse', 'dove', 'dowel', 'down', 'downy', 'dowry', 'doze', 'dozen', 'drab', 'draft', 'drag', 'drain', 'drake', 'dram', 'drama', 'drank', 'drape', 'draw', 'drawl', 'drawn', 'dread', 'dream', 'dreg', 'dress', 'drew', 'drib', 'drift', 'drill', 'drink', 'drip', 'drive', 'droll', 'drone', 'drool', 'droop', 'drop', 'dross', 'drove', 'drown', 'drub', 'drug', 'druid', 'drum', 'drunk', 'drupe', 'dry', 'dryad', "d's", 'du', 'dual', 'dub', 'ducat', 'duck', 'duct', 'dud', 'due', 'duel', 'duet', 'duff', 'dug', 'duke', 'dull', 'dully', 'dulse', 'duly', 'dumb', 'dummy', 'dump', 'dumpy', 'dun', 'dunce', 'dune', 'dung', 'dunk', 'dupe', 'dusk', 'dusky', 'dust', 'dusty', 'duty', 'dwarf', 'dwell', 'dwelt', 'dyad', 'dye', 'dying', 'dyne', 'e', 'each', 'eager', 'eagle', 'ear', 'earl', 'earn', 'earth', 'ease', 'easel', 'east', 'easy', 'eat', 'eaten', 'eater', 'eave', 'ebb', 'ebony', 'echo', 'eclat', 'eddy', 'edge', 'edgy', 'edict', 'edify', 'edit', 'eel', "e'er", 'eerie', 'eft', 'e.g', 'egg', 'ego', 'egret', 'eh', 'eider', 'eight', 'eject', 'eke', 'el', 'elan', 'elate', 'elbow', 'elder', 'elect', 'elegy', 'elfin', 'elide', 'elite', 'elk', 'ell', 'elm', 'elope', 'else', 'elude', 'elute', 'elver', 'elves', 'em', 'emacs', 'embed', 'ember', 'emcee', 'emit', 'emma', 'empty', 'en', 'end', 'endow', 'enemy', 'enol', 'enter', 'entry', 'envoy', 'envy', 'epic', 'epoch', 'epoxy', 'equal', 'equip', 'era', 'erase', 'ere', 'erect', 'erg', 'erode', 'err', 'error', 'erupt', "e's", 'essay', 'ester', 'estop', 'et', 'eta', 'etc', 'etch', 'ether', 'ethic', 'ethos', 'ethyl', 'etude', 'eucre', 'evade', 'eve', 'even', 'event', 'every', 'evict', 'evil', 'evoke', 'ewe', 'ex', 'exact', 'exalt', 'exam', 'excel', 'exec', 'exert', 'exile', 'exist', 'exit', 'expel', 'extol', 'extra', 'exude', 'exult', 'eye', 'f', 'fable', 'face', 'facet', 'fact', 'facto', 'fad', 'fade', 'faery', 'fag', 'fail', 'fain', 'faint', 'fair', 'fairy', 'faith', 'fake', 'fall', 'false', 'fame', 'fan', 'fancy', 'fang', 'far', 'farad', 'farce', 'fare', 'farm', 'faro', 'fast', 'fat', 'fatal', 'fate', 'fatty', 'fault', 'faun', 'fauna', 'fawn', 'fay', 'faze', 'fear', 'feast', 'feat', 'fecal', 'feces', 'fed', 'fee', 'feed', 'feel', 'feet', 'feign', 'feint', 'fell', 'felon', 'felt', 'femur', 'fence', 'fend', 'fern', 'ferry', 'fest', 'fetal', 'fetch', 'fete', 'fetid', 'fetus', 'feud', 'fever', 'few', 'fiat', 'fib', 'fiche', 'fide', 'fief', 'field', 'fiend', 'fiery', 'fife', 'fifth', 'fifty', 'fig', 'fight', 'filch', 'file', 'filet', 'fill', 'filly', 'film', 'filmy', 'filth', 'fin', 'final', 'finch', 'find', 'fine', 'fink', 'finny', 'fir', 'fire', 'firm', 'first', 'fish', 'fishy', 'fist', 'fit', 'five', 'fix', 'fjord', 'flack', 'flag', 'flail', 'flair', 'flak', 'flake', 'flaky', 'flam', 'flame', 'flan', 'flank', 'flap', 'flare', 'flash', 'flask', 'flat', 'flaw', 'flax', 'flea', 'fleck', 'fled', 'flee', 'fleet', 'flesh', 'flew', 'flex', 'flick', 'fling', 'flint', 'flip', 'flirt', 'flit', 'float', 'floc', 'flock', 'floe', 'flog', 'flood', 'floor', 'flop', 'flora', 'flour', 'flout', 'flow', 'flown', 'flu', 'flub', 'flue', 'fluff', 'fluid', 'fluke', 'flung', 'flunk', 'flush', 'flute', 'flux', 'fly', 'flyer', 'foal', 'foam', 'foamy', 'fob', 'focal', 'foci', 'focus', 'foe', 'fog', 'foggy', 'fogy', 'foil', 'foist', 'fold', 'folic', 'folio', 'folk', 'folly', 'fond', 'font', 'food', 'fool', 'foot', 'fop', 'for', 'foray', 'force', 'ford', 'fore', 'forge', 'forgo', 'fork', 'form', 'fort', 'forte', 'forth', 'forty', 'forum', 'foul', 'found', 'fount', 'four', 'fovea', 'fowl', 'fox', 'foxy', 'foyer', 'frail', 'frame', 'franc', 'frank', 'fraud', 'fray', 'freak', 'free', 'freon', 'fresh', 'fret', 'friar', 'frill', 'fro', 'frock', 'frog', 'from', 'frond', 'front', 'frost', 'froth', 'frown', 'froze', 'fruit', 'fry', "f's", 'fudge', 'fuel', 'fugal', 'fugue', 'full', 'fully', 'fum', 'fume', 'fun', 'fund', 'fungi', 'funk', 'funky', 'funny', 'fur', 'furl', 'furry', 'fury', 'furze', 'fuse', 'fuss', 'fussy', 'fusty', 'fuzz', 'fuzzy', 'g', 'gab', 'gable', 'gad', 'gaff', 'gaffe', 'gag', 'gage', 'gain', 'gait', 'gal', 'gala', 'gale', 'gall', 'gam', 'game', 'gamin', 'gamma', 'gamut', 'gang', 'gap', 'gape', 'gar', 'garb', 'gas', 'gases', 'gash', 'gasp', 'gassy', 'gate', 'gator', 'gaudy', 'gauge', 'gaunt', 'gaur', 'gauss', 'gauze', 'gauzy', 'gave', 'gavel', 'gawk', 'gawky', 'gay', 'gaze', 'gear', 'gecko', 'gee', 'geese', 'gel', 'geld', 'gem', 'gene', 'genie', 'genii', 'genre', 'gent', 'genus', 'geode', 'germ', 'get', 'ghost', 'ghoul', 'giant', 'gibby', 'gibe', 'giddy', 'gift', 'gig', 'gila', 'gild', 'gill', 'gilt', 'gimpy', 'gin', 'gird', 'girl', 'girt', 'girth', 'gist', 'give', 'given', 'gizmo', 'glad', 'glade', 'gland', 'glans', 'glare', 'glass', 'glaze', 'gleam', 'glean', 'glee', 'glen', 'glib', 'glide', 'glint', 'gloat', 'glob', 'globe', 'glom', 'gloom', 'glory', 'gloss', 'glove', 'glow', 'glue', 'gluey', 'glum', 'glut', 'glyph', 'gnarl', 'gnash', 'gnat', 'gnaw', 'gnome', 'gnu', 'go', 'goad', 'goal', 'goat', 'gob', 'god', 'goes', 'gog', 'gogo', 'gold', 'golf', 'golly', 'gonad', 'gone', 'gong', 'good', 'goody', 'goof', 'goofy', 'goose', 'gore', 'gorge', 'gorse', 'gory', 'gosh', 'got', 'gouge', 'gourd', 'gout', 'gown', 'grab', 'grace', 'grad', 'grade', 'graft', 'grail', 'grain', 'grand', 'grant', 'grape', 'graph', 'grasp', 'grass', 'grata', 'grate', 'grave', 'gravy', 'graze', 'great', 'grebe', 'greed', 'green', 'greet', 'grep', 'grew', 'grey', 'grid', 'grief', 'grill', 'grim', 'grime', 'grimy', 'grin', 'grind', 'grip', 'gripe', 'grist', 'grit', 'groan', 'groat', 'groin', 'groom', 'grope', 'gross', 'group', 'grout', 'grove', 'grow', 'growl', 'grown', 'grub', 'gruff', 'grump', 'grunt', "g's", 'guano', 'guard', 'guess', 'guest', 'guide', 'guild', 'guile', 'guilt', 'guise', 'gulch', 'gules', 'gulf', 'gull', 'gully', 'gulp', 'gum', 'gumbo', 'gummy', 'gun', 'gunk', 'gunky', 'gunny', 'guru', 'gush', 'gust', 'gusto', 'gusty', 'gut', 'gutsy', 'guy', 'gym', 'gyp', 'gypsy', 'gyro', 'h', 'ha', 'habit', 'hack', 'had', 'haiku', 'hail', 'hair', 'hairy', 'hale', 'half', 'hall', 'halma', 'halo', 'halt', 'halve', 'ham', 'hand', 'handy', 'hang', 'hank', 'hap', 'happy', 'hard', 'hardy', 'hare', 'harem', 'hark', 'harm', 'harp', 'harpy', 'harry', 'harsh', 'hart', 'has', 'hash', 'hasp', 'hast', 'haste', 'hasty', 'hat', 'hatch', 'hate', 'hater', 'hath', 'haul', 'haunt', 'have', 'haven', 'havoc', 'haw', 'hawk', 'hay', 'haze', 'hazel', 'hazy', 'he', 'head', 'heady', 'heal', 'heap', 'hear', 'heard', 'heart', 'heat', 'heath', 'heave', 'heavy', 'heck', "he'd", 'hedge', 'heed', 'heel', 'heft', 'hefty', 'heigh', 'heir', 'held', 'helix', "he'll", 'hell', 'hello', 'helm', 'help', 'hem', 'hemp', 'hen', 'hence', 'henry', 'her', 'herb', 'herd', 'here', 'hero', 'heron', 'hertz', 'hew', 'hewn', 'hex', 'hey', 'hi', 'hick', 'hid', 'hide', 'high', 'hike', 'hill', 'hilly', 'hilt', 'hilum', 'him', 'hind', 'hinge', 'hint', 'hip', 'hippo', 'hippy', 'hire', 'his', 'hiss', 'hit', 'hitch', 'hive', 'ho', 'hoagy', 'hoar', 'hoard', 'hoax', 'hob', 'hobby', 'hobo', 'hoc', 'hock', 'hodge', 'hoe', 'hog', 'hogan', 'hoi', 'hold', 'hole', 'holly', 'holt', 'home', 'homo', 'hondo', 'hone', 'honey', 'hong', 'honk', 'honky', 'hooch', 'hood', 'hoof', 'hook', 'hoop', 'hoot', 'hop', 'hope', 'horde', 'horn', 'horny', 'horse', 'hose', 'host', 'hot', 'hotel', 'hough', 'hound', 'hour', 'house', 'hove', 'hovel', 'hover', 'how', 'howdy', 'howl', 'hoy', "h's", 'hub', 'hubby', 'huck', 'hue', 'huff', 'hug', 'huge', 'huh', 'hulk', 'hull', 'hum', 'human', 'humid', 'hump', 'humus', 'hunch', 'hung', 'hunk', 'hunt', 'hurl', 'hurry', 'hurt', 'hurty', 'hush', 'husky', 'hut', 'hutch', 'hydra', 'hydro', 'hyena', 'hying', 'hymen', 'hymn', 'hyper', 'i', 'ibex', 'ibid', 'ibis', 'ice', 'icky', 'icon', 'icy', 'id', 'idea', 'ideal', 'idiom', 'idiot', 'idle', 'idly', 'idol', 'idyll', 'i.e', 'if', 'iffy', 'igloo', 'ii', 'iii', 'ileum', 'iliac', 'ill', 'image', 'imbue', 'imp', 'impel', 'in', 'inane', 'inapt', 'inch', 'incur', 'index', 'indy', 'inept', 'inert', 'infer', 'infix', 'info', 'infra', 'ingot', 'ink', 'inlay', 'inlet', 'inn', 'input', 'inset', 'inter', 'into', 'intra', 'inure', 'ion', 'ionic', 'iota', 'ipso', 'irate', 'ire', 'iris', 'irk', 'iron', 'irony', "i's", 'is', 'isle', 'islet', "isn't", 'issue', 'it', 'itch', 'itchy', "it'd", 'item', "it'll", 'iv', 'ivory', 'ivy', 'ix', 'j', 'jab', 'jack', 'jade', 'jag', 'jake', 'jam', 'jar', 'java', 'jaw', 'jay', 'jazz', 'jazzy', 'jean', 'jeep', 'jelly', 'jenny', 'jerk', 'jerky', 'jerry', 'jess', 'jest', 'jet', 'jewel', 'jibe', 'jiffy', 'jig', 'jilt', 'jimmy', 'jinx', 'jive', 'job', 'jock', 'joey', 'jog', 'join', 'joint', 'joke', 'jolly', 'jolt', 'joss', 'jot', 'joule', 'joust', 'jowl', 'jowly', 'joy', "j's", 'judge', 'judo', 'jug', 'juice', 'juicy', 'juju', 'juke', 'julep', 'jumbo', 'jump', 'jumpy', 'junco', 'junk', 'junky', 'junta', 'jure', 'juror', 'jury', 'just', 'jut', 'jute', 'k', 'kale', 'kapok', 'kappa', 'karma', 'kava', 'kayo', 'kazoo', 'keel', 'keen', 'keep', 'keg', 'kelly', 'kelp', 'ken', 'keno', 'kept', 'kern', 'kerry', 'ketch', 'keto', 'key', 'khaki', 'khan', 'kick', 'kid', 'kill', 'kin', 'kind', 'king', 'kink', 'kinky', 'kiosk', 'kirk', 'kiss', 'kit', 'kite', 'kitty', 'kiva', 'kivu', 'kiwi', 'knack', 'knead', 'knee', 'kneel', 'knelt', 'knew', 'knick', 'knife', 'knit', 'knob', 'knock', 'knoll', 'knot', 'know', 'known', 'knurl', 'koala', 'kodak', 'kola', 'kombu', 'kraft', 'kraut', 'krill', "k's", 'kudo', 'kudzu', 'kulak', 'l', 'la', 'lab', 'label', 'labia', 'lac', 'lace', 'lack', 'lacy', 'lad', 'laden', 'ladle', 'lady', 'lag', 'lager', 'laid', 'lain', 'lair', 'laity', 'lake', 'lakh', 'lam', 'lama', 'lamb', 'lame', 'lamp', 'lance', 'land', 'lane', 'lanky', 'lap', 'lapel', 'lapse', 'larch', 'lard', 'large', 'lark', 'larva', 'lase', 'lash', 'lass', 'lasso', 'last', 'latch', 'late', 'later', 'latex', 'lath', 'lathe', 'latus', 'laud', 'laugh', 'laura', 'lava', 'law', 'lawn', 'lax', 'lay', 'layup', 'laze', 'lazy', 'lea', 'leach', 'lead', 'leaf', 'leafy', 'leak', 'leaky', 'lean', 'leap', 'leapt', 'learn', 'lease', 'leash', 'least', 'leave', 'led', 'ledge', 'lee', 'leech', 'leek', 'leer', 'leery', 'left', 'lefty', 'leg', 'legal', 'leggy', 'lemma', 'lemon', 'lemur', 'lend', 'lens', 'lent', 'leper', 'less', 'lest', 'let', 'levee', 'level', 'lever', 'levy', 'lew', 'lewd', 'lewis', 'liana', 'liar', 'libel', 'lice', 'lick', 'lid', 'lie', 'lien', 'lieu', 'life', 'lift', 'light', 'like', 'liken', 'lilac', 'lilt', 'lily', 'lim', 'limb', 'limbo', 'lime', 'limit', 'limp', 'line', 'linen', 'lingo', 'link', 'lint', 'lion', 'lip', 'lipid', 'lisle', 'lisp', 'list', 'lit', 'lithe', 'live', 'liven', 'livid', 'livre', 'llama', 'lo', 'load', 'loaf', 'loam', 'loamy', 'loan', 'loath', 'lob', 'lobar', 'lobby', 'lobe', 'lobo', 'local', 'loch', 'loci', 'lock', 'locus', 'lodge', 'loess', 'loft', 'lofty', 'log', 'loge', 'logic', 'login', 'loin', 'loll', 'lolly', 'lone', 'long', 'look', 'loom', 'loon', 'loop', 'loose', 'loot', 'lop', 'lope', 'lord', 'lore', 'loris', 'lorry', 'lose', 'loss', 'lossy', 'lost', 'lot', 'lotus', 'loud', 'louse', 'lousy', 'love', 'low', 'lox', 'loy', 'loyal', "l's", 'lucid', 'luck', 'lucky', 'lucre', 'lucy', 'lug', 'luge', 'luger', 'luke', 'lull', 'lulu', 'lumen', 'lump', 'lumpy', 'lunar', 'lunch', 'lung', 'lunge', 'lurch', 'lure', 'lurid', 'lurk', 'lush', 'lust', 'lusty', 'lute', 'lux', 'luxe', 'lycee', 'lye', 'lying', 'lymph', 'lynch', 'lynx', 'lyre', 'lyric', 'm', 'ma', 'macaw', 'mace', 'macho', 'mack', 'macro', 'mad', 'madam', 'made', 'magi', 'magic', 'magma', 'magna', 'maid', 'mail', 'maim', 'main', 'major', 'make', 'male', 'mall', 'malt', 'mambo', 'mamma', 'man', 'mana', 'mane', 'mange', 'mango', 'mangy', 'mania', 'manic', 'manna', 'manor', 'manse', 'many', 'map', 'maple', 'mar', 'march', 'mare', 'maria', 'mark', 'marry', 'marsh', 'mart', 'maser', 'mash', 'mask', 'mason', 'mass', 'mast', 'mat', 'match', 'mate', 'mater', 'math', 'matte', 'maul', 'mauve', 'maw', 'max', 'maxim', 'may', 'maybe', 'mayor', 'mayst', 'maze', 'me', 'mead', 'meal', 'mealy', 'mean', 'meant', 'meat', 'meaty', 'mecum', 'medal', 'media', 'medic', 'meek', 'meet', 'meld', 'melee', 'melon', 'melt', 'memo', 'men', 'mend', 'menu', 'meow', 'mercy', 'mere', 'merge', 'merit', 'merry', 'mesa', 'mesh', 'meson', 'mess', 'messy', 'met', 'metal', 'mete', 'meter', 'metro', 'mew', 'mezzo', 'mi', 'miaow', 'mica', 'mice', 'micro', 'mid', 'midge', 'midst', 'mien', 'miff', 'mig', 'might', 'mike', 'mila', 'milch', 'mild', 'mile', 'milk', 'milky', 'mill', 'milt', 'mimic', 'min', 'mince', 'mind', 'mine', 'mini', 'minim', 'mink', 'minor', 'minot', 'mint', 'minus', 'mire', 'mirth', 'miser', 'miss', 'mist', 'misty', 'mite', 'mitre', 'mitt', 'mix', 'mixup', 'moan', 'moat', 'mob', 'mocha', 'mock', 'modal', 'mode', 'model', 'modem', 'moire', 'moist', 'molal', 'molar', 'mold', 'moldy', 'mole', 'molt', 'mommy', 'monad', 'monel', 'money', 'monic', 'monk', 'monte', 'month', 'moo', 'mooch', 'mood', 'moody', 'moon', 'moor', 'moose', 'moot', 'mop', 'moral', 'more', 'morel', 'morn', 'moron', 'mort', 'moss', 'mossy', 'most', 'mot', 'motel', 'motet', 'moth', 'motif', 'motor', 'motto', 'mould', 'mound', 'mount', 'mourn', 'mouse', 'mousy', 'mouth', 'move', 'movie', 'mow', "m's", 'mu', 'much', 'muck', 'mucus', 'mud', 'muddy', 'muff', 'mug', 'muggy', 'mugho', 'mulch', 'mulct', 'mule', 'mull', 'multi', 'mum', 'mummy', 'munch', 'mung', 'muon', 'mural', 'murk', 'murky', 'murre', 'muse', 'mush', 'mushy', 'music', 'musk', 'musky', 'must', 'musty', 'mute', 'mutt', 'my', 'myel', 'mylar', 'mynah', 'myrrh', 'myth', 'n', 'nab', 'nadir', 'nag', 'naiad', 'nail', 'naive', 'naked', 'name', 'nap', 'nary', 'nasal', 'nasty', 'natal', 'natty', 'naval', 'nave', 'navel', 'navy', 'nawab', 'nay', 'ne', 'near', 'neat', 'neath', 'neck', 'nee', 'need', 'needy', 'neigh', 'neo', 'neon', 'nerve', 'nest', 'net', 'never', 'new', 'newel', 'newt', 'next', 'nib', 'nice', 'niche', 'nick', 'niece', 'nifty', 'nigh', 'night', 'nil', 'nine', 'ninth', 'nip', 'nit', 'nitty', 'no', 'nob', 'noble', 'nod', 'nodal', 'node', 'noise', 'noisy', 'nolo', 'nomad', 'non', 'nonce', 'none', 'nook', 'noon', 'noose', 'nor', 'norm', 'north', 'nose', 'nosy', 'not', 'notch', 'note', 'noun', 'nova', 'novae', 'novel', 'novo', 'now', 'nroff', "n's", 'nu', 'nude', 'nudge', 'null', 'numb', 'nun', 'nurse', 'nut', 'nylon', 'nymph', 'o', 'oaf', 'oak', 'oaken', 'oar', 'oases', 'oasis', 'oat', 'oath', 'obese', 'obey', 'objet', 'oboe', 'occur', 'ocean', 'octal', 'octet', 'odd', 'ode', 'odium', "o'er", 'of', 'off', 'offal', 'offer', 'oft', 'often', 'ogle', 'ogre', 'oh', 'ohm', 'ohmic', 'oil', 'oily', 'oint', 'okapi', 'okay', 'okra', 'old', 'olden', 'oldy', 'olive', 'omega', 'omen', 'omit', 'on', 'once', 'one', 'onion', 'only', 'onset', 'onto', 'onus', 'onyx', 'ooze', 'opal', 'open', 'opera', 'opium', 'opt', 'optic', 'opus', 'or', 'oral', 'orate', 'orb', 'orbit', 'order', 'ore', 'organ', 'orgy', "o's", 'osier', 'other', 'otter', 'ouch', 'ought', 'ounce', 'our', 'oust', 'out', 'ouvre', 'ouzel', 'ouzo', 'ova', 'oval', 'ovary', 'ovate', 'oven', 'over', 'overt', 'ovum', 'ow', 'owe', 'owl', 'owlet', 'owly', 'own', 'ox', 'oxbow', 'oxen', 'oxeye', 'oxide', 'ozone', 'p', 'pa', 'pace', 'pack', 'pact', 'pad', 'paddy', 'padre', 'paean', 'pagan', 'page', 'paid', 'pail', 'pain', 'paint', 'pair', 'pal', 'pale', 'pall', 'palm', 'palp', 'palsy', 'pampa', 'pan', 'panda', 'pane', 'panel', 'pang', 'panic', 'pansy', 'pant', 'panty', 'pap', 'papa', 'papal', 'papaw', 'paper', 'pappy', 'par', 'parch', 'pare', 'park', 'parka', 'parry', 'parse', 'part', 'party', 'pasha', 'pass', 'passe', 'past', 'paste', 'pasty', 'pat', 'patch', 'pate', 'pater', 'path', 'patio', 'patty', 'pause', 'pave', 'paw', 'pawn', 'pax', 'pay', 'pea', 'peace', 'peach', 'peak', 'peaky', 'peal', 'pear', 'pearl', 'peat', 'pecan', 'peck', 'pedal', 'pee', 'peek', 'peel', 'peep', 'peepy', 'peer', 'peg', 'pelt', 'pen', 'penal', 'pence', 'pend', 'penis', 'penna', 'penny', 'pent', 'peon', 'peony', 'pep', 'peppy', 'per', 'perch', 'peril', 'perk', 'perky', 'pert', 'pest', 'peste', 'pet', 'petal', 'peter', 'petit', 'petri', 'petty', 'pew', 'pewee', 'phage', 'phase', 'phi', 'phlox', 'phon', 'phone', 'phony', 'photo', 'phyla', 'pi', 'piano', 'pica', 'pick', 'picky', 'pie', 'piece', 'pier', 'piety', 'pig', 'piggy', 'pike', 'pile', 'pill', 'pilot', 'pimp', 'pin', 'pinch', 'pine', 'ping', 'pink', 'pint', 'pinto', 'pion', 'pious', 'pip', 'pipe', 'pique', 'piss', 'pit', 'pitch', 'pith', 'pithy', 'pity', 'pivot', 'pixel', 'pixy', 'pizza', 'place', 'plaid', 'plain', 'plait', 'plan', 'plane', 'plank', 'plant', 'plasm', 'plat', 'plate', 'play', 'playa', 'plaza', 'plea', 'plead', 'pleat', 'plod', 'plop', 'plot', 'plow', 'ploy', 'pluck', 'plug', 'plum', 'plumb', 'plume', 'plump', 'plunk', 'plus', 'plush', 'ply', 'poach', 'pod', 'podge', 'podia', 'poem', 'poesy', 'poet', 'pogo', 'poi', 'point', 'poise', 'poke', 'pol', 'polar', 'pole', 'polio', 'polis', 'polka', 'poll', 'polo', 'pomp', 'pond', 'pong', 'pont', 'pony', 'pooch', 'pooh', 'pool', 'poop', 'poor', 'pop', 'pope', 'poppy', 'porch', 'pore', 'pork', 'port', 'pose', 'posey', 'posh', 'posit', 'posse', 'post', 'posy', 'pot', 'pouch', 'pound', 'pour', 'pout', 'pow', 'power', 'ppm', 'pram', 'prank', 'pray', 'pre', 'preen', 'prep', 'press', 'prexy', 'prey', 'price', 'prick', 'pride', 'prig', 'prim', 'prima', 'prime', 'primp', 'print', 'prior', 'prism', 'privy', 'prize', 'pro', 'probe', 'prod', 'prom', 'prone', 'prong', 'proof', 'prop', 'prose', 'proto', 'proud', 'prove', 'prow', 'prowl', 'proxy', 'prude', 'prune', 'pry', "p's", 'psalm', 'psi', 'psych', 'pub', 'puck', 'puff', 'puffy', 'pug', 'puke', 'pull', 'pulp', 'pulse', 'puma', 'pump', 'pun', 'punch', 'punk', 'punky', 'punt', 'puny', 'pup', 'pupa', 'pupae', 'pupal', 'pupil', 'puppy', 'pure', 'puree', 'purge', 'purl', 'purr', 'purse', 'pus', 'push', 'pushy', 'pussy', 'put', 'putt', 'putty', 'pygmy', 'pyre', 'q', "q's", 'qua', 'quack', 'quad', 'quaff', 'quail', 'quake', 'qualm', 'quark', 'quart', 'quash', 'quasi', 'quay', 'queen', 'queer', 'quell', 'quern', 'query', 'quest', 'queue', 'quick', 'quid', 'quiet', 'quill', 'quilt', 'quint', 'quip', 'quirk', 'quirt', 'quit', 'quite', 'quiz', 'quo', 'quod', 'quota', 'quote', 'r', 'rabat', 'rabbi', 'rabid', 'race', 'rack', 'racy', 'radar', 'radii', 'radio', 'radix', 'radon', 'raft', 'rag', 'rage', 'raid', 'rail', 'rain', 'rainy', 'raise', 'raj', 'rajah', 'rake', 'rally', 'ram', 'ramp', 'ran', 'ranch', 'randy', 'rang', 'range', 'rangy', 'rank', 'rant', 'rap', 'rape', 'rapid', 'rapt', 'rare', 'rasa', 'rash', 'rasp', 'rat', 'rata', 'rate', 'rater', 'ratio', 'rave', 'ravel', 'raven', 'raw', 'ray', 'raze', 'razor', 're', 'reach', 'read', 'ready', 'real', 'realm', 'ream', 'reap', 'rear', 'reave', 'reb', 'rebel', 'reck', 'red', 'reed', 'reedy', 'reef', 'reek', 'reel', 'refer', 'regal', 'reign', 'rein', 'relic', 'remit', 'renal', 'rend', 'rent', 'rep', 'repel', 'rest', 'ret', 'retch', 'rev', 'revel', 'rever', 'rheum', 'rhino', 'rho', 'rhyme', 'rib', 'rice', 'rich', 'rick', 'rid', 'ride', 'ridge', 'rife', 'rifle', 'rift', 'rig', 'right', 'rigid', 'rill', 'rilly', 'rim', 'rime', 'rimy', 'ring', 'rink', 'rinse', 'riot', 'rip', 'ripe', 'ripen', 'rise', 'risen', 'risk', 'risky', 'rite', 'rival', 'riven', 'river', 'rivet', 'roach', 'road', 'roam', 'roar', 'roast', 'rob', 'robe', 'robin', 'robot', 'rock', 'rocky', 'rod', 'rode', 'rodeo', 'roe', 'rogue', 'roil', 'role', 'roll', 'romp', 'rondo', 'rood', 'roof', 'rook', 'rooky', 'room', 'roomy', 'roost', 'root', 'rope', 'ropy', 'rose', 'rosy', 'rot', 'rote', 'rotor', 'rouge', 'rough', 'round', 'rouse', 'rout', 'route', 'rove', 'row', 'rowdy', 'royal', "r's", 'rub', 'ruby', 'ruddy', 'rude', 'rue', 'rug', 'ruin', 'rule', 'rum', 'rumen', 'rummy', 'rump', 'run', 'rune', 'rung', 'runic', 'runny', 'runt', 'runty', 'rupee', 'rural', 'ruse', 'rush', 'rusk', 'rust', 'rusty', 'rut', 'rutty', 'rye', 's', 'sa', 'sable', 'sabra', 'sac', 'sack', 'sad', 'safe', 'sag', 'saga', 'sage', 'sago', 'said', 'sail', 'saint', 'sake', 'salad', 'sale', 'sally', 'salon', 'salt', 'salty', 'salve', 'salvo', 'samba', 'same', 'sand', 'sandy', 'sane', 'sang', 'sank', 'sans', 'sap', 'sappy', 'sari', 'sash', 'sat', 'satan', 'satin', 'satyr', 'sauce', 'saucy', 'sauna', 'saute', 'save', 'savoy', 'savvy', 'saw', 'sax', 'say', 'scab', 'scad', 'scald', 'scale', 'scalp', 'scaly', 'scam', 'scamp', 'scan', 'scant', 'scar', 'scare', 'scarf', 'scarp', 'scary', 'scat', 'scaup', 'scene', 'scent', 'scion', 'scoff', 'scold', 'scoop', 'scoot', 'scope', 'scops', 'score', 'scorn', 'scour', 'scout', 'scowl', 'scram', 'scrap', 'screw', 'scrim', 'scrub', 'scuba', 'scud', 'scuff', 'scull', 'scum', 'sea', 'seal', 'seam', 'seamy', 'sear', 'seat', 'sec', 'sect', 'sedan', 'seder', 'sedge', 'see', 'seed', 'seedy', 'seek', 'seem', 'seen', 'seep', 'seize', 'self', 'sell', 'semi', 'sen', 'send', 'senor', 'sense', 'sent', 'sepal', 'sepia', 'sept', 'septa', 'seq', 'sera', 'serf', 'serge', 'serif', 'serum', 'serve', 'servo', 'set', 'setup', 'seven', 'sever', 'sew', 'sewn', 'sex', 'sexy', 'shack', 'shad', 'shade', 'shady', 'shaft', 'shag', 'shah', 'shake', 'shako', 'shaky', 'shale', 'shall', 'sham', 'shame', 'shank', 'shape', 'shard', 'share', 'shark', 'sharp', 'shave', 'shaw', 'shawl', 'shay', 'she', 'sheaf', 'shear', "she'd", 'shed', 'sheen', 'sheep', 'sheer', 'sheet', 'sheik', 'shelf', 'shell', 'shift', 'shill', 'shim', 'shin', 'shine', 'shiny', 'ship', 'shire', 'shirk', 'shirt', 'shish', 'shiv', 'shoal', 'shock', 'shod', 'shoe', 'shoji', 'shone', 'shoo', 'shook', 'shoot', 'shop', 'shore', 'short', 'shot', 'shout', 'shove', 'show', 'shown', 'showy', 'shred', 'shrew', 'shrub', 'shrug', 'shuck', 'shun', 'shunt', 'shut', 'shy', 'shyly', 'sial', 'sib', 'sibyl', 'sic', 'sick', 'side', 'sidle', 'siege', 'sieve', 'sift', 'sigh', 'sight', 'sigma', 'sign', 'silk', 'silky', 'sill', 'silly', 'silo', 'silt', 'silty', 'sima', 'sin', 'since', 'sine', 'sinew', 'sing', 'singe', 'sinh', 'sink', 'sinus', 'sip', 'sir', 'sire', 'siren', 'sis', 'sisal', 'sit', 'site', 'situ', 'situs', 'siva', 'six', 'sixth', 'sixty', 'size', 'skat', 'skate', 'skeet', 'skein', 'skew', 'ski', 'skid', 'skiff', 'skill', 'skim', 'skimp', 'skin', 'skip', 'skirt', 'skit', 'skulk', 'skull', 'skunk', 'sky', 'slab', 'slack', 'slag', 'slain', 'slake', 'slam', 'slang', 'slant', 'slap', 'slash', 'slat', 'slate', 'slave', 'slay', 'sled', 'sleek', 'sleep', 'sleet', 'slept', 'slew', 'slice', 'slick', 'slid', 'slide', 'slim', 'slime', 'slimy', 'sling', 'slink', 'slip', 'slit', 'slob', 'sloe', 'slog', 'sloop', 'slop', 'slope', 'slosh', 'slot', 'sloth', 'slow', 'slug', 'slum', 'slump', 'slung', 'slunk', 'slur', 'slurp', 'slush', 'sly', 'smack', 'small', 'smart', 'smash', 'smear', 'smell', 'smelt', 'smile', 'smirk', 'smite', 'smith', 'smog', 'smoke', 'smoky', 'smote', 'smug', 'smut', 'snack', 'snafu', 'snag', 'snail', 'snake', 'snap', 'snare', 'snark', 'snarl', 'sneak', 'sneer', 'snell', 'snick', 'sniff', 'snip', 'snipe', 'snob', 'snook', 'snoop', 'snore', 'snort', 'snout', 'snow', 'snowy', 'snub', 'snuff', 'snug', 'so', 'soak', 'soap', 'soapy', 'soar', 'sob', 'sober', 'sock', 'sod', 'soda', 'sofa', 'soft', 'soggy', 'soil', 'solar', 'sold', 'sole', 'solid', 'solo', 'solve', 'soma', 'somal', 'some', 'son', 'sonar', 'song', 'sonic', 'sonny', 'soon', 'soot', 'sooth', 'sop', 'sora', 'sorb', 'sore', 'sorry', 'sort', 'sou', 'sough', 'soul', 'sound', 'soup', 'soupy', 'sour', 'south', 'sow', 'sown', 'soy', 'soya', 'spa', 'space', 'spade', 'span', 'spar', 'spare', 'spark', 'spasm', 'spat', 'spate', 'spawn', 'spay', 'speak', 'spear', 'spec', 'speck', 'sped', 'speed', 'spell', 'spend', 'spent', 'sperm', 'spew', 'spice', 'spicy', 'spike', 'spiky', 'spill', 'spilt', 'spin', 'spine', 'spiny', 'spire', 'spit', 'spite', 'spitz', 'splat', 'splay', 'split', 'spoil', 'spoke', 'spoof', 'spook', 'spool', 'spoon', 'spore', 'sport', 'spot', 'spout', 'spray', 'spree', 'sprig', 'sprue', 'spud', 'spume', 'spun', 'spunk', 'spur', 'spurn', 'spurt', 'spy', 'squad', 'squat', 'squaw', 'squid', "s's", 'stab', 'stack', 'staff', 'stag', 'stage', 'stagy', 'staid', 'stain', 'stair', 'stake', 'stale', 'stalk', 'stall', 'stamp', 'stand', 'stank', 'staph', 'star', 'stare', 'stark', 'start', 'stash', 'state', 'stave', 'stay', 'stead', 'steak', 'steal', 'steam', 'steed', 'steel', 'steep', 'steer', 'stein', 'stem', 'step', 'stern', 'stew', 'stick', 'stiff', 'stile', 'still', 'stilt', 'sting', 'stink', 'stint', 'stir', 'stoat', 'stock', 'stoic', 'stoke', 'stole', 'stomp', 'stone', 'stony', 'stood', 'stool', 'stoop', 'stop', 'store', 'stork', 'storm', 'story', 'stout', 'stove', 'stow', 'strap', 'straw', 'stray', 'strip', 'strop', 'strum', 'strut', 'stub', 'stuck', 'stud', 'study', 'stuff', 'stump', 'stun', 'stung', 'stunk', 'stunt', 'stupa', 'style', 'styli', 'suave', 'sub', 'such', 'suck', 'sud', 'suds', 'sue', 'suet', 'suey', 'sugar', 'suit', 'suite', 'sulfa', 'sulk', 'sulky', 'sully', 'sum', 'sumac', 'sun', 'sung', 'sunk', 'sunny', 'sup', 'super', 'supra', 'surah', 'sure', 'surf', 'surge', 'surly', 'sushi', 'swab', 'swag', 'swain', 'swam', 'swami', 'swamp', 'swan', 'swank', 'swap', 'swarm', 'swart', 'swat', 'swath', 'sway', 'swear', 'sweat', 'sweep', 'sweet', 'swell', 'swelt', 'swept', 'swift', 'swig', 'swill', 'swim', 'swine', 'swing', 'swipe', 'swirl', 'swish', 'swiss', 'swoop', 'sword', 'swore', 'sworn', 'swum', 'swung', 'synod', 'syrup', 't', 'tab', 'table', 'taboo', 'tabu', 'tacit', 'tack', 'tacky', 'tact', 'tad', 'taffy', 'taft', 'tag', 'taiga', 'tail', 'taint', 'take', 'taken', 'talc', 'tale', 'talk', 'talky', 'tall', 'tally', 'talon', 'talus', 'tam', 'tame', 'tamp', 'tan', 'tang', 'tango', 'tangy', 'tanh', 'tank', 'tansy', 'tao', 'tap', 'tapa', 'tape', 'taper', 'tapir', 'tapis', 'tappa', 'tar', 'tara', 'tardy', 'taro', 'tarry', 'tart', 'task', 'taste', 'tasty', 'tat', 'tate', 'tater', 'tatty', 'tau', 'taunt', 'taut', 'tawny', 'tax', 'taxa', 'taxi', 'taxon', 'tea', 'teach', 'teak', 'teal', 'team', 'tear', 'tease', 'teat', 'tech', 'tecum', 'tee', 'teem', 'teen', 'teet', 'teeth', 'tell', 'tempo', 'tempt', 'ten', 'tend', 'tenet', 'tenon', 'tenor', 'tense', 'tent', 'tenth', 'tepee', 'tepid', 'term', 'tern', 'terry', 'terse', 'test', 'testy', 'tete', 'text', 'than', 'thank', 'that', 'thaw', 'the', 'thee', 'theft', 'their', 'them', 'theme', 'then', 'there', 'these', 'theta', 'they', 'thick', 'thief', 'thigh', 'thin', 'thine', 'thing', 'think', 'third', 'this', 'thong', 'thorn', 'those', 'thou', 'three', 'threw', 'throb', 'throw', 'thrum', 'thud', 'thug', 'thumb', 'thump', 'thus', 'thy', 'thyme', 'ti', 'tibet', 'tibia', 'tic', 'tick', 'tid', 'tidal', 'tide', 'tidy', 'tie', 'tier', 'tift', 'tiger', 'tight', 'til', 'tilde', 'tile', 'till', 'tilt', 'tilth', 'time', 'timid', 'tin', 'tine', 'tinge', 'tinny', 'tint', 'tiny', 'tip', 'tippy', 'tipsy', 'tire', 'tit', 'tithe', 'title', 'tizzy', 'to', 'toad', 'toady', 'toast', 'today', 'toddy', 'toe', 'tofu', 'tog', 'togs', 'toil', 'token', 'told', 'toll', 'tomb', 'tome', 'tommy', 'ton', 'tonal', 'tone', 'tong', 'tonic', 'tonk', 'tony', 'too', 'took', 'tool', 'toot', 'tooth', 'top', 'topaz', 'topic', 'tor', 'torah', 'torch', 'tore', 'tori', 'torn', 'torr', 'torso', 'tort', 'torus', 'tory', 'toss', 'tot', 'total', 'tote', 'totem', 'toto', 'touch', 'tough', 'tour', 'tout', 'tow', 'towel', 'tower', 'town', 'toxic', 'toxin', 'toy', 'trace', 'track', 'tract', 'trade', 'trag', 'trail', 'train', 'trait', 'tram', 'tramp', 'trans', 'trap', 'trash', 'trawl', 'tray', 'tread', 'treat', 'tree', 'trek', 'trend', 'tress', 'triad', 'trial', 'tribe', 'trick', 'trig', 'trill', 'trim', 'trio', 'trip', 'tripe', 'trite', 'trod', 'troff', 'troll', 'troop', 'trot', 'trout', 'troy', 'truce', 'truck', 'true', 'truly', 'trump', 'trunk', 'truss', 'trust', 'truth', 'try', "t's", 'tsar', 'tset', 'tty', 'tub', 'tuba', 'tube', 'tuck', 'tuff', 'tuft', 'tug', 'tulip', 'tulle', 'tum', 'tun', 'tuna', 'tune', 'tung', 'tunic', 'tuple', 'turf', 'turk', 'turn', 'turvy', 'tusk', 'tutor', 'tutu', 'twain', 'tweak', 'tweed', 'twice', 'twig', 'twill', 'twin', 'twine', 'twirl', 'twist', 'twit', 'two', 'tying', 'tyke', 'type', 'typic', 'typo', 'u', 'ugh', 'ugly', 'ulcer', 'ulna', 'ultra', 'umber', 'umbra', 'un', 'unary', 'uncle', 'under', 'unify', 'union', 'unit', 'unite', 'unity', 'until', 'up', 'upend', 'upon', 'upset', 'urban', 'urea', 'urge', 'urine', 'urn', "u's", 'us', 'usage', 'use', 'usher', 'usual', 'usurp', 'usury', 'utile', 'utter', 'v', 'vacua', 'vacuo', 'vade', 'vague', 'vain', 'vale', 'valet', 'valid', 'value', 'valve', 'vamp', 'van', 'vane', 'vary', 'vase', 'vast', 'vat', 'vault', 'veal', 'vee', 'veer', 'veery', 'veil', 'vein', 'velar', 'veldt', 'venal', 'vend', 'venom', 'vent', 'verb', 'verge', 'versa', 'verse', 'verve', 'very', 'vest', 'vet', 'vetch', 'veto', 'vex', 'vi', 'via', 'vial', 'vicar', 'vice', 'video', 'vie', 'view', 'vigil', 'vii', 'viii', 'vile', 'villa', 'vine', 'vinyl', 'viola', 'viper', 'viral', 'virus', 'visa', 'vise', 'visit', 'visor', 'vista', 'vita', 'vitae', 'vital', 'vitro', 'viva', 'vivid', 'vivo', 'vixen', 'viz', 'vocal', 'vodka', 'vogue', 'voice', 'void', 'vole', 'volt', 'vomit', 'von', 'vote', 'vouch', 'vow', 'vowel', "v's", 'vs', 'vying', 'w', 'wack', 'wacke', 'wacky', 'wad', 'wade', 'wadi', 'wafer', 'wag', 'wage', 'wah', 'wail', 'waist', 'wait', 'waive', 'wake', 'waken', 'wale', 'walk', 'wall', 'walla', 'wally', 'waltz', 'wan', 'wand', 'wane', 'want', 'war', 'ward', 'ware', 'warm', 'warn', 'warp', 'wart', 'warty', 'wary', 'was', 'wash', 'washy', 'wasp', 'wast', 'waste', 'watch', 'water', 'watt', 'wave', 'wavy', 'wax', 'waxen', 'waxy', 'way', 'we', 'weak', 'weal', 'wean', 'wear', 'weary', 'weave', 'web', 'weber', "we'd", 'wed', 'wedge', 'wee', 'weed', 'weedy', 'week', 'weep', 'weigh', 'weir', 'weird', 'weld', "we'll", 'well', 'welsh', 'welt', 'went', 'wept', "we're", 'were', 'wert', 'west', 'wet', "we've", 'whack', 'whale', 'wham', 'wharf', 'what', 'wheat', 'whee', 'wheel', 'whelk', 'whelm', 'whelp', 'when', 'where', 'whet', 'whey', 'which', 'whiff', 'whig', 'while', 'whim', 'whine', 'whip', 'whir', 'whirl', 'whisk', 'whit', 'white', 'whiz', 'who', 'whoa', "who'd", 'whole', 'whom', 'whoop', 'whop', 'whore', 'whorl', 'whose', 'whup', 'why', 'wick', 'wide', 'widen', 'widow', 'width', 'wield', 'wife', 'wig', 'wild', 'wile', 'will', 'wilt', 'wily', 'win', 'wince', 'winch', 'wind', 'windy', 'wine', 'wing', 'wink', 'wino', 'winy', 'wipe', 'wire', 'wiry', 'wise', 'wish', 'wishy', 'wisp', 'wispy', 'wit', 'witch', 'with', 'withe', 'withy', 'witty', 'wive', 'woe', 'wok', 'woke', 'wold', 'wolf', 'wolve', 'woman', 'womb', 'women', 'won', "won't", 'wont', 'woo', 'wood', 'woody', 'wool', 'wop', 'word', 'wordy', 'wore', 'work', 'world', 'worm', 'wormy', 'worn', 'worry', 'worse', 'worst', 'worth', 'would', 'wound', 'wove', 'woven', 'wow', 'wrack', 'wrap', 'wrath', 'wreak', 'wreck', 'wren', 'wrest', 'wring', 'wrist', 'writ', 'write', 'wrong', 'wrote', 'wry', "w's", 'wynn', 'x', 'xenon', 'xerox', 'xi', "x's", 'xylem', 'y', 'yacht', 'yah', 'yak', 'yam', 'yang', 'yank', 'yap', 'yard', 'yarn', 'yaw', 'yawl', 'yawn', 'ye', 'yea', 'yeah', 'year', 'yearn', 'yeast', 'yell', 'yelp', 'yen', 'yet', 'yew', 'yield', 'yin', 'yip', 'yodel', 'yoga', 'yogi', 'yoke', 'yokel', 'yolk', 'yon', 'yond', 'yore', 'you', "you'd", 'young', 'your', 'youth', 'yow', "y's", 'yucca', 'yuck', 'yuh', 'yule', 'z', 'zag', 'zap', 'zazen', 'zeal', 'zebra', 'zero', 'zest', 'zesty', 'zeta', 'zig', 'zilch', 'zinc', 'zing', 'zip', 'zloty', 'zone', 'zoo', 'zoom', "z's"]
