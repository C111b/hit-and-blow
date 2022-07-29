import * as React from "react";
import Game from "./Game.js";
import {
  // useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";

// const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

function App() {
  // const ToggleColorMode = () => {
  //   const [mode, setMode] = React.useState("dark");
  //   const colorMode = React.useMemo(
  //     () => ({
  //       toggleColorMode: () => {
  //         setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  //       },
  //     }),
  //     []
  //   );
  // };

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#3f51b5",
      },
      secondary: {
        main: "#f50057",
      },
    },
  });

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Game />
      </ThemeProvider>
    </>
  );
}

export default App;
