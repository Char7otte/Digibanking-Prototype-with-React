import { StrictMode, createContext } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import "./bootstrap-utilities.css";
import "./regular.css";
import "./index.css";
import Dashboard from "./Pages/Dashboard/Dashboard.tsx";
import Login from "./Pages/Login/Login.tsx";
import Transaction from "./Pages/Transaction/Transaction.tsx";
import NotFound from "./Pages/NotFound/NotFound.tsx";
import { MenuContextProvider } from "./MenuContext.tsx";

// --- 1. Import the Assistants ---
import ChatAssistant from "./Components/ChatAssistant/ChatAssistant.tsx";
import VoiceAssistant from "./Components/VoiceAssistant/VoiceAssistant.tsx"; // <--- ADDED THIS IMPORT

export const UseSimplified = createContext(true);

// --- 2. Update Layout ---
// This acts as a frame: it holds the current page (Outlet) AND the Assistants
const AppLayout = () => {
  return (
    <>
      <Outlet /> {/* Renders the current page (Login, Dashboard, etc.) */}
      <ChatAssistant /> {/* Renders the Chatbot */}
      <VoiceAssistant /> {/* <--- ADDED THIS COMPONENT */}
    </>
  );
};

// --- 3. Router Setup (Unchanged) ---
const router = createBrowserRouter([
    {
        element: <AppLayout />, // Wrap all routes in our Layout
        children: [
            { path: "/", element: <Login /> },
            { path: "/dashboard", element: <Dashboard /> },
            { path: "/transaction", element: <Transaction /> },
            { path: "*", element: <NotFound /> },
        ]
    }
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <MenuContextProvider>
            <RouterProvider router={router} />
        </MenuContextProvider>
    </StrictMode>
);
