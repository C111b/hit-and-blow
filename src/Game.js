import { useEffect, useState } from "react";

//Hit and Blow
//DONE - set number of colors
//DONE - set number of slots
//DONE - get a random sequence of colors

//DONE - Figure out how to render historical attempts to view on the screen
//DONE - submit button => takes user sequence outputs resulting hits/blows, "saves" all results onto the screen ... perhaps a separate usestate for results in json
//DONE - sets turns (need for rendering hits/blows for each turn)
// - allows user inputted area to pivot after the historical portion
//DONE - maybe make a turn count, to show you won in x turns

//DONE - state for an array of aggregate results in the format Hits: x Blows: x
// haswon state -> triggers after submission button detects 4 hits

//DONE - user sequence inputs
//DONE - checks if user inputs alligns with sequence
//DONE - output hits: x and  blows: x
//DONE - a way to add and remove items in the user sequence

//for the circles use css set border radius to 100, change div classname
// or maybe emojis
// or maybe images

//generates a list of a specified amount of colors
const generateColor = (num) => {
  let colorlist = [
    "blue",
    "red",
    "green",
    "yellow",
    "purple",
    "white",
    "orange",
    "grey",
    "brown",
  ];
  return colorlist.slice(0, num);
};

//function that generates random string out of colors
const generateSequence = (colors, slots) => {
  let seq = [];
  for (let i = 0; i < slots; i++) {
    //get random index of colors Math.floor(Math.random() * colors.length)
    //output by colors[index]
    //push the color to seq
    seq.push(colors[Math.floor(Math.random() * colors.length)]);
  }
  return seq;
};

//function that checks hits and blows.. returns a list in the form of [hits, blows]
//hits indicate a correct colors at the correct position
//blows indicate a color present in the sequence
const scoreChecker = (seq, userseq) => {
  let tempseq = [...seq];
  let tempuser = [...userseq];
  let hits = 0;
  let blows = 0;

  //must first account for hits in an isolated loop
  for (let i = 0; i < userseq.length; i++) {
    if (tempseq[i] === tempuser[i]) {
      hits++;
      tempseq[i] = ""; //marks of values of both lists
      tempuser[i] = ""; // prevents duplicates detection on either side
    }
  }

  // goes through hit curated lists to then account for blows
  for (let i = 0; i < userseq.length; i++) {
    if (tempuser[i] !== "" && tempseq.includes(tempuser[i])) {
      blows++;
      tempseq[tempseq.indexOf(tempuser[i])] = ""; //prevents duplicate blows, by marking off inclusion
    }
  }
  return [hits, blows];
};

//*maybe separate button from functionality ===> focus on functionality of what happens after onClick
//logs the user sequence array
//logs hits: x blows: y array [x, y]
//make a useEffect to check if has won *do later

// onclick outputs user sequence and hits
// make the divs in the output clasifiable somehow (gap in knowledge)

// const submitResults = (userseq, hits, blows) => {
//   let results = [];
//   results.push(
//     <div className="history">
//       <div className="score">Hits: {hits} Blows: {blows}</div>
//       {userseq.map((item, i) => (
//         <div key={i} className={userseq[i]}>
//           {userseq[i]}
//         </div>
//       ))}
//     </div>
//   );
//   console.log(results);
//   return results;
// };

//function generates a list of blanks (used to create default list for user sequence rendering)
const blanks = (num) => {
  let list = [];
  for (let i = 0; i < num; i++) {
    list.push("");
  }
  return list;
};

//replaces an empty string with color
const replace = (userseq, color) => {
  //first check if userseq includes ""
  //if it does then get index of ""
  //then splice that index, with 1 element, with the color
  // return userseq.includes("") ? userseq.splice(userseq.indexOf(""), 1, color) : null
  let temp = [...userseq];
  if (temp.includes("")) {
    temp.splice(temp.indexOf(""), 1, color);
    return temp;
  }
  return temp; //might not be good, as it outputs the unchanged list, meaning a re render happens... done to make code more readable
};

//function that replaces a colored button with an empty sting ""
const empty = (userseq, i) => {
  //splice the index, 1 item, ""
  let temp = [...userseq];
  temp.splice(i, 1, "");
  return temp;
};

//changes hits and blows to an array of [hit, blow, none] taking precedence with order
// for example : hits: 2 and blows: 1 , with 4 slots produces
//               ["hit","hit", "blow", "none"]
const resultsToArray = (hits, blows, slots) => {
  let temp = [];
  let count = 0;

  if (hits > 0) {
    for (let i = 0; i < hits; i++) {
      temp.push("hit");
      count++;
    }
  }
  if (blows > 0) {
    for (let i = 0; i < blows; i++) {
      temp.push("blow");
      count++;
    }
  }

  for (let i = 0; i < (slots - count); i++) {
    temp.push("none");
  }
  return temp;
};

//function that filters duplicates in sequence (extend for later)

const Game = () => {
  // initializing
  const [colors, setColors] = useState(generateColor(6));
  const [slots, setSlots] = useState(4);
  const [seq, setSeq] = useState(generateSequence(colors, slots));
  const [userseq, setUserSeq] = useState(blanks(slots)); //list of user inputted sequence
  const [newgame, setNewGame] = useState(false);
  const [turn, setTurn] = useState(0);
  const [submit, setSubmit] = useState(false);

  // progressive
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState([]);
  const [score, setScore] = useState([]);

  // const [history, setHistory] = useState([]);
  // const [active, setActive] = useState(false)                //state for if an item is present in user seq

  //create an array for hits and blows that can be indexed by turn
  // manage something with scores on first render 
  // pain in the ass, as hits/blows are interconnected with other functions
  // maybe do not touch hits and blows, and instead have score as an isolated segment used only for the functionality of displaying score history 
   // for some reason it renders 3 times: twice with hits/blows empty and once with the pertinent results
  let hits = scoreChecker(seq,userseq)[0];
  let blows = scoreChecker(seq,userseq)[1];

  //testing
  //Errors?
  // - submisson available when empty user inputs present.. set a limit to only submit if userseq.length === slots

  //updates historic score
  const updateScore = () => {
    let temp = [...score];
    temp.push(scoreChecker(seq,userseq));
    setScore(temp);
  }

  //updates user input history
  const updateHistory = () => {
    let temp = [...history];
    // temp.push([]);
    temp.push(userseq);
    console.log("historic user inputs: ");
    console.log(temp); //*testing
    setHistory(temp);
  };

  //updates result history
  const updateResults = () => {
    let temp = [...results];
    // temp.push([]);
    temp.push(resultsToArray(hits, blows, slots));
    console.log("historic results: ");
    console.log(temp); // *testing
    setResults(temp);
  };


  // - submit button not outputting html elements
  useEffect(() => {
    updateHistory();
    updateResults();
    updateScore();
    setTurn((turn) => turn + 1);
    setUserSeq(blanks(slots));
    // eslint-disable-next-line
  }, [submit]); //above comment removes dependency yelling

  //new game reverts to initial conditions
  // changing any header inputs reverts to ICs
  useEffect(() => {
    setSeq(generateSequence(colors, slots));
    setUserSeq(blanks(slots));
    setNewGame(false);
    setTurn(0);
    setHistory([]);
    setResults([]);
    setScore([]);
  }, [newgame, colors, slots]); //changed for testing... *remember to change back to [newgame,colors,slots] when testing is done


  //function that returns buttons of colors available
  const generateButtons = () => {
    let buttons = [];
    for (let i = 0; i < colors.length; i++) {
      //output buttons with the color name
      buttons.push(
        <button
          className={colors[i]}
          //on click set that button's color to repplace a blank "" element of userseq
          onClick={() =>
            userseq.includes("")
              ? setUserSeq(replace(userseq, colors[i]))
              : null
          }
          key={i}
        >
          {colors[i]}
        </button>
      );
    }
    return buttons;
  };

  //sets user buttons
  const userButtons = () => {
    let buttons = [];
    for (let i = 0; i < userseq.length; i++) {
      buttons.push(
        <button
          className={userseq[i] === "" ? "empty" : userseq[i]}
          onClick={() =>
            userseq[i] === "" ? null : setUserSeq(empty(userseq, i))
          }
          key={i}
        >
          {userseq[i] === "" ? "empty" : userseq[i]}
        </button>
      );
    }
    return buttons;
  };

  return (
    <>
      <header>
        <div>
          <span># of colors: </span>
          <input
            type="text"
            size="1"
            maxLength="1"
            value={colors.length || ""}
            onChange={(e) => {
              setColors(generateColor(parseInt(e.target.value)));
            }}
          />
        </div>
        <div>
          <span># of slots: </span>
          <input
            type="text"
            size="1"
            maxLength="1"
            value={slots || ""}
            onChange={(e) => {
              setSlots(parseInt(e.target.value));
            }}
          />
        </div>
        <button onClick={() => setNewGame(true)}>New Game</button>
      </header>
      <main className="game-board">
        <div>hidden sequence is: {seq}</div>
        <div>user sequence is: {userseq} </div>
        {turn > 0 ? (
          <div className="history">
            <div className="score">
              {score.map((item,i) => (
                <span key={i}>Hits: {item[0]} Blows: {item[1]}</span>
              ))}
            </div>
            <div className="boxes">
              {results.map((array, i) => (
                <div key={i}>
                  {array.map((item, j) => (
                    <div className={item} key={j}>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="columns">
              {history.map((array, i) => (
                <div key={i}>
                  {array.map((item, j) => (
                    <div className={item} key={j}>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="present">
          <div className="boxes">
            {resultsToArray(0, 0, slots).map((item, i) => (
              <div key={i} className={item}>
                {item}
              </div>
            ))}
          </div>
          <div className="columns">{userButtons()}</div>
        </div>
      </main>
      <footer>
        <div>{generateButtons()}</div>
        <button onClick={() => setSubmit(submit === false ? true : false)}>
          Submit
        </button>
      </footer>
    </>
  );
};

export default Game;
