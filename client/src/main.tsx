import { StrictMode, createContext } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./bootstrap-utilities.css";
import "./regular.css";
import "./index.css";
import Dashboard from "./Pages/Dashboard/Dashboard.tsx";
import Login from "./Pages/Login/Login.tsx";
import Transaction from "./Pages/Transaction/Transaction.tsx";
import NotFound from "./Pages/NotFound/NotFound.tsx";
import { MenuContextProvider } from "./MenuContext.tsx";
import Demo from "./Pages/Demo/Demo.tsx";  
import DemoTransaction from "./Pages/Demo/Demo.transaction.tsx";

export const UseSimplified = createContext(true);

const router = createBrowserRouter([
    { path: "/", element: <Login /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/transaction", element: <Transaction /> },
    { path: "/demo", element: <Demo /> },
    { path: "/demo/transaction", element: <DemoTransaction /> },
    { path: "*", element: <NotFound /> },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <MenuContextProvider>
            <RouterProvider router={router} />
        </MenuContextProvider>
    </StrictMode>
);
