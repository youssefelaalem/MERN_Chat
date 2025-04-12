import PropTypes from "prop-types";
import Logo from "./Logo";
import LogOutIcon from "../assets/icons/LogOutIcon";
import UserIcon from "../assets/icons/UserIcon";
import "../style.css";

const UserHeader = ({ username, onLogout, onLogoClick }) => {
  return (
    <div className="user-header">
      <Logo onClick={onLogoClick} />
      <div className="user-info">
        <div className="user-details">
          <UserIcon />
          <span className="username">{username}</span>
        </div>
        <button onClick={onLogout} title="log out" className="logout-button">
          <LogOutIcon />
        </button>
      </div>
    </div>
  );
};

UserHeader.propTypes = {
  username: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
  onLogoClick: PropTypes.func.isRequired,
};

export default UserHeader;
