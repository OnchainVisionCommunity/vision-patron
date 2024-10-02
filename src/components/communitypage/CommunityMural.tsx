import { useState, useEffect, ChangeEvent } from "react";
import { Box, Card, Typography, TextField, IconButton, Button, CircularProgress } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import Picker, { EmojiClickData } from "emoji-picker-react";
import CommunityMessages from "./CommunityMessages";
import axios from "axios";
import { useSigner, useAddress } from "@thirdweb-dev/react"; // Use thirdweb to sign messages and get connected wallet

interface CommunityMuralProps {
  isOwner: boolean;
  communityId: string;
  ownerWallet: string; // Add ownerWallet to props
}

interface Message {
  id: number; // Add ID to the message
  user: string;
  avatar: string;
  content: string;
  date: string;
  media?: string; // Optional media URL
  wallet: string; // The poster's wallet address
}

export default function CommunityMural({ isOwner, communityId, ownerWallet }: CommunityMuralProps) {
  const [newMessage, setNewMessage] = useState<string>(""); // New message input
  const [messages, setMessages] = useState<Message[]>([]); // State to manage all mural messages
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // Loading state for API request
  const [error, setError] = useState<string | null>(null); // Error state for API request
  const [imageError, setImageError] = useState<string | null>(null); // Error state for image upload
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Image preview URL
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // Store uploaded image URL
  const signer = useSigner(); // Use thirdweb to get the signer
  const connectedWallet = useAddress(); // Get connected wallet address

  // Ensure the wallet address is correct
  const walletAddress = connectedWallet || ownerWallet;

  useEffect(() => {
    if (!walletAddress) {
      console.error("No wallet address available. Please connect your wallet.");
    }
  }, [walletAddress]);

  // Fetch community streams (messages)
  const fetchCommunityStreams = async () => {
    try {
      const response = await fetch(`https://api.visioncommunity.xyz/v02/streams/get/all?community=${communityId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const fetchedMessages = data.data.map((stream: any) => ({
          id: stream.id, // Add stream ID here
          user: stream.basename || stream.wallet,
          avatar: stream.avatar || "/default-avatar.png",
          content: stream.message,
          date: new Date(stream.date).toLocaleString(),
          media: stream.media || null, // Include media if available
          wallet: stream.wallet, // Store the wallet to check ownership
        }));
        setMessages(fetchedMessages);
      } else {
        setError("Failed to load streams.");
      }
    } catch (err) {
      setError("Error fetching streams.");
    }
  };

  useEffect(() => {
    fetchCommunityStreams();
  }, [communityId]);

  // Image upload function
  const handleImageUpload = async (file: File) => {
    setLoading(true);
    console.log("Uploading image:", file); // Debugging log

    try {
      const formData = new FormData();
      formData.append("banner", file); // Use "banner" as the field name to match the back-end
      formData.append("walletAddress", walletAddress); // Send the connected wallet address

      console.log("FormData being sent:", {
        banner: file,
        walletAddress: walletAddress,
      }); // Log data being sent for debugging

      const uploadResponse = await axios.post("https://api.visioncommunity.xyz/v02/image/user/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (uploadResponse.data.success) {
        const imageUrl = uploadResponse.data.fileUrl;
        setUploadedImageUrl(imageUrl); // Set the uploaded image URL
        setImagePreview(URL.createObjectURL(file)); // Show image preview
        setImageError(null); // Clear any image error
        console.log("Image uploaded successfully:", imageUrl);
      } else {
        setImageError("Failed to upload image.");
        console.error("Upload error:", uploadResponse.data.error);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageError("Error uploading image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMessage = async () => {
    if (!signer) {
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

        // Sign the message with timestamp only
        const signature = await signer.signMessage(signedMessage);
        console.log("Signed message:", signedMessage);

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

        console.log("Posting data:", postData);

        // Send the data to your API
        const response = await axios.post("https://api.visioncommunity.xyz/community/stream/post", postData);

        if (response.data.success) {
          // Clear inputs and reset states
          setNewMessage("");
          setUploadedImageUrl(null); // Reset uploaded image URL
          setImagePreview(null); // Reset image preview
          setLoading(false);

          // After posting, refresh the messages to display the new message
          fetchCommunityStreams(); // Refresh messages
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
      <Card sx={{ mb: 4, padding: 2, mt: 4 }}>
        <Typography variant="h6" gutterBottom className="activitetile">
          Post on the Mural
        </Typography>
        <TextField
          fullWidth
          placeholder="Share your thoughts..."
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
            <IconButton color="primary" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <EmojiEmotionsIcon />
            </IconButton>
            {showEmojiPicker && (
              <Box sx={{ position: "absolute", zIndex: 1 }}>
                <Picker onEmojiClick={(emojiData: EmojiClickData) => setNewMessage((prev) => prev + emojiData.emoji)} />
              </Box>
            )}
          </div>
          <Button variant="contained" onClick={handleAddMessage} className="btnpatronme" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Post"}
          </Button>
        </Box>
      </Card>

      {/* Pass messages and ownerWallet to CommunityMessages */}
      <CommunityMessages isOwner={isOwner} ownerWallet={walletAddress} messages={messages} setMessages={setMessages} />
    </>
  );
}
