import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Render immediately — App shows the splash loader while it hydrates persisted
// state, so there's no blank/flashing window. Remove the instant boot dot once
// React has mounted its own splash.
document.getElementById("boot")?.remove();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
