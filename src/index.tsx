import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Pi SDK başlatma
if (typeof window !== "undefined" && window.Pi) {
  window.Pi.init({
  version: "2.0",
  sandbox: process.env.REACT_APP_SANDBOX_SDK === "true",
});
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);