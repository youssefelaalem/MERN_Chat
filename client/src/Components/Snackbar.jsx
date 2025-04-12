import PropTypes from "prop-types";
import Xicon from "../assets/icons/Xicon";

const Snackbar = ({ message, type, onClose }) => {
  const bgColor = type === "error" ? "bg-red-600" : "bg-green-600";
  setTimeout(() => {
    onClose();
  }, 1500);
  return (
    <div
      className={`absolute right-0 left-0 sm:left-auto m-2 sm:m-8 p-4 ${bgColor} text-white rounded shadow-lg flex gap-2 text-center text-sm sm:text-base`}
    >
      <Xicon className="cursor-pointer" onClick={onClose} />
      <p className="text-center">{message}</p>
    </div>
  );
};

Snackbar.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["error", "success"]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Snackbar;
