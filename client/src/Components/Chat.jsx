import { useCallback, useRef, useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { UserContext } from "../UserContext";
import _ from "lodash";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "../style.css";
import OnlineAndOfflineUsers from "./OnlineAndOfflineUsers";
import { uploadFile } from "../utils/SupabaseUploading";
import AttachmentIcon from "../assets/icons/AttachmentIcon";
import SendIcon from "../assets/icons/SendIcon";
import { useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import ArrowLeft from "../assets/icons/ArrowLeft";
import Contact from "./Contact";
import Avatar from "./Avatar";
import { useMediaQuery } from "../useMediaQuery";
import axiosInstance from "../api/axios";
export default function Chat({ selectedUserIdFromRoute }) {
  const navigate = useNavigate();
  // const [isMobile, setIsMobile] = useState(false);
  const isMobile = useMediaQuery("(max-width: 500px)");
  // useEffect(() => {
  //   const mediaQuery = window.matchMedia("(max-width: 500px)");
  //   const handleMediaChange = (e) => setIsMobile(e.matches);

  //   mediaQuery.addListener(handleMediaChange);
  //   return () => mediaQuery.removeListener(handleMediaChange);
  // }, []);
  // const [selectedUserId, setSelectedUserId] = useState(selectedUserIdFromRoute);
  const [selectedUserId, setSelectedUserId] = useState(selectedUserIdFromRoute);
  const [selectedUserName, setSelectedUserName] = useState("");
  useEffect(() => {
    if (isMobile && selectedUserId) {
      navigate(`/user/${selectedUserId}`);
    }
  }, [selectedUserId, isMobile, navigate]);

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [offlineUsers, setOfflineUsers] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const { username, id, setId, setUsername } = useContext(UserContext);
  // Add this to debug component mounting

  const onlinePeopleString = JSON.stringify(onlinePeople);
  const fetchUsers = _.debounce(() => {
    try {
      axiosInstance.get("/AllUsers/").then((res) => {
        const nameOfReciver = res?.data?.AllUsers?.find(
          (user) => user._id == selectedUserId
        );

        //filter the current user ,and online users
        const offlineUsersArr = res?.data?.AllUsers?.filter(
          (user) => user?._id !== id
        ).filter((user) => !Object.keys(onlinePeople)?.includes(user?._id));
        const currentOfflineUsers = {};
        // conver array to object
        offlineUsersArr?.forEach((user) => {
          currentOfflineUsers[user?._id] = user;
        });
        setOfflineUsers(currentOfflineUsers);
        // console.log("offlineUsers", offlineUsersArr);
      });
    } catch (e) {
      console.error("erorr: ", e.message);
    }
  }, 500);
  useEffect(() => {
    fetchUsers();
    return () => fetchUsers.cancel();
  }, [onlinePeopleString]);
  useEffect(() => {
    connectionWS();
  }, [selectedUserId]);
  function connectionWS() {
    const ws = new WebSocket("ws://mernchat-production-815e.up.railway.app");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    // for reconnection
    ws.addEventListener("close", () =>
      setTimeout(() => {
        connectionWS();
      }, 800)
    );
  }
  function showOnlinePeople(peopleArray) {
    const people = peopleArray.reduce((acc, { userId, username }) => {
      acc[userId] = username;
      return acc;
    }, {});

    setOnlinePeople((prev) => {
      const prevKeys = Object.keys(prev);
      const newKeys = Object.keys(people);
      // Check if keys are different
      if (prevKeys.length !== newKeys.length) return people;
      // Check if all keys and values are the same
      const isSame = prevKeys.every((key) => prev[key] === people[key]);
      return isSame ? prev : people;
    });
  }
  //it is object not array
  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];
  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    // console.log("messageData", { ev, messageData });

    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else {
      // Handle all message types
      setMessages((prev) => {
        // Prevent duplicates
        if (!prev.find((msg) => msg._id === messageData._id)) {
          if (messageData.sender === selectedUserId)
            return [...prev, messageData];
        }
        return prev;
      });
    }
  }

  const sendMessage = async (event) => {
    event.preventDefault();
    if (isSending) return;
    // Don't send empty messages without files
    if (!newMessage.trim() && !selectedFile) return;
    setIsSending(true);
    let fileUrl = null;
    let fileMetadata = null;
    if (newMessage.trim().length > 0 || selectedFile) {
      try {
        // Upload file if exists
        if (selectedFile) {
          const uploadResult = await uploadFile(selectedFile);
          fileUrl = uploadResult.url;
          fileMetadata = uploadResult.metadata;
        }

        // Send message through WebSocket
        ws.send(
          JSON.stringify({
            recipient: selectedUserId,
            text: newMessage,
            fileUrl: fileUrl,
            fileMetadata: fileMetadata,
          })
        );

        // Update local messages state
        setMessages((prev) => [
          ...prev,
          {
            text: newMessage,
            fileUrl: fileUrl,
            _id: Date.now(),
            createdAt: new Date().toISOString(),
            fileMetadata,
            sender: id,
            recipient: selectedUserId,
            isOur: true,
          },
        ]);

        // Reset states
        setNewMessage("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          // Clear file input
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
      } finally {
        setIsSending(false);
      }
    }
  };

  const divUnderMessagesRef = useRef();
  useEffect(() => {
    const div = divUnderMessagesRef.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);
  const UniqMessages = _.uniqBy(messages, "_id");
  useEffect(() => {
    if (selectedUserId)
      axiosInstance.get(`/messages/${selectedUserId}`).then((response) => {
        setMessages(response?.data?.allMessages);
      });
  }, [selectedUserId]);

  async function uploadingFilesChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  }
  // Collect all image URLs from messages
  const imageMessages = messages.filter(
    (msg) => msg.fileUrl && msg.fileUrl.match(/\.(jpeg|jpg|gif|png)$/)
  );

  const handleImageClick = useCallback((url, index) => {
    setSelectedImage(url);
    setCurrentIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedImage(null);
    setCurrentIndex(0);
  }, []);

  // Create slides array for Lightbox
  const slides = imageMessages.map((msg, index) => ({
    src: msg.fileUrl,
    title: `Message ${index + 1}`,
    alt: `Message attachment ${index + 1}`,
    index,
  }));

  function ShowDateOfMessage(dateOfMessage) {
    if (!dateOfMessage) {
      return "No timestamp available";
    }

    const date = new Date(dateOfMessage);

    if (isNaN(date.getTime())) {
      return "Invalid timestamp";
    }

    // Create formatter with Egyptian locale and timezone
    const formatter = new Intl.DateTimeFormat("en-EG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Cairo",
    });

    return formatter.format(date);
  }
  console.log(
    "(!isMobile || !selectedUserId) ",
    { isMobile, selectedUserId },
    !isMobile || !selectedUserId
  );

  return (
    <div className="ContaninerDiv flex h-screen">
      {/* Lightbox with navigation */}
      {selectedImage && (
        <Lightbox
          open={!!selectedImage}
          close={handleClose}
          slides={slides}
          index={currentIndex}
          onMoveNext={() =>
            setCurrentIndex((prev) =>
              prev === slides.length - 1 ? 0 : prev + 1
            )
          }
          onMovePrev={() =>
            setCurrentIndex((prev) =>
              prev === 0 ? slides.length - 1 : prev - 1
            )
          }
        />
      )}

      {/* Contact List - hidden on mobile when user is selected */}
      {(!isMobile || !selectedUserId) && (
        <OnlineAndOfflineUsers
          setSelectedUserName={setSelectedUserName}
          setWs={setWs}
          onlinePeopleExclOurUser={onlinePeopleExclOurUser}
          setSelectedUserId={setSelectedUserId}
          selectedUserId={selectedUserId}
          offlineUsers={offlineUsers}
        />
      )}

      {/* display All messages */}
      {selectedUserId ? (
        <>
          {isMobile && (
            <div className="w-[100%] bg-slate-100 p-2">
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setSelectedUserName(null);
                  navigate("/");
                }}
                className="text-blue-600 flex  items-center gap-2"
              >
                <ArrowLeft />
                <Avatar username={selectedUserName} />
                <span>{selectedUserName}</span>
              </button>
            </div>
          )}
          <div className="messagesList flex flex-col bg-blue-200 w-full sm:w-2/3 p-2">
            {/* Mobile Back Button */}
            <div className="relative-postion h-full">
              <div className="overflow-y-auto scrolling absolute-postion top-0 left-0 right-0 bottom-2">
                {UniqMessages?.map((message, index) => (
                  <div
                    key={message?._id}
                    className={`${
                      message.sender === id ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`whitespace-normal break-words  max-w-[55%] my-2 text-left inline-block p-2 rounded-md text-sm ${
                        message.sender === id
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-500"
                      }`}
                    >
                      {message?.fileUrl && message?.text ? (
                        <>
                          <p>{message?.text}</p>
                          <div className="">
                            {message.fileMetadata.mimeType.includes("image") ? (
                              <>
                                <img
                                  src={message.fileUrl}
                                  alt="Attachment"
                                  className="rounded-md"
                                  onClick={() =>
                                    handleImageClick(message.fileUrl, index)
                                  }
                                />
                              </>
                            ) : (
                              <>
                                <a
                                  href={message.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`${
                                    message.sender === id
                                      ? "bg-blue-500 text-white"
                                      : "bg-white text-gray-500"
                                  } underline flex`}
                                >
                                  <AttachmentIcon className={"size-4"} />

                                  {message?.fileMetadata?.filename}
                                </a>
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {message?.text && <p>{message?.text}</p>}

                          {/* File message */}
                          {message.fileUrl && (
                            <div className="">
                              {message.fileMetadata.mimeType.includes(
                                "image"
                              ) ? (
                                <>
                                  <img
                                    src={message.fileUrl}
                                    alt="Attachment"
                                    className="rounded-md"
                                    onClick={() =>
                                      handleImageClick(message.fileUrl, index)
                                    }
                                  />
                                </>
                              ) : (
                                <>
                                  <a
                                    href={message.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${
                                      message.sender === id
                                        ? "bg-blue-500 text-white"
                                        : "bg-white text-gray-500"
                                    } underline flex`}
                                  >
                                    <AttachmentIcon className={"size-4"} />

                                    {message?.fileMetadata?.filename}
                                  </a>
                                </>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      <span
                        className={`DateMessage flex ${
                          message?.sender == id
                            ? "justify-start"
                            : "justify-end"
                        }`}
                      >
                        {message?.createdAt &&
                          ShowDateOfMessage(message?.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessagesRef}></div>
              </div>
            </div>
            {/* show Name of the file before sending */}
            {selectedFile && (
              <div className="text-sm text-gray-600">
                Attached: {selectedFile.name}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    fileInputRef.current.value = "";
                  }}
                  className="ml-2 text-red-500"
                >
                  ×
                </button>
              </div>
            )}
            <form className="flex gap-2" onSubmit={sendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="bg-white flex-grow border rounded-sm p-2"
                placeholder="type your message here"
              />
              <label
                type="button"
                className="bg-blue-300 p-2 cursor-pointer text-gray-600 rounded-sm"
              >
                <input
                  type="file"
                  onChange={uploadingFilesChange}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />
                <AttachmentIcon className={"size-6"} />
              </label>
              <button
                type="submit"
                className="bg-blue-600 p-2 rounded-sm text-white"
                disabled={isSending}
              >
                <SendIcon />
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          {!isMobile && (
            <div className="flex flex-grow bg-blue-200 justify-center items-center">
              <div className="text-2xl text-gray-800">
                &larr;no selected Contact
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
Chat.propTypes = {
  selectedUserIdFromRoute: PropTypes.any,
};
