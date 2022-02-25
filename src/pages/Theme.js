import React from "react";
import { ThemeProvider } from "styled-components";

const theme = {
    colors: {
      white: "#fff",
      dark: "#000",
      whitebg: "#fff",
      darkbg: "#000"
    },
  }


const Theme = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

export default Theme;
