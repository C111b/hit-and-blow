import { useEffect, useState, useContext } from "react";
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
  Divider,
  Paper,
  useTheme,
  AppBar,
  IconButton,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";

//theming
import { ColorModeContext } from "./ColorModeContextProvider.js";

//icons
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

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
//DONE - functionality for choosing which empty slot to add color to
//DONE - functionality for showing answer after finish -> add a transition animation

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

//replaces an empty or clicked string with color
const replace = (userseq, color) => {
  //first check if userseq includes ""
  //if it does then get index of ""
  //then splice that index, with 1 element, with the color
  // return userseq.includes("") ? userseq.splice(userseq.indexOf(""), 1, color) : null
  let temp = [...userseq];
  if (temp.includes("clicked")) {
    temp.splice(temp.indexOf("clicked"), 1, color);
    return temp;
  } else if (temp.includes("")) {
    temp.splice(temp.indexOf(""), 1, color);
    return temp;
  }
  return temp;
};

//function that replaces a colored button with an empty sting ""
const empty = (userseq, i) => {
  //splice the index, 1 item, ""
  let temp = [...userseq];
  temp.splice(i, 1, "");
  return temp;
};

//function that replaces an empty "" button with a "clicked" button
// *new , make it so that if there is already a prior "clicked", delete it
const clicked = (userseq, i) => {
  //splice the index, 1 item, ""
  let temp = [...userseq];
  temp.splice(i, 1, "clicked");
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

  //context
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  // progressive after turn > 0
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState([]);
  const [score, setScore] = useState([]);

  // for MUI
  const [ncolors, setNColors] = useState(6);
  // help
  const [help, setHelp] = useState(true);

  //vars for functions
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
    setHistory(temp);
  };

  //updates result history
  const updateResults = () => {
    let temp = [...results];
    // temp.push([]);
    temp.push(resultsToArray(hits, blows, slots));
    setResults(temp);
  };

  //for error with slots and colors
  useEffect(() => {
    // return (slots > colors.length ? setSlots(ncolors) : null);
    if (slots > ncolors && !hasdupe ? setSlots(ncolors) : null);
    // eslint-disable-next-line
  }, [ncolors, hasdupe]);

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
          className={colors[i] + " circle"}
          //on click set that button's color to repplace a blank "" element of userseq
          onClick={() =>
            userseq.includes("")
              ? setUserSeq(replace(userseq, colors[i]))
              : userseq.includes("clicked")
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


  const handleUserButtonsClick = (userseq, i) => {
    if (userseq[i] === "" && !userseq.includes("clicked")) {
      return setUserSeq(clicked(userseq,i));
    } else if (userseq[i] === "") {
      return setUserSeq(clicked(empty(userseq, userseq.indexOf("clicked")), i));
    } else {return setUserSeq(empty(userseq, i));}
  }

  //sets user buttons
  const userButtons = () => {
    let buttons = [];
    for (let i = 0; i < userseq.length; i++) {
      buttons.push(
        <button
          className={
            userseq[i] === ""
              ? "empty circle"
              : userseq[i] === "clicked"
              ? "clicked circle"
              : userseq[i] + " circle"
          }
          onClick={() => handleUserButtonsClick(userseq,i)}
          // onClick={() =>
          //   userseq[i] === "" && !userseq.includes("clicked") //and there is no "clicked" in userseq list
          //     ? setUserSeq(clicked(userseq, i))
          //     : userseq[i] === ""
          //     ? setUserSeq(clicked(empty(userseq, userseq.indexOf("clicked")), i)) 
          //     : setUserSeq(empty(userseq, i))
          // }
          key={i}
        >
          {userseq[i] === ""
            ? "empty"
            : userseq[i] === "clicked"
            ? clicked
            : userseq[i]}
        </button>
      );
    }
    return buttons;
  };

  //allows hidden sequence to be visualized
  const revealSeq = (seq) => {
    let temp = [];
    for (let i = 0; i < seq.length; i++) {
      temp.push(
        <div className={seq[i] + " circle"} key={i}>
          seq[i]
        </div>
      );
    }
    return temp;
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

  // for opening help dialog
  const handleHelp = () => {
    return help ? setHelp(false) : setHelp(true);
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar
            sx={{
              // display: "flex",
              justifyContent: "space-between",
            }}
          >
            {/* <Box sx={{ flexGrow: .05 }} /> */}

            <Typography
              color="text.primary"
              component="div"
              // sx={{ flexGrow: 1, textAlign: "center" }}
            >
              Hit and Blow
            </Typography>

            <div>
              <IconButton color="secondary" onClick={handleHelp}>
                <HelpOutlineIcon />
              </IconButton>
              <Dialog
                fullWidth={true}
                maxWidth={"sm"}
                open={help}
                onClose={handleHelp}
              >
                <DialogTitle sx={{ textAlign: "center" }}>
                  How To Play
                </DialogTitle>
                <DialogContent>
                  <DialogContentText
                    sx={{
                      color: "text.primary",
                      textAlign: "center",
                    }}
                  >
                    Guess the correct sequence of colors.
                    <Divider sx={{ m: 2 }}></Divider>
                  </DialogContentText>
                  <DialogContentText
                    sx={{
                      color: "text.primary",
                      fontSize: 18.5,
                      // ml: 5
                    }}
                  >
                    <u>Information</u> <br />
                    <div>
                      Hits are indicated via red pin: <br />
                      <span className="small-circle hit"></span> Occurs when the
                      position of a color matches the sequence. <br /> <br />
                    </div>
                    <div>
                      Blows are indicated via white pin: <br />
                      <span className="small-circle blow"></span> Occurs when a
                      color matches the sequence. <br /> <br />
                    </div>
                    A correct sequence results in all Hits. <br />
                    <div className="box">
                      <div className="small-circle hit"></div>
                      <div className="small-circle hit"></div>
                      <div className="small-circle hit"></div>
                      <div className="small-circle hit"></div>
                    </div>
                  </DialogContentText>
                </DialogContent>
              </Dialog>
              <IconButton
                sx={{ justifyContent: "flex-end", mr: 1 }}
                color="secondary"
                edge="end"
                onClick={colorMode.toggleColorMode}
              >
                {theme.palette.mode === "dark" ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
      </Box>
      <header>
        <Paper
          sx={{
            mt: 5,
            p: 2,
            // maxWidth: "50%"
          }}
        >
          <div className="header-content">
            <FormControlLabel
              className="dupe"
              labelPlacement="start"
              label="Duplicate Colors"
              control={
                <Switch
                  color="secondary"
                  defaultChecked
                  onChange={() =>
                    hasdupe ? setHasDupe(false) : setHasDupe(true)
                  }
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
                      color="secondary"
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
                      sx={{ width: 45 }}
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
                      color="secondary"
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
                      sx={{ width: 45 }}
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
                      color="secondary"
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
                      sx={{ width: 45 }}
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
                  </Grid>
                </Grid>
              </Box>
            </div>
            <Button
              size="medium"
              className="new-game"
              onClick={() => setNewGame(true)}
              variant="contained"
              color="secondary"
            >
              New Game
            </Button>
            {turnstolose - turn !== 0 && !hasWon ? (
              <Divider textAlign="center" className="turns-message">
                <Typography
                  sx={{
                    display: "flex",
                    pb: 0,
                    mt: 3,
                  }}
                >
                  {turnstolose - turn} Turn
                  {turnstolose - turn === 1 ? " left." : "s left."}
                </Typography>
              </Divider>
            ) : !hasWon ? (
              <Divider textAlign="center" className="turns-message">
                <Typography
                  sx={{
                    display: "flex",
                    pb: 0,
                    mt: 3,
                  }}
                >
                  You Lost.
                </Typography>
              </Divider>
            ) : (
              <Divider textAlign="center" className="turns-message">
                <Typography
                  sx={{
                    display: "flex",
                    pb: 0,
                    mt: 3,
                  }}
                >
                  You Won.
                </Typography>
              </Divider>
            )}
          </div>
        </Paper>
      </header>
      <main className="game-board">
        {turn > 0 ? (
          <div className="history">
            <Stack className="boxes" direction="row">
              {results.map((array, i) => (
                <div className="box" key={i}>
                  {array.map((item, j) => (
                    <div className={item + " small-circle"} key={j}>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </Stack>
            <Stack className="columns" direction="row">
              {history.map((array, i) => (
                <div className="column" key={i}>
                  {array.map((item, j) => (
                    <div className={item + " circle"} key={j}>
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
                <div key={i} className={item + " small-circle"}>
                  {item}
                </div>
              ))}
            </div>
            <div className="column user-buttons">{userButtons()}</div>
          </div>
        )}

        {/* Allows answer to be shown after game ends */}
        {hasWon || turnstolose - turn === 0 ? (
          <Divider sx={{ ml: 3 }} orientation="vertical" flexItem></Divider>
        ) : null}
        {hasWon || turnstolose - turn === 0 ? (
          <div className="answer">
            <div className="box">
              {resultsToArray(0, 0, slots).map((item, i) => (
                <div key={i} className={item + " small-circle"}>
                  {item}
                </div>
              ))}
            </div>
            <div className="column">{revealSeq(seq)}</div>
          </div>
        ) : null}
      </main>

      {/* Displays user color choice + submission interface 
      - when game is won, displays winning message
      - when game is lost, displays losing message */}
      {hasWon ? (
        <div className="winning-message">
          Solved in {turn} turn{turn > 1 ? "s." : ". Congrats!"}
        </div>
      ) : turnstolose - turn === 0 ? (
        <div className="losing-message"> Try Again! </div>
      ) : (
        <footer>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              maxWidth: "38rem",
            }}
          >
            <div className="footer-content">
              <div className="color-buttons">{generateButtons()}</div>
              <Button
                sx={{ width: 150 }}
                size="large"
                color="secondary"
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
            </div>
          </Paper>
        </footer>
      )}
      {/* </Paper> */}
    </>
  );
};

export default Game;
