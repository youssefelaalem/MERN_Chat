import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

import RegisterOrLogin from "./Components/RegisterOrLogin/RegisterOrLogin";
import Chat from "./Components/Chat";
import Xicon from "./assets/icons/Xicon";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import ChangePassword from "./Components/ChangePassword/ChangePassword";
import ForgotPassword from "./Components/ForgotPassword/ForgotPassword";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/ChangePassword" element={<ChangePassword />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/user/:selectedUserId" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}
function MainLayout() {
  const { username } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState(null);
  const { selectedUserId } = useParams();

  return (
    <>
      {errorMessage && (
        <div className="absolute right-0 left-0 sm:left-auto m-2 sm:m-8 p-4 bg-red-600 text-white rounded shadow-lg flex gap-2 text-center text-sm sm:text-base">
          <Xicon onClick={() => setErrorMessage(null)} />
          <p className="text-center">{errorMessage}</p>
        </div>
      )}
      {username ? (
        <Chat selectedUserIdFromRoute={selectedUserId} />
      ) : (
        <RegisterOrLogin setErrorMessage={setErrorMessage} />
      )}
    </>
  );
}
