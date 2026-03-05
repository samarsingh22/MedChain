import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Dashboard from "./Dashboard";
import MatrixRain from "./MatrixRain";
import "./App.css";

function App() {
  return (
    <>
      <MatrixRain />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Dashboard />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;