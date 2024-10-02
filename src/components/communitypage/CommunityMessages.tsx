import React, { useState } from "react";
import { Box, Card, Avatar, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { format } from "date-fns"; // Using date-fns for date formatting
import { useAddress, useSigner } from "@thirdweb-dev/react"; // Import useAddress and useSigner to get connected wallet and sign

import axios from "axios"; // Import axios for API requests

interface Message {
  id: number; // Stream ID added
  user: string;
  avatar: string;
  content: string;
  date: string;
  media?: string; // Optional media URL
  media_kind?: string; // Media type (e.g., image, video, etc.)
  wallet: string; // The poster's wallet address
}

interface CommunityMessagesProps {
  isOwner: boolean;
  ownerWallet: string; // Community owner's wallet address
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>; // Function to update the messages
}

const formatToLocalDate = (utcDateString: string) => {
  try {
    const [datePart, timePart] = utcDateString.split(", ");
    const [day, month, year] = datePart.split("/");
    const isoDateString = `${year}-${month}-${day}T${timePart}Z`;
    const parsedDate = new Date(isoDateString);
    return format(parsedDate, "PPpp");
  } catch (error) {
    return "Invalid date";
  }
};

export default function CommunityMessages({ isOwner, ownerWallet, messages, setMessages }: CommunityMessagesProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<boolean>(false); // Loading state for deletion

  const connectedWallet = useAddress(); // Get the connected wallet address
  const signer = useSigner(); // Get the signer for signing the delete request

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, message: Message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage || !signer || !connectedWallet) return;

    setLoadingDelete(true); // Start the loading state

    try {
      const timestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp
      const signedMessage = `Delete stream with ID: ${selectedMessage.id} at timestamp: ${timestamp}`;
      const signature = await signer.signMessage(signedMessage);

      // Prepare the data for deletion request
      const deleteData = {
        walletAddress: connectedWallet, // Wallet requesting the deletion
        signature,
        streamId: selectedMessage.id, // ID of the stream to delete
        community: ownerWallet, // Owner of the community
        timestamp,
      };

      console.log("Delete request data:", deleteData);

      // Send the delete request to the backend
      const response = await axios.post("https://api.visioncommunity.xyz/community/stream/delete", deleteData);

      if (response.data.success) {
        console.log("Message deleted successfully:", response.data.message);
        // Remove the deleted message from the local state
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== selectedMessage.id));
        setSelectedMessage(null); // Reset the selected message
      } else {
        console.error("Failed to delete message:", response.data.error);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setLoadingDelete(false); // Stop the loading state
      handleMenuClose(); // Close the menu after deletion
    }
  };

  // Function to format wallet as 0x1234...5678 if user (basename) is missing
  const formatWalletAddress = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  return (
    <Box>
      {messages.map((msg, index) => {
        const isPosterOwner = msg.wallet.toLowerCase() === ownerWallet.toLowerCase(); // Check if the poster is the community owner
        const isPosterSelf = msg.wallet.toLowerCase() === connectedWallet?.toLowerCase(); // Check if the poster is the connected user
        const displayName2 = msg.user ? msg.user : formatWalletAddress(msg.wallet); // Use basename (user) or formatted wallet address if basename is missing

        return (
          <Card
            key={index}
            sx={{
              mb: 2,
              padding: 2,
              display: "flex",
              alignItems: "flex-start",
              border: "1px solid #ddd", // Common border for all messages
              borderRadius: "8px",
            }}
          >
            {/* Avatar with link to profile */}
            <a href={`/profile/${msg.wallet}`} style={{ textDecoration: "none" }}> {/* Use relative path */}
              <Avatar src={msg.avatar || "/default-avatar.png"} sx={{ mr: 2 }} />
            </a>
            <Box sx={{ flex: 1 }}>
              <Box>
                {/* Username or Wallet Address with link to profile */}
                <a href={`/profile/${msg.wallet}`} style={{ textDecoration: "none", color: "inherit" }}> {/* Use relative path */}
                  <Typography variant="body1" className="nametitle">
                    <strong>{displayName2}</strong>
                  </Typography>
                </a>
                {/* Date goes below the username */}
                <Typography variant="caption" color="textSecondary">
                  {formatToLocalDate(msg.date)} {/* Format the date to the user's local timezone */}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {msg.content}
              </Typography>

              {/* Render media if media_kind is image */}
              {msg.media && (!msg.media_kind || msg.media_kind === 'image') && (
                <Box
                  component="img"
                  src={msg.media}
                  alt="media"
                  sx={{
                    mt: 2,
                    width: "100%", // Full width
                    maxHeight: 300, // Maximum height for images
                    objectFit: "cover", // Ensures the image covers the area while maintaining aspect ratio
                    borderRadius: 2, // Optional rounded corners
                  }}
                />
              )}
            </Box>

            {/* Display delete option if the user is the community owner or the poster */}
            {(isOwner || isPosterSelf) && (
              <IconButton onClick={(event) => handleMenuOpen(event, msg)} sx={{ marginLeft: "auto" }}>
                <MoreVertIcon />
              </IconButton>
            )}

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleDeleteMessage} disabled={loadingDelete}>
                {loadingDelete ? "Deleting..." : "Delete"}
              </MenuItem>
            </Menu>
          </Card>
        );
      })}
    </Box>
  );
}
