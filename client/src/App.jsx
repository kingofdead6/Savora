import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState ,useRef } from "react";
import { App as CapApp } from "@capacitor/app";
import { Dialog } from '@capacitor/dialog';
import RecipeFinder from "./components/chat/ReciptFinder";


function App() {



function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const historyRef = useRef([]);

  useEffect(() => {
    historyRef.current.push(location.pathname);
  }, [location]);

  useEffect(() => {
    const handler = CapApp.addListener("backButton", async () => {
      const currentPath = location.pathname;

      if (historyRef.current.length > 1) {
        historyRef.current.pop(); 
        const previousPath = historyRef.current[historyRef.current.length - 1];
        navigate(previousPath);
        return;
      }

      const { value } = await Dialog.confirm({
        title: "Exit App",
        message: "Are you sure you want to exit the app?",
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
  }, [navigate, location]);

  return null;
}

  return (
    <Router>
       <BackButtonHandler />
      <Routes>
        <Route path="/" element={<RecipeFinder/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;