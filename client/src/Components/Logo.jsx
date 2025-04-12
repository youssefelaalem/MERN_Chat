import PropTypes from "prop-types";
import ChatIcon from "../assets/icons/ChatIcon";
export default function Logo({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="text-blue-600 cursor-pointer font-bold flex gap-2 pt-2 pl-2"
    >
      <ChatIcon />
      MERN CHAT
    </div>
  );
}
Logo.propTypes = {
  onClick: PropTypes.func.isRequired,
};
