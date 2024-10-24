//MESSAGES TO COMMUNITY MURAL
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  ListItemIcon,
  ListItemText,
  Modal
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import { useNavigate } from "react-router-dom";
import { useActiveAccount } from "thirdweb/react";
import { signMessage } from "thirdweb/utils";
import axios from "axios";
import { useUserStatus } from "../../context/UserStatusContext";
import DeleteIcon from "@mui/icons-material/Delete";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import { parseISO, formatDistanceToNow, addMinutes } from 'date-fns';

interface Message {
  id: number;
  user: string;
  avatar: string;
  content: string;
  date: string;
  media?: string;
  media_kind?: string;
  wallet: string;
  likes_count: number;
  downvotes_count: number;
  replies_count: number;
}

interface CommunityMessagesProps {
  isOwner: boolean;
  ownerWallet: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const timeAgo = (dateString: string) => {
  if (!dateString || typeof dateString !== 'string') {
    return "Invalid date"; // Handle cases where dateString is undefined, null, or not a string
  }

  // Convert the date string to a format that can be parsed
  const formattedDateString = dateString.replace(" ", "T"); // Replace space with 'T' to make it ISO-like

  // Parse the date string
  const dateUTCPlus1 = new Date(formattedDateString);

  if (isNaN(dateUTCPlus1.getTime())) {
    return "Invalid date"; // Handle invalid date format
  }

  // Add 60 minutes to account for the server's UTC+1 offset
  const adjustedDate = addMinutes(dateUTCPlus1, -60);

  // Calculate the "time ago" format using formatDistanceToNow
  return formatDistanceToNow(adjustedDate, { addSuffix: true });
};




// Define the modal style
const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const formatWalletAddress = (wallet: string) => {
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
};



export default function CommunityMessages({
  isOwner,
  ownerWallet,
  messages,
  setMessages,
}: CommunityMessagesProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<boolean>(false);
  const [visibleMessages, setVisibleMessages] = useState<number>(50);
  const [likedMessages, setLikedMessages] = useState<Set<number>>(new Set());
  const [downvotedMessages, setDownvotedMessages] = useState<Set<number>>(new Set());
  const [feedbackMessage, setFeedbackMessage] = useState<{
    id: number;
    text: string;
    color: string;
  } | null>(null);
  const { updateEnergy, updateReputation } = useUserStatus();
  const account = useActiveAccount();
  const navigate = useNavigate();
const [isPortrait, setIsPortrait] = useState(false);
  const [openBoostModal, setOpenBoostModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>(""); 
  const [showFullContent, setShowFullContent] = useState(false);


const formatMessageContent = (content: string) => {
  const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
  const urlRegex = /((https?:\/\/|www\.)[^\s]+|[^\s]+?\.(com|io|xyz|net|org|edu|gov|co|info)(\/[^\s]*)?)/g;

  return content
    .replace(mentionRegex, '<a href="/profile/$1">@$1</a>') // Replace @mentions with profile links
    .replace(urlRegex, (url) => {
      const href = url.startsWith('http') ? url : `http://${url}`; // Add http:// if missing
      return `<a href="${href}" target="_blank" rel="nofollow">${url}</a>`;
    });
};
const handleToggleContent = () => {
  setShowFullContent((prev) => !prev);
};
  const handleBoostModalOpen = () => setOpenBoostModal(true);
const handleBoostModalClose = () => {
  setOpenBoostModal(false);
  setModalMessage(""); // Clear the modal message to close the feedback modal
};
  
// Function to handle image load and determine aspect ratio
const handleImageLoad = (event) => {
  const { naturalWidth, naturalHeight } = event.target;
  setIsPortrait(naturalHeight > naturalWidth);
};

const handleBoostAction = async () => {
    if (!account?.address || !selectedMessage) {
      alert("Wallet is not connected or no stream selected");
      return;
    }

    try {
      setLoading(true);

      // Include the timestamp in the message
      const timestamp = Math.floor(Date.now() / 1000);  // Current Unix timestamp (seconds)
      const message = `I am boosting the stream ${selectedMessage.id} at ${timestamp} in ${ownerWallet}`;

      // Sign the message using the SDK v5 signMessage utility
      const signature = await signMessage({
        account,
        message,
      });

      // Send the signed message and other data to the backend
      const response = await axios.post("https://api.visioncommunity.xyz/v02/user/stream/boost", {
        walletAddress: account.address,
        signature,
        streamId: selectedMessage.id,
        communityOwner: ownerWallet,
        timestamp,
      });

      // Handle the response
      if (response.data.success) {
        setModalMessage("Post boosted successfully!");
      } else {
        setModalMessage(response.data.message || "Failed to boost the stream");
      }
    } catch (error) {
      console.error("Error boosting stream:", error);
      setModalMessage("An error occurred while boosting the stream");
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch like and downvote status
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!account?.address || messages.length === 0) return;

      try {
        const likeCheckPayload = {
          owner: ownerWallet,
          liker: account?.address,
          streams: messages.map((msg) => msg.id),
        };

        const response = await axios.post(
          "https://api.visioncommunity.xyz/v02/community/stream/like/check",
          likeCheckPayload
        );

        if (response.data.success) {
          const likes = response.data.likes;
          const likedStreams = new Set<number>();

          for (const streamId in likes) {
            if (likes[streamId]) {
              likedStreams.add(parseInt(streamId));
            }
          }
          setLikedMessages(likedStreams);
        }
      } catch (error) {
        console.error("Error fetching like statuses:", error);
      }
    };

    const fetchDownvoteStatus = async () => {
      if (!account?.address || messages.length === 0) return;

      try {
        const downvoteCheckPayload = {
          owner: ownerWallet,
          liker: account?.address,
          streams: messages.map((msg) => msg.id),
        };

        const response = await axios.post(
          "https://api.visioncommunity.xyz/v02/community/stream/downvote/check",
          downvoteCheckPayload
        );

        if (response.data.success) {
          const downvotes = response.data.downvotes;
          const downvotedStreams = new Set<number>();

          for (const streamId in downvotes) {
            if (downvotes[streamId]) {
              downvotedStreams.add(parseInt(streamId));
            }
          }
          setDownvotedMessages(downvotedStreams);
        }
      } catch (error) {
        console.error("Error fetching downvote statuses:", error);
      }
    };

    fetchLikeStatus();
    fetchDownvoteStatus();
  }, [messages, account?.address, ownerWallet]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, message: Message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage || !account?.address) return;

    setLoadingDelete(true);

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signedMessage = `Delete stream with ID: ${selectedMessage.id} at timestamp: ${timestamp}`;

      const signature = await signMessage({
        account,
        message: signedMessage,
      });

      const deleteData = {
        walletAddress: account.address,
        signature,
        streamId: selectedMessage.id,
        community: ownerWallet,
        timestamp,
      };

      const response = await axios.post(
        "https://api.visioncommunity.xyz/community/stream/delete",
        deleteData
      );

      if (response.data.success) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== selectedMessage.id)
        );
        setSelectedMessage(null);
      } else {
        console.error("Failed to delete message:", response.data.error);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setLoadingDelete(false);
      handleMenuClose();
    }
  };

  // Handle like and downvote toggles
  const handleLikeToggle = async (id: number) => {
    const liked = likedMessages.has(id);

    try {
      const likeStatus = liked ? 0 : 1;
      const likeData = {
        owner: ownerWallet,
        liker: account?.address,
        stream: id,
        status: likeStatus,
      };

      const response = await axios.post("https://api.visioncommunity.xyz/v02/community/stream/like", likeData);

      if (response.data.success) {
        const { energy_spent, reputation_earned_by_liker } = response.data;
        updateEnergy(-energy_spent);
        updateReputation(reputation_earned_by_liker);

        setLikedMessages((prevLikedMessages) => {
          const updatedLikes = new Set(prevLikedMessages);

          setMessages((prevMessages) =>
            prevMessages.map((msg) => {
              if (msg.id === id) {
                if (updatedLikes.has(id)) {
                  updatedLikes.delete(id);
                  return { ...msg, likes_count: msg.likes_count - 1 };
                } else {
                  updatedLikes.add(id);
                  return { ...msg, likes_count: msg.likes_count + 1 };
                }
              }
              return msg;
            })
          );

          return updatedLikes;
        });
      }
    } catch (error) {
      console.error("Error liking the stream:", error);
    }
  };

const handleDownvoteToggle = async (id: number) => {
  const downvoted = downvotedMessages.has(id);

  // Find the message by its ID to check if it's a self-downvote
  const message = messages.find((msg) => msg.id === id);
  if (message?.wallet.toLowerCase() === account?.address?.toLowerCase()) {
    // Prevent self-downvote from updating energy or reputation
    console.warn("Self-downvote is not allowed.");
    return;
  }

  try {
    const downvoteStatus = downvoted ? 0 : 1; // Toggle between 0 (undo) and 1 (downvote)
    const downvoteData = {
      owner: ownerWallet,
      liker: account?.address, // The user doing the downvote
      stream: id,
      status: downvoteStatus,
    };

    // Send the downvote request
    const response = await axios.post("https://api.visioncommunity.xyz/v02/community/stream/downvote", downvoteData);

    if (response.data.success) {
      const { energy_spent, reputation_earned_by_downvoter } = response.data; // Ensure these values are returned

      // Update user's energy and reputation only if it's a valid downvote
      updateEnergy(-energy_spent); // Deduct energy spent on downvote
      updateReputation(reputation_earned_by_downvoter); // Update reputation with the points earned for downvoting

      // Update local state for downvoted messages
      setDownvotedMessages((prevDownvotedMessages) => {
        const updatedDownvotes = new Set(prevDownvotedMessages);

        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (msg.id === id) {
              if (updatedDownvotes.has(id)) {
                updatedDownvotes.delete(id); // Undo downvote
                return { ...msg, downvotes_count: msg.downvotes_count - 1 };
              } else {
                updatedDownvotes.add(id); // Apply downvote
                return { ...msg, downvotes_count: msg.downvotes_count + 1 };
              }
            }
            return msg;
          })
        );

        return updatedDownvotes;
      });
    }
  } catch (error) {
    console.error("Error downvoting the stream:", error);
  }
};



  const handleLoadMore = () => {
    setVisibleMessages((prev) => prev + 20);
  };

  const handleNavigateToStream = (msgId: number) => {
    navigate(`/communities/${ownerWallet}/stream/${msgId}`);
  };

  return (
    <Box className="msgmural">
      {messages.slice(0, visibleMessages).map((msg, index) => {
        const isPosterOwner = msg.wallet.toLowerCase() === ownerWallet.toLowerCase();
        const isPosterSelf = msg.wallet.toLowerCase() === account?.address?.toLowerCase();
        const displayName2 = msg.user && msg.user.endsWith(".base.eth") ? msg.user : formatWalletAddress(msg.wallet);
        const isLiked = likedMessages.has(msg.id);
        const isDownvoted = downvotedMessages.has(msg.id);

        return (
          <Card
            key={index}
            sx={{
              mb: 0,
              padding: 2,
              display: "flex",
              alignItems: "flex-start",
              border: "1px solid #ddd",
              borderRadius: "0px",
              position: "relative",
            }}
            className="msgmuralind"
          >
            <a href={`/profile/${msg.wallet}`} style={{ textDecoration: "none" }}>
              <Avatar src={msg.avatar || "/default-avatar.png"} sx={{ mr: 2 }} />
            </a>
            <Box sx={{ flex: 1 }}>
              <Box>
                <a href={`/profile/${msg.wallet}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <Typography variant="body1" className="usernamemural basestylefont">
                    <strong>{displayName2}</strong>
                  </Typography>
                </a>
                <Typography
                  variant="caption"
                  color="white"
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleNavigateToStream(msg.id)}
                  className="datetime"
                >
                  {timeAgo(msg.date)}
                </Typography>
              </Box>
              
<Typography
  variant="body2"
  className="msgcontentformat"
  sx={{ mt: 1 }}
  dangerouslySetInnerHTML={{
    __html: msg.content
      ? showFullContent
        ? formatMessageContent(msg.content)
        : `${formatMessageContent(msg.content.slice(0, 250))}${msg.content.length > 250 ? '...' : ''}`
      : '', // Fallback to an empty string if msg.content is undefined
  }}
/>
    {/* "View More" button */}
    {msg.content.length > 250 && !showFullContent && (
      <Button
        variant="text"
        onClick={handleToggleContent}
        sx={{ mt: 1, padding: 0 }}
        className="viewmorebtn"
      >
        Show More
      </Button>
    )}
    {showFullContent && (
      <Button
        variant="text"
        onClick={handleToggleContent}
        sx={{ mt: 1, padding: 0 }}
        className="viewmorebtn"
      >
        Show Less
      </Button>
    )}

              {msg.media && (!msg.media_kind || msg.media_kind === "image") && (
    <Box sx={{ mt: 2 }}>
      <img
        src={msg.media}
        alt="stream media"
        onLoad={handleImageLoad}
        className="feedimg"
        style={{
          maxWidth: '100%',
          maxHeight: isPortrait ? '500px' : '300px',
          objectFit: isPortrait ? 'cover' : 'contain',
        }}
      />
    </Box>
              )}

              <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <IconButton onClick={() => handleNavigateToStream(msg.id)} className="white">
                  <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
                  <Typography color="white" variant="caption" sx={{ ml: 1 }}>
                    {msg.replies_count}
                  </Typography>
                </IconButton>

                <IconButton onClick={() => handleLikeToggle(msg.id)} className="white">
                  {isLiked ? (
                    <FavoriteIcon sx={{ fontSize: 18, color: "#0070f3" }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                  )}
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {msg.likes_count}
                  </Typography>
                </IconButton>

                <IconButton onClick={() => handleDownvoteToggle(msg.id)} className="white">
                  {isDownvoted ? (
                    <ThumbDownAltIcon sx={{ fontSize: 18, color: "red" }} />
                  ) : (
                    <ThumbDownOffAltIcon sx={{ fontSize: 18 }} />
                  )}
                  <Typography color="white" variant="caption" sx={{ ml: 1 }}>
                    {msg.downvotes_count}
                  </Typography>
                </IconButton>
              </Box>
            </Box>

            {(isOwner || isPosterSelf) && (
              <IconButton onClick={(event) => handleMenuOpen(event, msg)} sx={{ marginLeft: "auto" }} className="btnoptmsg">
                <MoreVertIcon />
              </IconButton>
            )}

<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
  <MenuItem onClick={handleDeleteMessage} disabled={loadingDelete}>
    <ListItemText primary={loadingDelete ? "Deleting..." : "Delete"} />
    <ListItemIcon sx={{ minWidth: 'auto', marginRight: 'auto' }}>
      <DeleteIcon />
    </ListItemIcon>
  </MenuItem>
  <MenuItem onClick={handleBoostModalOpen}>
    <ListItemText primary="Boost" />
    <ListItemIcon sx={{ minWidth: 'auto', marginRight: 'auto' }}>
      <FlashOnIcon />
    </ListItemIcon>
  </MenuItem>
</Menu>
          </Card>
        );
      })}

      {messages.length > visibleMessages && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button variant="outlined" onClick={handleLoadMore}>
            Load More
          </Button>
        </Box>
      )}
      
            {/* Boost Modal */}
      <Modal
        open={openBoostModal}
        onClose={handleBoostModalClose}
        aria-labelledby="boost-community-modal"
        aria-describedby="boost-community-description"
      >
        <Box sx={modalStyle}>
          <Typography id="boost-community-modal" className="modaltitle" gutterBottom>
            Boost
          </Typography>
          <Typography id="boost-community-description" sx={{ mb: 2 }} className="modaltext">
            You are about to boost this post. This action will consume 10k energy and will make this post publicly visible on everyone's "For You". Do you wish to continue? This action cannot be undone manually.
          </Typography>
          <Button
            variant="contained"
            className="btnpatronme"
            fullWidth
            sx={{ mb: 2 }}
            onClick={handleBoostAction}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Boost"}
          </Button>
          <Button variant="outlined" color="secondary" fullWidth onClick={handleBoostModalClose} className="btnpatronmecancel">
            Cancel
          </Button>
        </Box>
      </Modal>

      {/* Feedback Modal */}
      <Modal open={!!modalMessage} onClose={handleBoostModalClose}>
        <Box sx={modalStyle}>
          <Typography className="modaltitle" gutterBottom>
            {modalMessage.includes("successfully") ? "Success" : "Info"}
          </Typography>
          <Typography className="modaltext">{modalMessage}</Typography>
          <Button variant="contained" className="btnpatronme" fullWidth onClick={handleBoostModalClose}>
            Close
          </Button>
        </Box>
      </Modal>
      
    </Box>
  );
}
