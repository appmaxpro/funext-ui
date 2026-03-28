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


document.addEventListener("DOMContentLoaded", () => {
  // Code to run when the DOM is ready
  console.log("DOM is ready!");
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <App />
);
});

/*
if (navigator.serviceWorker) {
    navigator.serviceWorker
        .register("/web/service-worker.js", { scope: "/odoo" })
        .catch((error) => {
            console.error("Service worker registration failed, error:", error);
        });
}
        */