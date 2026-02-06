// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { App as CapApp } from "@capacitor/app";
import { Dialog } from "@capacitor/dialog";
import Welcome from "./components/Welcome";
import RecipeFinder from "./components/ReciptFinder";


function BackButtonHandler() {
  useEffect(() => {
    const handler = CapApp.addListener("backButton", async () => {
      const { value } = await Dialog.confirm({
        title: "Exit App",
        message: "Are you sure you want to exit?",
        okButtonTitle: "Yes",
        cancelButtonTitle: "No",
      });

      if (value) {
        CapApp.exitApp();
      }
    });

    return () => {
      handler.remove();
    };
  }, []);

  return null;
}

function App() {
  return (
    <Router>
      <BackButtonHandler />

      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<RecipeFinder />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;