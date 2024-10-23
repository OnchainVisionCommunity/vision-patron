import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import {
  Box,
  Card,
  Avatar,
  Typography,
  Button,
  IconButton,
  TextField,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import Picker, { EmojiClickData } from 'emoji-picker-react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useUserStatus } from '../context/UserStatusContext';
import { useActiveAccount } from 'thirdweb/react';
import { signMessage } from 'thirdweb/utils';

interface Reply {
  id: number;
  content: string;
  media: string | null;
  media_kind: string | null;
  date: string;
  likes: number;
  downvotes: number;
  replies_count: number;
  streamer: {
    wallet: string;
    basename: string;
    avatar: string;
    badges: { image: string }[];
  };
}

interface StreamDetails {
  id: number;
  content: string;
  media: string | null;
  media_kind: string | null;
  date: string;
  likes: number;
  downvotes: number;
  replies_count: number;
  streamer: {
    wallet: string;
    basename: string;
    avatar: string;
    badges: { image: string }[];
  };
}

const shortenWallet = (wallet: string) => `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

const Streams: React.FC = () => {
  const { ownerWallet, streamId } = useParams<{ ownerWallet: string; streamId: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [mainStream, setMainStream] = useState<StreamDetails | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [mediaUploading, setMediaUploading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const { updateEnergy, updateReputation } = useUserStatus();
  const account = useActiveAccount();
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
const pickerRef = useRef<HTMLDivElement | null>(null);
const [imageError, setImageError] = useState<string | null>(null);
const [transactionPending, setTransactionPending] = useState<boolean>(false);
const [isValidPatron, setIsValidPatron] = useState<boolean | null>(null);

// Close emoji picker if clicked outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
      setShowEmojiPicker(false);
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

// Function to add the selected emoji to the reply
const handleEmojiClick = (emojiData: EmojiClickData) => {
  setNewReply((prev) => prev + emojiData.emoji);
  setShowEmojiPicker(false); // Close the picker after selecting an emoji
};

  // Fetch main stream and replies
useEffect(() => {
  const fetchStreamAndReplies = async () => {
    if (!account?.address || !streamId) {
      // If account or streamId is not available, set loading to false and isValidPatron to false
      setLoading(false);
      setIsValidPatron(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.visioncommunity.xyz/v02/streams/get/replies?user_wallet=${account.address}&stream_id=${streamId}&limit=50&offset=0`
      );

      if (response.data.success) {
        setMainStream(response.data.main_stream);
        setReplies(response.data.replies);
        setIsValidPatron(true);
      } else if (response.data.message === "You are not a patron of this community") {
        setIsValidPatron(false);
      } else {
        setIsValidPatron(false); // Handle other unsuccessful cases
      }
    } catch (error) {
      console.error("Error fetching stream and replies:", error);
      setIsValidPatron(false); // Set isValidPatron to false if there is an error
    } finally {
      setLoading(false);
    }
  };

  fetchStreamAndReplies();
}, [streamId, account?.address, reload]);

  // Handle like button toggle for both main stream and replies
  const handleLikeToggle = async (id: number, isReply: boolean) => {
    const stream = isReply
      ? replies.find((reply) => reply.id === id)
      : mainStream;

    if (!stream || !account?.address) return;

    const liked = stream.likes > 0;

    try {
      const likeStatus = liked ? 0 : 1;
      const likeData = {
        owner: ownerWallet,
        liker: account?.address,
        stream: id,
        status: likeStatus,
      };

      const response = await axios.post(
        'https://api.visioncommunity.xyz/v02/community/stream/like',
        likeData
      );

      if (response.data.success) {
        const { energy_spent, reputation_earned_by_liker } = response.data;

        updateEnergy(-energy_spent);
        updateReputation(reputation_earned_by_liker);

        if (isReply) {
          setReplies((prevReplies) =>
            prevReplies.map((reply) =>
              reply.id === id
                ? { ...reply, likes: liked ? reply.likes - 1 : reply.likes + 1 }
                : reply
            )
          );
        } else if (mainStream) {
          setMainStream((prevStream) =>
            prevStream ? { ...prevStream, likes: liked ? prevStream.likes - 1 : prevStream.likes + 1 } : prevStream
          );
        }
      }
    } catch (error) {
      console.error('Error liking the stream:', error);
    }
  };

  // Handle downvote button toggle for both main stream and replies
  const handleDownvoteToggle = async (id: number, isReply: boolean) => {
    const stream = isReply
      ? replies.find((reply) => reply.id === id)
      : mainStream;

    if (!stream || !account?.address) return;

    const downvoted = stream.downvotes > 0;

    if (stream.streamer.wallet.toLowerCase() === account?.address.toLowerCase()) {
      return;
    }

    try {
      const downvoteStatus = downvoted ? 0 : 1;
      const downvoteData = {
        owner: ownerWallet,
        liker: account?.address,
        stream: id,
        status: downvoteStatus,
      };

      const response = await axios.post(
        'https://api.visioncommunity.xyz/v02/community/stream/downvote',
        downvoteData
      );

      if (response.data.success) {
        const { energy_spent, reputation_earned_by_downvoter } = response.data;

        updateEnergy(-energy_spent);
        updateReputation(reputation_earned_by_downvoter);

        if (isReply) {
          setReplies((prevReplies) =>
            prevReplies.map((reply) =>
              reply.id === id
                ? { ...reply, downvotes: downvoted ? reply.downvotes - 1 : reply.downvotes + 1 }
                : reply
            )
          );
        } else if (mainStream) {
          setMainStream((prevStream) =>
            prevStream ? { ...prevStream, downvotes: downvoted ? prevStream.downvotes - 1 : prevStream.downvotes + 1 } : prevStream
          );
        }
      }
    } catch (error) {
      console.error('Error downvoting the stream:', error);
    }
  };

  // Handle posting a new reply
const handleAddReply = async () => {
  if (!account?.address || !newReply.trim()) {
    alert('Message cannot be empty');
    return;
  }

  try {
    setTransactionPending(true);

    const timestamp = Math.floor(Date.now() / 1000);
    const signedMessage = `Posting at ${timestamp}`;
    const signature = await signMessage({
      account,
      message: signedMessage,
    });

    // Ensure `uploadedImageUrl` contains the correct image URL (from the upload response)
    const postData = {
      walletAddress: account?.address,
      signature,
      message: newReply,
      media: uploadedImageUrl || null, // Uploaded image URL should be set here
      media_kind: uploadedImageUrl ? 'image' : null, // Set media_kind as 'image'
      community: ownerWallet, // The community this reply is being posted to
      reply_to: streamId, // ID of the stream being replied to
      timestamp,
    };

    const response = await axios.post(
      'https://api.visioncommunity.xyz/community/stream/reply/post',
      postData
    );

    if (response.data.success) {
      const { energy_spent, reputation_earned_by_user } = response.data;
      updateEnergy(-energy_spent); // Decreases energy by the amount spent
      updateReputation(reputation_earned_by_user); // Increases reputation by the earned amount
      setNewReply(''); // Clear the reply input
      setUploadedImageUrl(null); // Clear the uploaded image URL
      setImagePreview(null); // Clear the image preview
      setReload((prev) => !prev);
setTransactionPending(false);
    }
  } catch (error) {
    console.error('Error posting reply:', error);
  } finally {
    setLoading(false);
  }
};



// In the image input handler
const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setImagePreview(URL.createObjectURL(file)); // Show preview
    handleImageUpload(file); // Upload the image
  }
};

// Function to handle image upload
  const handleImageUpload = async (file: File) => {
    setMediaUploading(true);

    try {
      const formData = new FormData();
      formData.append('banner', file);
      formData.append('walletAddress', account?.address || '');

      const uploadResponse = await axios.post(
        'https://api.visioncommunity.xyz/v02/image/user/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (uploadResponse.data.success) {
        const imageUrl = uploadResponse.data.fileUrl;
        setUploadedImageUrl(imageUrl);
        setImagePreview(URL.createObjectURL(file));
        setImageError(null);
      } else {
        setImageError('Failed to upload image.');
      }
    } catch (error) {
      setImageError('Error uploading image. Please try again.');
    } finally {
      setLoading(false);
      setMediaUploading(false);
    }
  };



  // Render the main stream and replies
return (
  <div className="msgmural">
    {loading || isValidPatron === null ? ( // Show loading spinner if still loading or checking patron status
      <CircularProgress />
    ) : (
      <>
        {mainStream && (
          <Card sx={{ mb: 2, padding: 2 }}>
            <Box display="flex" alignItems="center">
              <Link to={`/profile/${mainStream.streamer.wallet}`}>
                <Avatar src={mainStream.streamer.avatar} sx={{ mr: 2 }} />
              </Link>
              <Box sx={{ flex: 1 }}>
                <Box display="flex" alignItems="center">
                  <Link to={`/profile/${mainStream.streamer.wallet}`}>
                    <Typography variant="body1" fontWeight="bold" sx={{ mr: 2 }}>
                      {mainStream.streamer.basename || shortenWallet(mainStream.streamer.wallet)}
                    </Typography>
                  </Link>
                  <Box display="flex" alignItems="center">
                    {mainStream.streamer.badges.map((badge, index) => (
                      <Avatar key={index} src={badge.image} sx={{ width: 20, height: 20, mr: 1 }} />
                    ))}
                  </Box>
                </Box>
                <Typography variant="caption">
                  {new Date(mainStream.date).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ mt: 1 }}>
              {mainStream.content}
            </Typography>

            {mainStream.media && mainStream.media_kind === 'image' && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={mainStream.media}
                  alt="stream media"
                  style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                />
              </Box>
            )}

            <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
              <IconButton onClick={() => handleLikeToggle(mainStream.id, false)} sx={{ color: mainStream.likes > 0 ? '#0070f3' : 'inherit' }}>
                {mainStream.likes > 0 ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="caption">{mainStream.likes}</Typography>

              <IconButton onClick={() => handleDownvoteToggle(mainStream.id, false)} sx={{ ml: 2, color: mainStream.downvotes > 0 ? 'red' : 'inherit' }}>
                {mainStream.downvotes > 0 ? <ThumbDownAltIcon /> : <ThumbDownOffAltIcon />}
              </IconButton>
              <Typography variant="caption">{mainStream.downvotes}</Typography>
            </Box>
          </Card>
        )}

        {isValidPatron ? ( // If user is a valid patron, show the reply section
          <Card sx={{ mb: 2, padding: 2 }}>
            <TextField
              fullWidth
              placeholder="Post a reply..."
              multiline
              rows={3}
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            {imagePreview && (
              <Box sx={{ mb: 2 }}>
                <img
                  src={imagePreview}
                  alt="Selected"
                  style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                />
              </Box>
            )}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <div>
                <IconButton color="primary" component="label">
                  <AddPhotoAlternateIcon />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImagePreview(URL.createObjectURL(file));
                        handleImageUpload(file);
                      }
                    }}
                  />
                </IconButton>

                <IconButton color="primary" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  <EmojiEmotionsIcon />
                </IconButton>

                {showEmojiPicker && (
                  <Box ref={pickerRef} sx={{ position: 'absolute', zIndex: 1 }}>
                    <Picker onEmojiClick={handleEmojiClick} />
                  </Box>
                )}
              </div>

              <Button
                variant="contained"
                onClick={handleAddReply}
                disabled={mediaUploading || transactionPending}
              >
                {mediaUploading ? "Uploading media..." : transactionPending ? "Awaiting confirmation..." : "Post Reply"}
              </Button>
            </Box>
          </Card>
        ) : ( // If user is not a valid patron, show the message
<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    mt: 4,
  }}
>
  <img
    src="https://patron.visioncommunity.xyz/img/vp-logo.png"
    alt="Not a valid patron"
    style={{ maxWidth: '200px', marginBottom: '16px' }}
  />
  <Typography variant="h6" gutterBottom>
    You cannot comment on this post because it was published in a community where you are not yet a valid patron.
  </Typography>
  <Button
    variant="contained"
    onClick={() => window.location.href = `/communities/${ownerWallet}`}
    className="btnpatronme"
  >
    See the community
  </Button>
</Box>

        )}

        {replies.map((reply) => (
          <Card
            key={reply.id}
            sx={{
              mb: 2,
              padding: 2,
              backgroundColor: '#111',
              color: '#fff',
              boxShadow: 'none',
              border: 'none'
            }}
          >
            <Box display="flex" alignItems="center">
              <Link to={`/profile/${reply.streamer.wallet}`}>
                <Avatar src={reply.streamer.avatar} sx={{ mr: 2 }} />
              </Link>
              <Box sx={{ flex: 1 }}>
                <Box display="flex" alignItems="center">
                  <Link to={`/profile/${reply.streamer.wallet}`}>
                    <Typography variant="body1" fontWeight="bold" sx={{ mr: 2 }}>
                      {reply.streamer.basename || shortenWallet(reply.streamer.wallet)}
                    </Typography>
                  </Link>
                  <Box display="flex" alignItems="center">
                    {reply.streamer.badges.map((badge, index) => (
                      <Avatar key={index} src={badge.image} sx={{ width: 20, height: 20, mr: 1 }} />
                    ))}
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#aaa' }}>
                  {new Date(reply.date).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ mt: 1 }}>
              {reply.content}
            </Typography>

            {reply.media && reply.media_kind === 'image' && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={reply.media}
                  alt="reply media"
                  style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                />
              </Box>
            )}

            <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
              <IconButton onClick={() => handleLikeToggle(reply.id, true)} sx={{ color: reply.likes > 0 ? '#0070f3' : 'inherit' }}>
                {reply.likes > 0 ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="caption">{reply.likes}</Typography>

              <IconButton onClick={() => handleDownvoteToggle(reply.id, true)} sx={{ ml: 2, color: reply.downvotes > 0 ? 'red' : 'inherit' }}>
                {reply.downvotes > 0 ? <ThumbDownAltIcon /> : <ThumbDownOffAltIcon />}
              </IconButton>
              <Typography variant="caption">{reply.downvotes}</Typography>
            </Box>
            <hr className="sep" />
          </Card>
        ))}
      </>
    )}
  </div>
);

};

export default Streams;
