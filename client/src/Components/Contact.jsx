import PropTypes from "prop-types";
import Avatar from "./Avatar";

function Contact({ userId, onClick, IsSelectedUser, username, online }) {
  return (
    <div
      key={userId}
      onClick={onClick}
      className={
        "border-b border-gray-300 flex items-center gap-2 cursor-pointer " +
        (IsSelectedUser ? "bg-blue-100" : "")
      }
    >
      {IsSelectedUser && (
        <div className="w-1 h-12 bg-blue-600 rounded-r-md"></div>
      )}
      <div className="flex items-center gap-2 py-2 pl-4">
        <Avatar
          key={userId}
          online={online}
          username={username}
          userId={userId}
        />
        <span className="text-gray-700"> {username}</span>
      </div>
    </div>
  );
}

Contact.propTypes = {
  userId: PropTypes.any,
  onClick: PropTypes.func,
  IsSelectedUser: PropTypes.bool,
  username: PropTypes.string,
  online: PropTypes.bool,
};

export default Contact;
