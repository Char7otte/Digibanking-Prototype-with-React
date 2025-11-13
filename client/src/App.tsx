import { useState, useEffect } from "react";
import axios from "axios";
import LoginComponent from "./LoginComponent/LoginComponent";

function App() {
    return (
        <>
            <LoginComponent />
        </>
    );

    // const [data, setData] = useState([]);
    // useEffect(() => {
    //     (async () => {
    //         const data = await fetchAPI();
    //         setData(data);
    //     })();
    // }, []);
    // async function fetchAPI() {
    //     const res = await axios.get("http://localhost:8080");
    //     console.log(res.data.fruits);
    //     return res.data.fruits;
    // }
    // return (
    //     <>
    //         <ul>
    //             {data.map((d, i) => {
    //                 return <li key={i}>{d}</li>;
    //             })}
    //         </ul>
    //     </>
    // );
}

export default App;
