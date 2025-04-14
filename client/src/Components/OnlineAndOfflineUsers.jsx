import { useContext } from "react";
import PropTypes from "prop-types";
import Contact from "./Contact";
import "../style.css";
import Logo from "./Logo";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import LogOutIcon from "../assets/icons/LogOutIcon";
import UserIcon from "../assets/icons/UserIcon";
import axiosInstance from "../api/axios";
function OnlineAndOfflineUsers({
  onlinePeopleExclOurUser,
  setSelectedUserName,
  setSelectedUserId,
  selectedUserId,
  offlineUsers,
  setWs,
}) {
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 500;

  // Modify your Contact onClick handler
  const handleContactClick = (userId) => {
    setSelectedUserId(userId);
    setSelectedUserName(
      onlinePeopleExclOurUser[userId] || offlineUsers[userId].username
    );
    if (isMobile) {
      navigate(`/user/${userId}`);
    }
  };

  const { username, id, setId, setUsername } = useContext(UserContext);
  function logOutFun() {
    axiosInstance.post("/logout/").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
      localStorage.removeItem("token"); // Remove token from localStorage
    });
  }
  return (
    <div className="listOfUsers bg-white w-full border-r">
      <Logo
        onClick={() => {
          setSelectedUserId(null);
          setSelectedUserName(null);
          navigate("/");
        }}
      />
      <div className="flex justify-between">
        <div className="flex px-2 py-1 gap-1">
          <UserIcon />
          <p>{username}</p>
        </div>

        <button
          onClick={logOutFun}
          title="log out"
          className="flex items-center h-[30px] p-1 bg-slate-200-700 rounded-lg"
        >
          <LogOutIcon />
        </button>
      </div>
      <div className="sm:h-[80%] lg:h-[88%] relative overflow-y-auto scrolling">
        {Object.keys(onlinePeopleExclOurUser).map((userId) => {
          return (
            <Contact
              key={userId}
              onClick={() => handleContactClick(userId)}
              IsSelectedUser={selectedUserId === userId}
              userId={userId}
              username={onlinePeopleExclOurUser[userId]}
              online={true}
            />
          );
        })}
        {Object.keys(offlineUsers).map((userId) => {
          return (
            <Contact
              key={userId}
              onClick={() => handleContactClick(userId)}
              IsSelectedUser={selectedUserId === userId}
              userId={userId}
              username={offlineUsers[userId].username}
              online={false}
            />
          );
        })}
      </div>
    </div>
  );
}

OnlineAndOfflineUsers.propTypes = {
  setWs: PropTypes.func,
  onlinePeopleExclOurUser: PropTypes.object,
  setSelectedUserId: PropTypes.func,
  setSelectedUserName: PropTypes.func,
  selectedUserId: PropTypes.any,
  offlineUsers: PropTypes.object,
};

export default OnlineAndOfflineUsers;
