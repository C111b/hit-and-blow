import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// const ColorModeContext = React.createContext();
// const ColorModeUpdateContext = React.createContext();
export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
  mode: "light",
});

//create theme palette
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
        // palette values for light mode
        primary: {main: '#eaf5f3'},
        secondary: {
          main: '#8E9E9D',
          dark: '#505D5B',
          light: '#8B9C96',
          contrastText:'#293232',
        },
        background: {
          default: '#EAF0F3',
          // paper: '#8E9E9D',
          paper: "hsla(176.99999999999994, 14.492753623188415%, 82.94117647058825%, 0.9)",
        },
        text: {
          primary: 'rgba(41,54,52,0.88)',
          disabled: 'rgba(41,54,52,0.38)',
          secondary: '#8E9E9D',
        },
      }
    : {
        // palette values for dark mode
          primary: {
            main: '#505D5B',
            contrastText: '#DDE9DF',
          },
          secondary: {
            main: '#8E9E9D',
            contrastText: 'hsl(152.72727272727272, 10.57692307692308%, 27%)',
          },
          background: {
            default: '#242828',
            paper: '#293232',
          },
          text: {
            primary: '#c2c2c2',
            disabled: 'rgba(41,54,52,0.38)',
            secondary: '#2A3735',
            // secondary: '#293232',
          },
        }),
    },
});

// export function useColorMode() {
//   return useContext(ColorModeContext)
// }
// export function useColorModeUpdate() {
//   return useContext(ColorModeUpdateContext)
// }

const ColorModeContextProvider = ({ children }) => {
  const [mode, setMode] = React.useState('light');
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode])
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode],
  );

  // const theme = createTheme(getDesignTokens(mode));

  // const toggleMode = () => {
  //   setMode( mode === 'light' ? 'dark' : 'light')
  // }
  // // eslint-disable-next-line
  // const colorMode = toggleMode()


  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ColorModeContextProvider;
