import PropTypes from "prop-types";
export default function Avatar({ username, userId, online }) {
  const colors = [
    "bg-red-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-cyan-200",
    "bg-gray-200",
    "bg-red-400",
    "bg-green-400",
  ];
  const userIdBase10 = parseInt(userId, 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = colors[colorIndex];

  return (
    <div
      className={
        "relative w-8 h-8 rounded-full flex items-center " +
        color +
        ` ${userId ? "" : "bg-gray-200"}`
      }
    >
      <div className="text-center w-full opacity-50">{username[0]}</div>
      {online && (
        <div className="absolute w-2 h-2 bg-green-500 bottom-1 right-0 rounded-full border border-white"></div>
      )}
      {!online && userId && (
        <div className="absolute w-2 h-2 bg-gray-500 bottom-1 right-0 rounded-full border border-white"></div>
      )}
    </div>
  );
}

Avatar.propTypes = {
  username: PropTypes.string,
  userId: PropTypes.any,
  online: PropTypes.bool,
};
