import { useState, useEffect, ChangeEvent, useRef } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import Picker, { EmojiClickData } from "emoji-picker-react";
import CommunityMessages from "./CommunityMessages";
import axios from "axios";
import { useActiveAccount } from "thirdweb/react";
import { signMessage } from "thirdweb/utils";
import { format } from "date-fns";
import { useUserStatus } from "../../context/UserStatusContext";
import EditIcon from '@mui/icons-material/Edit';

interface CommunityMuralProps {
  isOwner: boolean;
  communityId: string;
  ownerWallet: string;
}

interface Message {
  id: number;
  user: string;
  avatar: string;
  content: string;
  date: string;
  media?: string;
  wallet: string;
  likes_count: number;
  downvotes_count: number; // Add downvotes_count
  replies_count: number; // Add replies_count
}

const formatToLocalDate = (utcDateString: string): string => {
  const parsedDate = new Date(utcDateString);
  if (isNaN(parsedDate.getTime())) {
    return "Invalid date"; // Return fallback for invalid dates
  }
  const formattedDate = format(parsedDate, "PPpp");
  return formattedDate;
};

export default function CommunityMural({
  isOwner,
  communityId,
  ownerWallet,
}: CommunityMuralProps) {
  const [newMessage, setNewMessage] = useState<string>(""); // New message input
  const [messages, setMessages] = useState<Message[]>([]); // State to manage all mural messages
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // Loading state for API request
  const [error, setError] = useState<string | null>(null); // Error state for API request
  const [imageError, setImageError] = useState<string | null>(null); // Error state for image upload
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Image preview URL
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // Store uploaded image URL
  const account = useActiveAccount();
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const { updateEnergy, updateReputation } = useUserStatus();
const [mediaUploading, setMediaUploading] = useState(false);
const [isMobileCardOpen, setIsMobileCardOpen] = useState<boolean>(false);
const [showFullContent, setShowFullContent] = useState(false);

const handleToggleContent = () => {
  setShowFullContent((prev) => !prev);
};

  // Ensure the wallet address is correct
  const walletAddress = account?.address || ownerWallet;

  useEffect(() => {
    if (!walletAddress) {
      console.error("No wallet address available. Please connect your wallet.");
    }
  }, [walletAddress]);

  // Fetch community streams (messages)
  const fetchCommunityStreams = async () => {
    try {
      const response = await fetch(
        `https://api.visioncommunity.xyz/v02/streams/get/all?community=${communityId}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        const fetchedMessages = data.data.map((stream: any) => ({
          id: stream.id, // Add stream ID here
          user: stream.basename || stream.wallet,
          avatar: stream.avatar || "/default-avatar.png",
          content: stream.message,
          date: formatToLocalDate(stream.date), // Use the same date formatting function
          media: stream.media || null, // Include media if available
          wallet: stream.wallet, // Store the wallet to check ownership
          likes_count: stream.likes_count || 0,
          downvotes_count: stream.downvotes_count || 0, // Map downvotes_count
          replies_count: stream.replies_count || 0, // Map replies_count
        }));
        setMessages(fetchedMessages);
      } else {
        setError("Failed to load streams.");
      }
    } catch (err) {
      setError("Error fetching streams.");
    }
  };

  // Function to get the community name
  const getCommunityName = () => {
    const community = messages.find((msg) => msg.wallet === communityId);
    if (community) {
      return (
        community.customname ||
        community.basename ||
        `${community.wallet.slice(0, 6)}...${community.wallet.slice(-4)}`
      );
    }
    return "Community"; // Fallback if no community is found
  };
  
  useEffect(() => {
    fetchCommunityStreams();
  }, [communityId]);

  // Close emoji picker if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false); // Close picker
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Image upload function
  const handleImageUpload = async (file: File) => {
    setLoading(true);
    setMediaUploading(true);

    try {
      const formData = new FormData();
      formData.append("banner", file); // Use "banner" as the field name to match the back-end
      formData.append("walletAddress", walletAddress); // Send the connected wallet address

      console.log("FormData being sent:", {
        banner: file,
        walletAddress: walletAddress,
      }); // Log data being sent for debugging

      const uploadResponse = await axios.post(
        "https://api.visioncommunity.xyz/v02/image/user/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (uploadResponse.data.success) {
        const imageUrl = uploadResponse.data.fileUrl;
        setUploadedImageUrl(imageUrl); // Set the uploaded image URL
        setImagePreview(URL.createObjectURL(file)); // Show image preview
        setImageError(null); // Clear any image error
      } else {
        setImageError("Failed to upload image.");
        console.error("Upload error:", uploadResponse.data.error);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageError("Error uploading image. Please try again.");
    } finally {
      setLoading(false);
      setMediaUploading(false);
    }
  };

  const handleAddMessage = async () => {
    if (!account?.address) {
      alert("Wallet is not connected");
      return;
    }

    if (!walletAddress) {
      console.error("No wallet address available. Please connect your wallet.");
      setError("No wallet address available. Please connect your wallet.");
      return;
    }

    if (newMessage.trim() || uploadedImageUrl) {
      try {
        setLoading(true);

        // Prepare the timestamp message for signing
        const timestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp
        const signedMessage = `Posting at ${timestamp}`;

        // Use SDK5's signMessage function
        const signature = await signMessage({
          account,
          message: signedMessage,
        });


        // Prepare the data for posting
        const postData = {
          walletAddress: walletAddress, // Send the connected wallet address
          signature,
          message: newMessage,
          media: uploadedImageUrl || null, // Include media if an image was uploaded
          media_kind: uploadedImageUrl ? "image" : null, // Assume it's an image if media is selected
          community: communityId,
          timestamp, // Send the timestamp along with the request
        };

        // Send the data to your API
        const response = await axios.post(
          "https://api.visioncommunity.xyz/community/stream/post",
          postData
        );

        if (response.data.success) {
          // Update user's energy and reputation
          const { energy_spent, reputation_earned_by_user } = response.data;
          updateEnergy(-energy_spent); // Decrease energy
          updateReputation(reputation_earned_by_user); // Increase reputation

          // Clear inputs and reset states
          setNewMessage("");
          setUploadedImageUrl(null); // Reset uploaded image URL
          setImagePreview(null); // Reset image preview
          setLoading(false);

          // After posting, refresh the messages to display the new message
          fetchCommunityStreams(); // Refresh messages
          
          return true;
        } else {
          setError(response.data.message || "Failed to post stream");
        }
      } catch (error) {
        console.error("Error posting message:", error);
        setError("Error posting message.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file); // Use the new image upload handler
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  return (
    <>
    
  {/* Floating Pencil Button (visible on mobile) */}
  <IconButton
    onClick={() => setIsMobileCardOpen(true)}
    sx={{
      position: 'fixed',
      bottom: 75,
      left: 90,
      zIndex: 1000,
      display: { xs: 'flex', md: 'none' }, // Show only on mobile
      width: 60,
      height: 60,
      borderRadius: '50%',
      backgroundColor: '#3872f7',
      color: '#fff',
    }}
  >
    <EditIcon />
  </IconButton>  

<Card
  sx={{
    mb: 0,
    padding: 2,
    mt: 0,
    position: { xs: 'fixed', md: 'static' }, // Fixed on mobile, static on desktop
    bottom: { xs: 0, md: 'auto' },
    left: { xs: 0, md: 'auto' },
    width: '100%', // Full width on mobile, auto on desktop
    maxWidth: '100%',
    height: { xs: '100vh', md: 'auto' }, // Full height on mobile, auto on desktop
    backgroundColor: 'background.paper',
    zIndex: 1000,
    display: 'block', // Always visible
    transform: {
      xs: isMobileCardOpen ? 'translateY(0)' : 'translateY(100%)',
      md: 'none',
    }, // Animation on mobile only
    transition: { xs: 'transform 0.3s ease-in-out', md: 'none' }, // Animation on mobile only
  }}
>
  
  
  
        <TextField
          fullWidth
          placeholder="Share your thoughts with the community..."
          multiline
          rows={3}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        {imagePreview && (
          <Box sx={{ mb: 2 }}>
            <img
              src={imagePreview}
              alt="Selected"
              style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }}
            />
          </Box>
        )}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <div>
            <IconButton color="primary" component="label">
              <AddPhotoAlternateIcon />
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </IconButton>
            <IconButton
              color="primary"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <EmojiEmotionsIcon />
            </IconButton>
            {showEmojiPicker && (
              <Box ref={pickerRef} sx={{ position: "absolute", zIndex: 1 }}>
                <Picker
                  onEmojiClick={(emojiData: EmojiClickData) =>
                    setNewMessage((prev) => prev + emojiData.emoji)
                  }
                />
              </Box>
            )}
          </div>
          <Button
            variant="contained"
            onClick={handleAddMessage}
            className="btnpatronme"
            disabled={loading || mediaUploading}
          >
  {mediaUploading
    ? "Uploading media..." // Display during media upload
    : loading
    ? "Posting..." // Display during message posting
    : "Post"}
          </Button>
        </Box>
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        
        
{/* Cancel Button for Mobile */}
<Box
  sx={{
    display: { xs: 'flex', md: 'none' }, // Flex only on mobile
    justifyContent: 'space-between',
    gap: 1,
    mt: 2,
	marginTop: '30px'
  }}
>
<Button
  variant="contained"
  onClick={async () => {
    const success = await handleAddMessage();
    if (success) {
      setIsMobileCardOpen(false);
    }
  }}
  className="btnpatronme"
  disabled={loading || mediaUploading}
  sx={{ flex: 1 }} // Takes equal space as the cancel button
>
  {mediaUploading ? 'Uploading media...' : loading ? '...' : 'Post'}
</Button>
  <Button
    variant="text"
    onClick={() => setIsMobileCardOpen(false)}
    sx={{ flex: 1 }} // Takes equal space as the post button
  >
    Cancel
  </Button>
</Box>
      </Card>

  
      {/* Pass messages and ownerWallet to CommunityMessages */}
      <CommunityMessages
        isOwner={isOwner}
        ownerWallet={communityId}
        messages={messages}
        setMessages={setMessages}
      />
    </>
  );
}
