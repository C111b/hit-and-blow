import * as React from "react";
import Game from "./Game.js";
import {
  CssBaseline,
} from "@mui/material";
import { HashRouter, Route, Switch } from "react-router-dom";
import ColorModeContextProvider from "./ColorModeContextProvider.js";
// const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const App= () => {
  return (
    <>
    <HashRouter basename={process.env.PUBLIC_URL}>
      <ColorModeContextProvider>
        <CssBaseline />
        <Game />
      </ColorModeContextProvider>
      </HashRouter>
    </>
  );
}

export default App;
