import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
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
    Tabs,
  Tab,

} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import EditIcon from '@mui/icons-material/Edit';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import Picker, { EmojiClickData } from 'emoji-picker-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useUserStatus } from '../../context/UserStatusContext';
import { useActiveAccount } from 'thirdweb/react';
import { signMessage } from 'thirdweb/utils';
import explore from '../../assets/images/explore.png';
import { parseISO, formatDistanceToNow, addMinutes } from 'date-fns';


interface CommunityMessagesProps {
  userWallet: string;
}

const shortenWallet = (wallet: string) => `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

const CommunityMessages: React.FC<CommunityMessagesProps> = ({ userWallet }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [visibleMessages, setVisibleMessages] = useState(50);
  const [selectedCommunity, setSelectedCommunity] = useState<string>(''); 
  const [communities, setCommunities] = useState<any[]>([]); 
  const [mediaUploading, setMediaUploading] = useState<boolean>(false); 
  const { updateEnergy, updateReputation } = useUserStatus(); 
  const account = useActiveAccount();
  const [reload, setReload] = useState<boolean>(false);
  const [isMobileCardOpen, setIsMobileCardOpen] = useState<boolean>(false);
const [isPortrait, setIsPortrait] = useState(false);
const [showFullContent, setShowFullContent] = useState(false);
const [activeTab, setActiveTab] = useState<number>(0);

const formatMessageContent = (content: string) => {
  const mentionRegex = /@([a-zA-Z0-9._-]+\.base\.eth)\b/g;
  const urlRegex = /((https?:\/\/|www\.)[^\s]+|[^\s]+?\.(com|io|xyz|net|org|edu|gov|co|info)(\/[^\s]*)?)/g;

  return content
    .replace(mentionRegex, '<a href="/profile/$1">@$1</a>') // Replace @mentions with profile links
    .replace(urlRegex, (url) => {
      const href = url.startsWith('http') ? url : `http://${url}`; // Add http:// if missing
      return `<a href="${href}" target="_blank" rel="nofollow">${url}</a>`;
    });
};

  // Function to handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setReload((prev) => !prev); // Trigger reload to fetch data for the new tab
  };
  
const handleToggleContent = () => {
  setShowFullContent((prev) => !prev);
};

// Function to handle image load and determine aspect ratio
const handleImageLoad = (event) => {
  const { naturalWidth, naturalHeight } = event.target;
  setIsPortrait(naturalHeight > naturalWidth);
};

// timeago to handle msg data
const timeAgo = (dateString: string) => {
  // Parse the server-provided date string
  const dateUTCPlus1 = parseISO(dateString);

  // Add 60 minutes to account for the server's UTC+1 offset
  const adjustedDate = addMinutes(dateUTCPlus1, -60);

  // Calculate the "time ago" format using formatDistanceToNow
  return formatDistanceToNow(adjustedDate, { addSuffix: true });
};














  // Fetch messages and communities
  useEffect(() => {
    const fetchMessagesAndCommunities = async () => {
      setLoading(true);
      const fetchUrl = activeTab === 0
        ? `https://api.visioncommunity.xyz/v02/user/get/foryou/all?user_wallet=${userWallet}&limit=50&offset=0`
        : `https://api.visioncommunity.xyz/v02/user/get/streams/all?user_wallet=${userWallet}&limit=50&offset=0`;

      try {
        const [messageResponse, communityResponse] = await Promise.all([
          axios.get(fetchUrl),
          axios.get(`https://api.visioncommunity.xyz/v02/user/get?wallet=${userWallet}`)
        ]);

        if (messageResponse.data.success) {
          const fetchedMessages = messageResponse.data.data;
          const updatedMessages = await fetchLikeAndDownvoteStatuses(fetchedMessages);
          setMessages(updatedMessages);
        }

        if (communityResponse.data.success) {
          const userCommunities = communityResponse.data.patronCommunities.filter(
            (community) => community.patron_is_member
          );
          setCommunities(userCommunities);
        }

      } catch (error) {
        console.error('Error fetching messages or communities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessagesAndCommunities();
  }, [userWallet, reload, activeTab]);



  // Fetch like/downvote statuses
const fetchLikeAndDownvoteStatuses = async (fetchedMessages) => {
  if (!account?.address || fetchedMessages.length === 0) return fetchedMessages;

  const owner = fetchedMessages[0]?.community.owner;
  const likeCheckPayload = {
    owner,
    liker: account?.address,
    streams: fetchedMessages.map((msg) => msg.id),
  };

  try {
    const [likeResponse, downvoteResponse] = await Promise.all([
      axios.post('https://api.visioncommunity.xyz/v02/community/stream/like/check', likeCheckPayload),
      axios.post('https://api.visioncommunity.xyz/v02/community/stream/downvote/check', likeCheckPayload),
    ]);

    if (likeResponse.data.success && downvoteResponse.data.success) {
      const likedStreams = new Set();
      const downvotedStreams = new Set();

      // Check if likeResponse.data.likes is defined and is an object
      if (likeResponse.data.likes && typeof likeResponse.data.likes === 'object') {
        for (const streamId in likeResponse.data.likes) {
          if (likeResponse.data.likes[streamId]) {
            likedStreams.add(parseInt(streamId, 10));
          }
        }
      }

      // Check if downvoteResponse.data.downvotes is defined and is an object
      if (downvoteResponse.data.downvotes && typeof downvoteResponse.data.downvotes === 'object') {
        for (const streamId in downvoteResponse.data.downvotes) {
          if (downvoteResponse.data.downvotes[streamId]) {
            downvotedStreams.add(parseInt(streamId, 10));
          }
        }
      }

      // Update each message with the correct isLiked and isDownvoted status
      return fetchedMessages.map((msg) => ({
        ...msg,
        isLiked: likedStreams.has(msg.id),
        isDownvoted: downvotedStreams.has(msg.id),
      }));
    } else {
      // If the API response is not successful, return the original messages without changes
      return fetchedMessages;
    }
  } catch (error) {
    console.error('Error fetching like/downvote statuses:', error);
    return fetchedMessages;
  }
};



  // Image upload function
  const handleImageUpload = async (file: File) => {
    setLoading(true);
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

// Close emoji picker if clicked outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
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


const handleAddMessage = async () => {
  if (!account?.address || !selectedCommunity) {
    alert("Wallet is not connected or community is not selected");
    return;
  }

  if (newMessage.trim() || uploadedImageUrl) {
    try {
      setLoading(true);

      const timestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp
      const signedMessage = `Posting at ${timestamp}`;
      const signature = await signMessage({
        account,
        message: signedMessage,
      });

      const postData = {
        walletAddress: account?.address, // Send the connected wallet address
        signature,
        message: newMessage,
        media: uploadedImageUrl || null, // Include media if an image was uploaded
        media_kind: uploadedImageUrl ? 'image' : null, // Assume it's an image if media is selected
        community: selectedCommunity, // Use the selected community's wallet
        timestamp, // Send the timestamp along with the request
      };

      const response = await axios.post(
        'https://api.visioncommunity.xyz/community/stream/postv2',
        postData
      );

      if (response.data.success) {
        const { energy_spent, reputation_earned_by_user } = response.data;
        updateEnergy(-energy_spent); // Decrease energy
        updateReputation(reputation_earned_by_user); // Increase reputation

        setNewMessage('');
        setUploadedImageUrl(null); // Reset uploaded image URL
        setImagePreview(null); // Reset image preview
        setReload((prev) => !prev); // Toggle reload state to refresh messages
        
        return true;
      } else {
        console.error('Failed to post stream:', response.data.message);
      }
    } catch (error) {
      console.error('Error posting message:', error);
    } finally {
      setLoading(false);
    }
  }
};



  // Handle image input change
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  // Handle like button toggle
  const handleLikeToggle = async (id: number) => {
    const likedMessage = messages.find((msg) => msg.id === id);
    if (!likedMessage || !account?.address) return;

    const liked = likedMessage.isLiked;

    try {
      const likeStatus = liked ? 0 : 1;
      const likeData = {
        owner: likedMessage.community.owner,
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

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === id
              ? {
                  ...msg,
                  stream: {
                    ...msg.stream,
                    likes: liked ? msg.stream.likes - 1 : msg.stream.likes + 1,
                  },
                  isLiked: !liked,
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error liking the stream:', error);
    }
  };

  // Handle downvote toggle
  const handleDownvoteToggle = async (id: number) => {
    const downvotedMessage = messages.find((msg) => msg.id === id);
    if (!downvotedMessage || !account?.address) return;

    const downvoted = downvotedMessage.isDownvoted;

    if (downvotedMessage.streamer.wallet.toLowerCase() === account?.address.toLowerCase()) {
      return;
    }

    try {
      const downvoteStatus = downvoted ? 0 : 1;
      const downvoteData = {
        owner: downvotedMessage.community.owner,
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

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === id
              ? {
                  ...msg,
                  stream: {
                    ...msg.stream,
                    downvotes: downvoted ? msg.stream.downvotes - 1 : msg.stream.downvotes + 1,
                  },
                  isDownvoted: !downvoted,
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error downvoting the stream:', error);
    }
  };

  // Load more messages when "Load More" button is clicked
  const loadMore = () => {
    setVisibleMessages((prev) => Math.min(prev + 20, messages.length));
  };

  return (
    <div className="msgmural">
    
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
    
    
    
    
    
    
    
    
    
    
    
    
    
      {/* Message Input Card */}
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


{/* Cancel Button for Mobile */}
<Box
  sx={{
    display: { xs: 'flex', md: 'none' },
    justifyContent: 'space-between',
    gap: 1,
    mt: 2,
    marginTop: '20px',
    marginBottom: '20px',
  }}
>
  <Button
    variant="text"
    onClick={() => setIsMobileCardOpen(false)}
    sx={{ flex: 1 }}
  >
    Cancel
  </Button>
<Button
  variant="contained"
  onClick={async () => {
    const success = await handleAddMessage();
    if (success) {
      setIsMobileCardOpen(false);
    }
  }}
  className="btnpatronme"
  disabled={loading || mediaUploading || !selectedCommunity}
  sx={{ flex: 1 }} // Takes equal space as the cancel button
>
  {mediaUploading ? 'Uploading media...' : loading ? '...' : 'Post'}
</Button>
</Box>




        <TextField
          fullWidth
          placeholder="Share your thoughts with some community..."
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
              style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
            />
          </Box>
        )}
        
        
                    {selectedCommunity && (
                    <Box
                      display="flex"
                      alignItems="center"
                      sx={{
                        marginLeft: '20px',
                      }}
                    >
  <Avatar 
    src={communities.find(c => c.owner === selectedCommunity)?.avatar} 
    sx={{ width: 18, height: 18, mr: 1 }} 
  />
  <Typography variant="body2" sx={{ mr: 2 }}>
    <span className="communitminibox at">Posting in /{communities.find(c => c.owner === selectedCommunity)?.basename || shortenWallet(selectedCommunity)}</span>
  </Typography>
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
  <Box ref={pickerRef} sx={{ position: 'absolute', zIndex: 1 }}>
    <Picker
      onEmojiClick={(emojiData: EmojiClickData) =>
        setNewMessage((prev) => prev + emojiData.emoji)
      }
    />
  </Box>
)}
          </div>
          <Box display="flex" alignItems="center">

<FormControl sx={{ minWidth: 150 }}>
  <Select
    value={selectedCommunity}
    onChange={(e) => setSelectedCommunity(e.target.value)}
    displayEmpty
    sx={{
      fontFamily: 'BaseFont, sans-serif', // Apply your custom font
      fontSize: '13px',
      '& .MuiSelect-select': {
        fontFamily: 'BaseFont, sans-serif',
      },
      '& fieldset': {
        border: 'none', // Remove the border
      },
    }}
    renderValue={(value) =>
      value
        ? communities.find((c) => c.owner === value)?.basename || shortenWallet(value)
        : 'Select community' // Display "Select community" when no value is selected
    }
  >
    {/* Placeholder option when no community is selected */}
    <MenuItem value="" disabled>
      Select community
    </MenuItem>

    {communities.length > 0 ? (
      communities.map((community) => (
        <MenuItem
          key={community.owner}
          value={community.owner}
          sx={{
            fontFamily: 'BaseFont, sans-serif', // Apply your custom font
            fontSize: '13px',
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            sx={{
              fontFamily: 'BaseFont, sans-serif', // Apply your custom font
              fontSize: '13px',
            }}
          >
            <Avatar src={community.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
            {community.basename || shortenWallet(community.owner)}
          </Box>
        </MenuItem>
      ))
    ) : (
      <MenuItem disabled>Any found.</MenuItem>
    )}
  </Select>
</FormControl>
            <Button
              variant="contained"
              onClick={handleAddMessage}
              className="btnpatronme"
              disabled={loading || mediaUploading || !selectedCommunity}
              sx = {{display: { xs: 'none', md: 'block' }}}
            >
              {mediaUploading
                ? 'Uploading media...'
                : loading
                ? '...'
                : 'Post'}
            </Button>
          </Box>
        </Box>
        
        

      </Card>














      {/* Messages List */}
<Tabs
  value={activeTab}
  onChange={handleTabChange}
  textColor="inherit"
  indicatorColor="primary"
  variant="fullWidth" // Makes the tabs full width
  sx={{
    width: { xs: '100%', sm: 'auto' },
    '& .MuiTab-root': {
      color: 'gray',
    },
    '& .Mui-selected': {
      color: '#3873f5',
    },
    '& .MuiTabs-indicator': {
      backgroundColor: '#3873f5 ', 
    },
  }}
>
  <Tab label="For You" className="msgtab"/>
  <Tab label="Communities" className="msgtab"/>
</Tabs>
      {loading ? (
        <CircularProgress />
      ) : messages.length === 0 ? (
		  <Box sx={{ textAlign: 'center', mt: 2 }}>
		  <div className="explorecommunities">
		  It's a bit quiet here...
		  	<Image src={explore} className="imgexplorehome"/>
		  	Explore communities to find a place to call your own, collect NFT Shards and connect with others members
		  	<Link to="/communities/"><Button className="btnpatronme">Explore Communities</Button></Link>
		  </div>
		  
		  </Box>
		) : (
        messages.slice(0, visibleMessages).map((msg) => {
          const communityName =
            msg.community.customname ||
            msg.community.basename ||
            shortenWallet(msg.community.owner);
          const userName = msg.streamer.basename || shortenWallet(msg.streamer.wallet);

          return (
    <Card key={msg.id} sx={{ mb: 2, padding: 2 }} className="msgmuralind">
      <Box display="flex" alignItems="center">
        {/* User avatar */}
        <Link to={`/profile/${msg.streamer.wallet}`}>
          <Avatar src={msg.streamer.avatar} sx={{ mr: 2 }} />
        </Link>

        {/* Username, badges, and community */}
        <Box sx={{ flex: 1 }}>
          <Box display="flex" alignItems="center">
            {/* Username */}
            <Link to={`/profile/${msg.streamer.wallet}`}>
              <Typography
                variant="body1"
                fontWeight="bold"
                sx={{ mr: 2 }}
                className="basestylefont usernamemural"
              >
                {userName}
              </Typography>
            </Link>

            {/* Badges */}
            <Box display="flex" alignItems="center" sx={{ mr: 2 }}>
              {msg.streamer.badges.map((badge: any, index: number) => (
                <Avatar
                  key={index}
                  src={badge.image}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    marginRight: '8px',
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Date and Community */}
          <Box display="flex" alignItems="center"  mt={0.5}>
            {/* Date */}
            <Link to={`/communities/${msg.community.owner}/stream/${msg.id}`}>
              <Typography variant="caption" className="white datetime">
                {timeAgo(msg.stream.date)}
              </Typography>
            </Link>

            {/* Community Avatar and Name */}
            <Box
              display="flex"
              alignItems="center"
              sx={{
                backgroundColor: '#333',
                padding: '3px 7px',
                borderRadius: '50px',
                marginLeft: '8px',
              }}
            >
              <span className="communitminibox at">in</span>
              <Link to={`/communities/${msg.community.owner}`}>
                <Avatar
                  src={msg.community.avatar}
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    marginRight: '5px',
                  }}
                />
              </Link>
              <Typography variant="body2" className="communitminibox">
                <Link to={`/communities/${msg.community.owner}`}>
                  /{communityName}
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

    {/* Message content */}
<Typography
  variant="body2"
  className="msgcontentformat"
  sx={{ mt: 1 }}
  dangerouslySetInnerHTML={{
    __html: showFullContent
      ? formatMessageContent(msg.stream.content)
      : `${formatMessageContent(msg.stream.content.slice(0, 250))}${msg.stream.content.length > 250 ? '...' : ''}`,
  }}
/>

    {/* "View More" button */}
    {msg.stream.content.length > 250 && !showFullContent && (
      <Button
        variant="text"
        onClick={handleToggleContent}
        sx={{ mt: 1, padding: 0 }}
        className="viewmorebtn"
      >
        Show More
      </Button>
    )}

    {/* "View Less" button */}
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

      {/* Media content */}
  {msg.stream.media && msg.stream.media_kind === 'image' && (
    <Box sx={{ mt: 2 }}>
      <img
        src={msg.stream.media}
        alt="stream media"
        className="feedimg"
        onLoad={handleImageLoad}
        style={{
          maxWidth: '100%',
          maxHeight: isPortrait ? '500px' : '300px',
          objectFit: isPortrait ? 'cover' : 'contain',
        }}
      />
    </Box>
  )}

      {/* Like, Downvote, and Comment icons */}
      <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
        {/* Comment Icon */}
        <Link to={`/communities/${msg.community.owner}/stream/${msg.id}`}>
          <IconButton sx={{ display: 'flex', alignItems: 'center' }} className="white">
            <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ ml: 1 }}>
              {msg.stream.replies}
            </Typography>
          </IconButton>
        </Link>

        {/* Like Button */}
        <IconButton
          onClick={() => handleLikeToggle(msg.id)}
          sx={{ display: 'flex', alignItems: 'center', ml: 2 }}
          className="white"
        >
          {msg.isLiked ? (
            <FavoriteIcon sx={{ fontSize: 18, color: '#0070f3' }} />
          ) : (
            <FavoriteBorderIcon sx={{ fontSize: 18 }} />
          )}
          <Typography variant="caption" sx={{ ml: 1 }}>
            {msg.stream.likes}
          </Typography>
        </IconButton>

        {/* Downvote Button */}
        <IconButton
          onClick={() => handleDownvoteToggle(msg.id)}
          sx={{ display: 'flex', alignItems: 'center', ml: 2 }}
          className="white"
        >
          {msg.isDownvoted ? (
            <ThumbDownAltIcon sx={{ fontSize: 18, color: 'red' }} />
          ) : (
            <ThumbDownOffAltIcon sx={{ fontSize: 18 }} />
          )}
          <Typography variant="caption" sx={{ ml: 1 }}>
            {msg.stream.downvotes}
          </Typography>
        </IconButton>
      </Box>
    </Card>
          );
        })
      )}

      {/* Show Load More button if there are more messages */}
      {visibleMessages < messages.length && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" onClick={loadMore}>
            Load More
          </Button>
        </Box>
      )}
    </div>
  );
};

export default CommunityMessages;
