import { useEffect, useState } from "react";
import {
  Stack,
  Switch,
  FormControlLabel,
  Slider,
  Input,
  Typography,
  Grid,
  Box,
  Button,
} from "@mui/material";

import "./App.css";
//Hit and Blow
//DONE - set number of colors
//DONE - set number of slots
//DONE - get a random sequence of colors

//DONE - Figure out how to render historical attempts to view on the screen
//DONE - submit button => takes user sequence outputs resulting hits/blows, "saves" all results onto the screen ... perhaps a separate usestate for results in json
//DONE - sets turns (need for rendering hits/blows for each turn)
//DONE - allows user inputted area to pivot after the historical portion
//DONE - maybe make a turn count, to show you won in x turns
//DONE - function that filters duplicates in sequence (extend for later) with material ui switch
//DONE- functionality for setting #of turns to finish

//DONE - state for an array of aggregate results in the format Hits: x Blows: x
//DONE haswon state -> triggers after submission button detects 4 hits

//DONE - user sequence inputs
//DONE - checks if user inputs alligns with sequence
//DONE - output hits: x and  blows: x
//DONE - a way to add and remove items in the user sequence

//DONEfor the circles use css set border radius to 100, change div classname

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

//generates random string of uniqe colors
const nonDupeSeq = (colors, slots) => {
  let seq = [];
  let temp = [...colors];
  for (let i = 0; i < slots; i++) {
    let index = Math.floor(Math.random() * temp.length);
    seq.push(temp[index]);
    temp.splice(index, 1);
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

  for (let i = 0; i < slots - count; i++) {
    temp.push("none");
  }
  return temp;
};

const Game = () => {
  // initializing

  const [colors, setColors] = useState(generateColor(6));
  const [slots, setSlots] = useState(4);
  const [seq, setSeq] = useState(generateSequence(colors, slots));
  const [userseq, setUserSeq] = useState(blanks(slots)); //list of user inputted sequence
  const [newgame, setNewGame] = useState(false);
  const [turn, setTurn] = useState(0);
  const [turnstolose, setTurnsToLose] = useState(6);
  const [submit, setSubmit] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [hasdupe, setHasDupe] = useState(true);

  // progressive after turn > 0
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState([]);
  const [score, setScore] = useState([]);

  // for MUI
  const [ncolors, setNColors] = useState(6);

  let hits = scoreChecker(seq, userseq)[0];
  let blows = scoreChecker(seq, userseq)[1];

  //updates historic score
  const updateScore = () => {
    let temp = [...score];
    temp.push(scoreChecker(seq, userseq));
    setScore(temp);
  };

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

  //testing
  console.log(seq);


  //for error with slots and colors
  useEffect(() => {
    // return (slots > colors.length ? setSlots(ncolors) : null);
    if ((slots > ncolors && !hasdupe) ? setSlots(ncolors) : null);
  }, [ncolors, hasdupe])

  useEffect(() => {
    updateHistory();
    updateResults();
    updateScore();
    setTurn((turn) => turn + 1);
    setUserSeq(blanks(slots));
    if (hits === slots ? setHasWon(true) : null);
    // eslint-disable-next-line
  }, [submit]); //above comment removes dependency yelling

  //new game reverts to initial conditions
  // changing any header inputs reverts to ICs
  useEffect(() => {
    setUserSeq(blanks(slots));
    setNewGame(false);
    setTurn(0);
    setHistory([]);
    setResults([]);
    setScore([]);
    setHasWon(false);
    return hasdupe
      ? setSeq(generateSequence(colors, slots))
      : setSeq(nonDupeSeq(colors, slots));
  }, [newgame, colors, slots, hasdupe, turnstolose]);

  //for MUI sliders
  useEffect(() => {
    setColors(generateColor(ncolors));
  }, [ncolors]);

  //function that returns buttons of colors available
  const generateButtons = () => {
    let buttons = [];
    for (let i = 0; i < colors.length; i++) {
      //output buttons with the color name
      buttons.push(
        <button
          className={colors[i] + " " + "circle"}
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
          className={
            userseq[i] === ""
              ? "empty" + " " + "circle"
              // : userseq[i] === "clicked" 
              ? "clicked" + " " + "circle"
              : userseq[i] + " " + "circle"
          }
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

  //MUI event handlers and stylers

  // for color slider
  const handleSliderColors = (event, newValue) => {
    setNColors(newValue);
  };

  const handleInputColors = (e) => {
    setNColors(e.target.value === "" ? "" : Number(e.target.value));
  };

  const handleSliderTTL = (event, newValue) => {
    setTurnsToLose(newValue);
  };

  const handleInputTTL = (e) => {
    setTurnsToLose(e.target.value === "" ? "" : Number(e.target.value));
  };

  const handleSliderSlots = (event, newValue) => {
    return hasdupe
      ? setSlots(newValue)
      : newValue > colors.length
      ? null 
      : setSlots(newValue);
  };

  const handleInputSlots = (e) => {
    setSlots(e.target.value === "" ? "" : Number(e.target.value));
  };

  return (
    <>
      <header>
        <FormControlLabel
          className="dupe"
          labelPlacement="start"
          label="Duplicate Colors"
          control={
            <Switch
              defaultChecked
              onChange={() => (hasdupe ? setHasDupe(false) : setHasDupe(true))}
            />
          }
        />
        <div className="sliders">
          <Box sx={{ width: 200 }}>
            <Typography id="color-slider" gutterBottom>
              # COLORS
            </Typography>
            <Grid container spacing={2} alignItems="start">
              <Grid item xs>
                <Slider
                  value={typeof ncolors === "number" ? ncolors : 0}
                  onChange={handleSliderColors}
                  aria-labelledby="colors-slider"
                  defaultValue={6}
                  valueLabelDisplay="auto"
                  min={1}
                  marks
                  max={9}
                />
              </Grid>
              <Grid item>
                <Input
                  sx={{ width: 40 }}
                  value={ncolors}
                  size="small"
                  onChange={handleInputColors}
                  inputProps={{
                    step: 1,
                    min: 1,
                    max: 9,
                    type: "number",
                    "aria-labelledby": "colors-slider",
                  }}
                />
              </Grid>
            </Grid>
            <Typography id="turns-slider" gutterBottom>
              # TURNS
            </Typography>
            <Grid container spacing={2} alignItems="start">
              <Grid item xs>
                <Slider
                  value={typeof turnstolose === "number" ? turnstolose : 0}
                  onChange={handleSliderTTL}
                  aria-labelledby="turns-slider"
                  defaultValue={6}
                  valueLabelDisplay="auto"
                  min={1}
                  marks
                  max={20}
                />
              </Grid>
              <Grid item>
                <Input
                  sx={{ width: 40 }}
                  value={turnstolose}
                  size="small"
                  onChange={handleInputTTL}
                  inputProps={{
                    step: 1,
                    min: 1,
                    max: 20,
                    type: "number",
                    "aria-labelledby": "turns-slider",
                  }}
                />
              </Grid>
            </Grid>
            <Typography id="slots-slider" gutterBottom>
              # SLOTS
            </Typography>
            <Grid container spacing={2} alignItems="start">
              <Grid item xs>
                <Slider
                  value={slots}
                  aria-labelledby="slots-slider"
                  defaultValue={4}
                  valueLabelDisplay="auto"
                  min={1}
                  marks
                  max={!hasdupe ? colors.length : 12} // do something here
                  onChange={handleSliderSlots}
                />
              </Grid>
              <Grid item>
                <Input
                  sx={{ width: 40 }}
                  value={slots}
                  size="small"
                  onChange={handleInputSlots}
                  inputProps={{
                    step: 1,
                    min: 1,
                    max: !hasdupe ? colors.length : 12,
                    type: "number",
                    "aria-labelledby": "slots-slider",
                  }}
                />
                {/* <input
              type="text"
              size="1"
              maxLength="1"
              value={slots || ""}
              onChange={(e) => {
                return hasdupe
                  ? setSlots(parseInt(e.target.value))
                  : parseInt(e.target.value) > colors.length
                  ? null
                  : setSlots(parseInt(e.target.value)); //*maybe write a message that says either decrease #slots or increase #colors
              }}
            /> */}
              </Grid>
            </Grid>
          </Box>
        </div>
        <Button
          size="medium"
          className="new-game"
          onClick={() => setNewGame(true)}
          variant="contained"
        >
          New Game
        </Button>
        { turnstolose - turn !== 0 && !hasWon ? 
          (<div className="turns-message"> {turnstolose - turn} Turn{turnstolose - turn === 1 ? " left." : "s left."}</div>) : null
        }
      </header>
      <main className="game-board">
        {/* <div>hidden sequence is: {seq}</div>
        <div>user sequence is: {userseq} </div> */}
        {/* *testing remember to remove */}
        {turn > 0 ? (
          <div className="history">
            {/* <div className="score">
              {score.map((item, i) => (
                <span key={i}>
                  Hits: {item[0]} Blows: {item[1]}
                </span>
              ))}
            </div> */}
            <Stack
              className="boxes"
              direction="row"
              // sx={{ justify-content: "center"}}
              // justifyContent="center"
              // spacing={2}
            >
              {results.map((array, i) => (
                <div className="box" key={i}>
                  {array.map((item, j) => (
                    <div className={item + " " + "small-circle"} key={j}>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </Stack>
            <Stack
              className="columns"
              direction="row"
              // divider={<Divider orientation="vertical" flexItem />}
              // spacing={3}
            >
              {history.map((array, i) => (
                <div className="column" key={i}>
                  {array.map((item, j) => (
                    <div className={item + " " + "circle"} key={j}>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </Stack>
          </div>
        ) : null}
        {hasWon ? null : turnstolose - turn === 0 ? null : (
          <div className={turn > 0 ? "present" : "starting"}>
            <div className="box">
              {resultsToArray(0, 0, slots).map((item, i) => (
                <div key={i} className={item + " " + "small-circle"}>
                  {item}
                </div>
              ))}
            </div>
            <div className="column user-buttons">{userButtons()}</div>
          </div>
        )}
      </main>
      {hasWon ? (
        <div className="winning-message">
          Solved in {turn} turn{turn > 1 ? "s." : ". Congrats!"}
        </div>
      ) : turnstolose - turn === 0 ? (
        <div className="losing-message"> Try Again! </div>
      ) : (
        <footer>
          <div className="color-buttons">{generateButtons()}</div>
          <Button
            sx={{ width: 100 }}
            size="large"
            className="submit"
            variant="contained"
            onClick={() =>
              userseq.includes("")
                ? null
                : setSubmit(submit === false ? true : false)
            }
          >
            Submit
          </Button>
        </footer>
      )}

      {/* {turnstolose === turn ? (
        <div>you lose</div>
      ) : (
        <footer>
          <div>{generateButtons()}</div>
          <button
            onClick={() =>
              userseq.includes("")
                ? null
                : setSubmit(submit === false ? true : false)
            }
          >
            Submit
          </button>
          <div> {turnstolose - turn} turns left</div>
        </footer>
      )} */}
    </>
  );
};

export default Game;
