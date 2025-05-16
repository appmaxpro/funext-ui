import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
//import ReactDOM from 'react-dom';
/*
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);*/

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <App />
);
