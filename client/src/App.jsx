// import axios from "axios"
import { UserContextProvider } from "./UserContext";
import Routes from "./Routes";

function App() {
// axios.defaults.url ="http://localhost:8080";
// axios.defaults.withCredentials=true;
  return (
    <UserContextProvider>
     <Routes/>
    </UserContextProvider>
  )
}

export default App
