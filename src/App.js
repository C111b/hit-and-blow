import * as React from "react";
import Game from "./Game.js";
import {
  CssBaseline,
} from "@mui/material";

import ColorModeContextProvider from "./ColorModeContextProvider.js";
// const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const App= () => {
  return (
    <>
      <ColorModeContextProvider>
        <CssBaseline />
        <Game />
      </ColorModeContextProvider>
    </>
  );
}

export default App;
