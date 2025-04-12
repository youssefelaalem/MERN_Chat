import PropTypes from "prop-types";
import Contact from "./Contact";
import "../style.css";

const UserList = ({ users, selectedUserId, onUserClick, title }) => {
  return (
    <div className="user-list-section">
      <h3 className="user-list-title">{title}</h3>
      <div className="user-list-container">
        {Object.keys(users).map((userId) => (
          <Contact
            key={userId}
            onClick={() => onUserClick(userId)}
            IsSelectedUser={selectedUserId === userId}
            userId={userId}
            username={users[userId]}
            online={title === "Online Users"}
          />
        ))}
      </div>
    </div>
  );
};

UserList.propTypes = {
  users: PropTypes.object.isRequired,
  selectedUserId: PropTypes.any,
  onUserClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default UserList;
