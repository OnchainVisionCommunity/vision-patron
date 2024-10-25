// src/components/communitypage/CommunityHeader.tsx
import React, { useState, useEffect } from "react";
import {
  Avatar,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { useDropzone } from "react-dropzone";
import { useActiveAccount } from "thirdweb/react";
import { format } from 'date-fns';
import { signMessage } from "thirdweb/utils";

interface SocialMedia {
  twitter?: {
    status: string;
    account: string;
  };
  instagram?: {
    status: string;
    account: string;
  };
  warpcast?: {
    status: string;
    account: string;
  };
  lunchbreak?: {
    status: string;
    account: string;
  };
}

interface CommunityData {
  avatar: string;
  owner: string;
  description: string;
  settings: string; // settings is stored as a string (likely JSON)
  basename?: string;
  total_tips_all_time: number;
  total_tips_last_30_days: number;
  category?: string; 
  reputation_15min: number;
  reputation_1hour: number;
  reputation_1day: number;
  reputation_7days: number;
  normalized_reputation: number;
  community_reputation: number;
}

interface CommunityHeaderProps {
  communityData: CommunityData;
  isOwner: boolean;
}


const ReputationChart = ({ communityWallet }) => {
  const [data, setData] = useState([]);
  const [interval, setInterval] = useState("15M"); // Default interval: 15 minutes
  const [loading, setLoading] = useState(false);

  // Function to fetch data from the backend API
const fetchReputationData = async (interval) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.visioncommunity.xyz/v02/community/get/reputation/history?wallet=${communityWallet}&interval=${interval}`
      );

      if (response.data.success && response.data.data.length > 0) {
        // Use the data directly as provided by the API
        setData(response.data.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch reputation data:", error);
      setData([]);
    }
    setLoading(false);
  };

  // Fetch data whenever the interval changes
  useEffect(() => {
    fetchReputationData(interval);
  }, [interval]); // Only run when 'interval' changes

  return (
<Box 
  mt={3} 
  width="100%"
  sx={{
    borderTop: '1px solid #ccc', // Add a top border
  }}
>
<Box mt={3} width="100%">
  <Box display="flex" justifyContent="center" alignItems="center" mb={2} gap={0}>
    <div className="reptitleot" style={{ marginRight: 10 }}>Reputation Chart</div>
<ButtonGroup
  variant="contained"
  aria-label="interval selection"
  disableElevation // Disable elevation (box-shadow)
  disableRipple // Disable ripple effect
  sx={{
    boxShadow: 'none', // Remove any box shadow from ButtonGroup
    border: 'none', // Remove any default border from ButtonGroup
  }}
>
  <Button
    onClick={() => setInterval("15M")}
    color={interval === "15M" ? "primary" : "inherit"}
    sx={{
      backgroundColor: interval === "15M" ? '#3873f5' : '#e0e0e0',
      '&:hover': {
        backgroundColor: interval === "15M" ? '#115293' : '#bdbdbd',
      },
      '&:focus': {
        outline: 'none',
        borderColor: '#ccc',
      },
      '&:active': {
        borderColor: '#ccc',
      },
      borderTopLeftRadius: '50px',
      borderBottomLeftRadius: '50px',
      boxShadow: 'none',
      border: '1px solid #ccc',
      borderRight: 'none',
    }}
    className="btn15mchart"
  >
    15M
  </Button>
  <Button
    onClick={() => setInterval("1H")}
    color={interval === "1H" ? "primary" : "inherit"}
    sx={{
      backgroundColor: interval === "1H" ? '#3873f5' : '#e0e0e0',
      '&:hover': {
        backgroundColor: interval === "1H" ? '#115293' : '#bdbdbd',
      },
      '&:focus': {
        outline: 'none',
        borderColor: '#ccc',
      },
      '&:active': {
        borderColor: '#ccc',
      },
      borderRadius: '0px',
      boxShadow: 'none',
      border: '1px solid #ccc',
    }}
    className="btn1hchart"
  >
    1H
  </Button>
  <Button
    onClick={() => setInterval("1D")}
    color={interval === "1D" ? "primary" : "inherit"}
    sx={{
      backgroundColor: interval === "1D" ? '#3873f5' : '#e0e0e0',
      '&:hover': {
        backgroundColor: interval === "1D" ? '#115293' : '#bdbdbd',
      },
      '&:focus': {
        outline: 'none',
        borderColor: '#ccc',
      },
      '&:active': {
        borderColor: '#ccc',
      },
      borderTopRightRadius: '50px',
      borderBottomRightRadius: '50px',
      boxShadow: 'none',
      border: '1px solid #ccc',
      borderLeft: 'none',
    }}
    className="btn1dchart"
  >
    1D
  </Button>
</ButtonGroup>


  </Box>
</Box>



<ResponsiveContainer width="100%" height={300}>
  {loading ? (
    <div>Loading...</div>
  ) : (
    data.length === 0 ? (
      // Show message if there is no data
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
      >
        No reputation data in this community yet
      </Box>
    ) : (
      <LineChart data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis 
          dataKey="time" 
          tick={{
            fontSize: 12,
            fontFamily: 'Arial',
          }}
          tickFormatter={(time) => {
            const date = new Date(time);
            if (interval === "1D") {
              return format(date, 'MMM dd, HH:mm');
            } else {
              return format(date, 'HH:mm');
            }
          }}
        />
        <YAxis 
          tick={{
            fontSize: 12, // Set the font size for the vertical axis
            fontFamily: 'Arial', // Optionally set a different font family
          }}
          tickFormatter={(value) => {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + ' mil';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k';
            }
            return value.toString();
          }}
        />
        <RechartsTooltip 
          formatter={(value) => 
            value >= 1000000
              ? (value / 1000000).toFixed(1) + ' mil'
              : value >= 1000
              ? (value / 1000).toFixed(1) + 'k'
              : value
          }
        />
        <Line 
          type="monotone" 
          dataKey="reputation" 
          stroke="#8884d8" 
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    )
  )}
</ResponsiveContainer>

    </Box>
  );
};

export default function CommunityHeader({ communityData, isOwner }: CommunityHeaderProps) {
  const [openAnnouncementDialog, setOpenAnnouncementDialog] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [cta, setCta] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [banner, setBanner] = useState<string | null>(null); 
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [announcementResult, setAnnouncementResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const account = useActiveAccount(); 
  const [newModalOpen, setNewModalOpen] = useState(false);

  let socialMedia: SocialMedia = {};
  let patronMessage = "Patron at least 100 $VISION to unlock this community"; 

  try {
    const settings = JSON.parse(communityData.settings);
    socialMedia = settings.social || {};

    const patronFilter = settings.patron?.filter;
    const patronValue = settings.patron?.value || 100;
    patronMessage =
      patronFilter === "30d"
        ? `Patron at least ${patronValue} $VISION in the last 30 days to unlock this community`
        : `Patron at least ${patronValue} $VISION to unlock this community`;
  } catch (error) {
    console.error("Failed to parse settings or settings.social is null:", error);
  }

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const formatNumberWithCommas = (value: string | number) => {
    const parsedNumber = typeof value === "string" ? parseFloat(value) : value;
    if (parsedNumber >= 1000000) {
      return (parsedNumber / 1000000).toFixed(1) + " MIL";
    } else if (parsedNumber >= 1000) {
      return (parsedNumber / 1000).toFixed(1) + " K";
    }
    return parsedNumber.toString();
  };

const handleOpenNewModal = () => setNewModalOpen(true);
const handleCloseNewModal = () => setNewModalOpen(false);

  const handleOpenAnnouncementDialog = () => {
	  setOpenAnnouncementDialog(true);
	  setNewModalOpen(false);
  };

  const handleCloseAnnouncementDialog = () => {
    setOpenAnnouncementDialog(false);
  };

  const handleResultModalClose = () => {
    setResultModalOpen(false);
    window.location.reload(); 
  };

const handleCreateAnnouncement = async () => {
  setLoading(true);
  setAnnouncementResult(null);

  try {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const message = `Create announcement for community: ${communityData.owner} at ${currentTimestamp}`;

    // Use the SDK v5 signMessage utility
    if (!account || !account.address) {
      throw new Error("Wallet is not connected or account is unavailable");
    }

    // Attempt to sign the message
    let signature;
    try {
      signature = await signMessage({
        account,
        message,
      });
    } catch (signError) {
      throw new Error("Failed to sign the message. Please make sure your wallet is connected and try again.");
    }

    // Check if the signature is valid
    if (!signature || typeof signature !== "string") {
      throw new Error("Invalid signature returned. Signature might be undefined or of an unexpected format.");
    }

    // Make the API request to create the announcement
    const response = await axios.post("https://api.visioncommunity.xyz/v02/announcement/post", {
      walletAddress: communityData.owner,
      signature,
      message,
      community: communityData.owner,
      text: announcementText,
      banner,
      cta,
      cta_link: ctaLink,
      timestamp: currentTimestamp,
    });

    // Check if the response was successful
    if (response.data.success) {
      setAnnouncementResult("Announcement created successfully!");
    } else {
      setAnnouncementResult(`Error: ${response.data.message || "Failed to create announcement"}`);
    }
  } catch (error) {
    console.error("Announcement creation error:", error);
    setAnnouncementResult(`Error: ${error.message || "Failed to create announcement"}`);
  } finally {
    setLoading(false);
    setResultModalOpen(true);
  }
};



  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxSize: 5 * 1024 * 1024, 
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        uploadBanner(file);
      }
    },
    onDropRejected: () => {
      setBannerError("File size exceeds 5MB or invalid file type.");
    },
  });

  const uploadBanner = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("banner", file);
      formData.append("walletAddress", communityData.owner);

      const response = await axios.post("https://api.visioncommunity.xyz/v02/image/user/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setBanner(response.data.fileUrl);
      } else {
        setBannerError("Failed to upload banner. Please try again.");
      }
    } catch (error) {
      setBannerError("Error uploading banner. Please try again.");
    }
    return null;
  };

  const isCreateDisabled = announcementText.length < 10 || announcementText.length > 500 || loading;

  const recipient = communityData.basename || communityData.owner;
  const recipientType = communityData.basename ? "basename" : "wallet";

  const totalTips = formatNumberWithCommas(communityData.total_tips_all_time);
  const patronFilter = JSON.parse(communityData.settings)?.patron?.filter || "all_time";
  const lockMessage = patronFilter === "30d" ? "30 days" : "All time";

  return (
    <Card sx={{ width: "100%", marginBottom: 4 }}>
      <Grid container spacing={2}>
        {/* Avatar Section */}
        <Grid
          item
          xs={12}
          sm={4}
          md={3}
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          className="communityheaderavatarcontainer"
        >
          <Avatar
            alt={formatAddress(communityData.owner)}
            src={communityData.avatar || "https://www.strasys.uk/wp-content/uploads/2022/02/Depositphotos_484354208_S.jpg"}
            sx={{ width: 150, height: 150 }}
          />
                      {/* Social Media Icons as Images */}
            <Box mt={2} display="flex" gap={2} alignItems="center">
              {socialMedia?.twitter?.status === "yes" && (
                <a href={`https://twitter.com/${socialMedia.twitter.account}`} target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://patron.visioncommunity.xyz/img/icons/x-black.png"
                    alt="Twitter"
                    style={{ width: 28, height: 28 }}
                  />
                </a>
              )}
              {socialMedia?.instagram?.status === "yes" && (
                <a href={`https://instagram.com/${socialMedia.instagram.account}`} target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://patron.visioncommunity.xyz/img/icons/instagram-black.png"
                    alt="Instagram"
                    style={{ width: 28, height: 28 }}
                  />
                </a>
              )}
              {socialMedia?.warpcast?.status === "yes" && (
                <a href={`https://warpcast.com/${socialMedia.warpcast.account}`} target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://patron.visioncommunity.xyz/img/icons/warpcast-black.png"
                    alt="Warpcast"
                    style={{ width: 28, height: 28 }}
                  />
                </a>
              )}
              {socialMedia?.lunchbreak?.status === "yes" && (
                <a href={`https://lunchbreak.com/${socialMedia.lunchbreak.account}`} target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://patron.visioncommunity.xyz/img/icons/lunchbreak-black.png"
                    alt="Lunchbreak"
                    style={{ width: 28, height: 28 }}
                  />
                </a>
              )}
            </Box>
        </Grid>

        {/* Main Content Section */}
        <Grid item xs={12} sm={8} md={6} className="maincontentheadercommunity">
          <CardContent>
          <div className="headercommunitynamecontainer">
	            <Typography variant="h5" component="h2" gutterBottom className="headercommunityname">
	              /{communityData.customname || communityData.basename || formatAddress(communityData.owner)}
	            </Typography>
	            {/* Category display */}
	            {communityData.category && (
	              <Typography>
	                <span className="tagcathigh">{communityData.category}</span>
	              </Typography>
	            )}
           </div>            
            <Typography variant="body1" color="textSecondary" paragraph  className="headercommunitydescription">
              {communityData.description}
            </Typography>




            <Box mt={2}>
              <Typography variant="subtitle1" className="communityinfo headercommunityinfo">
                <strong>Owner:</strong> {formatAddress(communityData.owner)}<br />
              </Typography>
            </Box>
            
{/* Indicators */}
              <Typography variant="subtitle1" className="communityinfo headercommunityinfo">
                <strong>Reputation Indicators:</strong><br />
              </Typography>
<Box
  display="inline-flex"
  justifyContent="flex-start"
  mb={0}
  className="communitindicators"
  sx={{
    color: '#000',
    border: '1px solid black',
    borderRadius: '5px',
    gap: '0px',
    width: { xs: '100%', sm: 'auto' }, // Full width on mobile, auto on desktop
    padding: '0px',
    overflow: 'hidden',
    '& > *': {
      flex: { xs: 1, sm: 'initial' }, // Make all child elements take equal space on mobile
      maxWidth: { xs: '100%', sm: 'initial' }, // Ensure each child can fill the entire box on mobile
    },
  }}
>
  {[
    { title: "15M", value: !isNaN(parseFloat(communityData.reputation_15min)) ? parseFloat(communityData.reputation_15min).toFixed(1) : "0.0", label: "Reputation 15Minutes" },
    { title: "1H", value: !isNaN(parseFloat(communityData.reputation_1hour)) ? parseFloat(communityData.reputation_1hour).toFixed(1) : "0.0", label: "Reputation 1Hour" },
    { title: "24H", value: !isNaN(parseFloat(communityData.reputation_1day)) ? parseFloat(communityData.reputation_1day).toFixed(1) : "0.0", label: "Reputation 1day" },
    { title: "7D", value: !isNaN(parseFloat(communityData.reputation_7days)) ? parseFloat(communityData.reputation_7days).toFixed(1) : "0.0", label: "Reputation 7Days" },
    { title: "Nor.", value: communityData && !isNaN(parseFloat(communityData.normalized_reputation)) ? parseFloat(communityData.normalized_reputation).toFixed(1) : "0.0", label: "Normalized Reputation (Min 0 - Max 100)" },
  ].map(({ title, value, label }, index) => (
    <Tooltip title={label} key={title}>
      <Box
        sx={{
          padding: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          flexGrow: 1, // Allow the element to grow equally on mobile
          flexShrink: 1, // Allow the element to shrink equally if needed
          width: { xs: '100%', sm: 'auto' }, // Full width on mobile, auto on desktop
          borderLeft: index !== 0 ? '1px solid black' : 'none', // Add left border except for the first item
        }}
      >
        <Typography className="indicatorProfileTitle">
          {title}
        </Typography>
        <Typography className="indicatorProfileNumber">
          {formatNumberWithCommas(value)}
        </Typography>
      </Box>
    </Tooltip>
  ))}
</Box>







            {isOwner && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Admin Options:
                </Typography>
                <Button
                  className="btnpatronme"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    const editUrl = `/communities/${communityData.owner}/edit`;
                    window.location.href = editUrl;
                  }}
                  startIcon={<EditIcon />}
                  sx={{ marginRight: 2 }}
                >
                  Edit Community
                </Button>

                <Button
                  variant="contained"
                  className="btnpatronme"
                  onClick={handleOpenNewModal}
                  startIcon={<AnnouncementIcon />}
                >
                  Create Announcement
                </Button>
                

              </Box>
            )}
          </CardContent>
        </Grid>

        {/* Patron Button Section */}
        <Grid
          item
          xs={12}
          sm={12}
          md={3}
          display="flex"
          justifyContent={{ xs: "center", md: "flex-end" }}
          className="mobpatronmedet"
          alignItems={{ xs: "center", md: "flex-end" }}
          sx={{
            mt: { xs: 2, md: 0 },
            mb: { xs: 2, md: 2 },
            pr: { md: 2 },
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" sx={{ width: "100%", textAlign: "center" }}>
            {/* Text with lock icon just above the button */}
            <Typography variant="body1" color="textSecondary" mb={1} display="flex" alignItems="center" className="patrontext">
              {patronMessage}
            </Typography>

            <Button
              variant="contained"
              className="btnpatronme"
              size="large"
              sx={{
                width: { xs: "100%", md: "auto" },
                maxWidth: { xs: "300px", md: "auto" },
              }}
              onClick={() => {
                const url = `/patron/?recipient=${recipient}&type=${recipientType}`;
                window.location.href = url;
              }}
            >
              Patron me onchain
            </Button>
          </Box>
        </Grid>
            {/* Reputation Chart */}
            <ReputationChart communityWallet={communityData.owner} />
      </Grid>

      {/* Create Announcement Dialog */}
      <Dialog open={openAnnouncementDialog} onClose={handleCloseAnnouncementDialog}>
        <DialogTitle className="basefont">Create Announcement</DialogTitle>
          <span className="detailan">When you click "Create," you'll need to sign with your wallet to publish your announcement. It will be visible to all patrons, who will also receive a notification (unless they have muted the community).</span>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Announcement Text*"
            type="text"
            fullWidth
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            helperText="Enter your announcement (10-500 characters)"
          />
          <TextField
            margin="dense"
            label="Call-to-Action Text*"
            type="text"
            fullWidth
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            helperText="Optional: Text for the call-to-action button"
          />
          <TextField
            margin="dense"
            label="Call-to-Action Link*"
            type="url"
            fullWidth
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
            helperText="Optional: URL link for the call-to-action button"
          />
          {/* Dropzone for Banner Upload */}
          <Box mt={2} textAlign="center" {...getRootProps()} sx={{ border: "2px dashed #ddd", padding: "10px", cursor: "pointer" }}>
            <input {...getInputProps()} />
            <Typography variant="body2" color="textSecondary">
              Drag 'n' drop a banner image, or click to select (JPG, PNG, GIF, max 5MB)
            </Typography>
          </Box>
          {bannerError && <Typography color="error">{bannerError}</Typography>}
          {banner && (
            <Box mt={2}>
              <Typography variant="body2">Preview:</Typography>
              <img src={banner} alt="Announcement Banner" style={{ width: "100%", height: "150px", objectFit: "cover" }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnnouncementDialog} disabled={loading} className="basefont">Cancel</Button>
          <Button onClick={handleCreateAnnouncement} variant="contained" color="primary" disabled={isCreateDisabled} className="btnpatronme">
            {loading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Result Modal */}
      <Dialog open={resultModalOpen} onClose={handleResultModalClose}>
        <DialogTitle>Announcement Status</DialogTitle>
        <DialogContent>
          <Typography>{announcementResult}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResultModalClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
<Dialog open={newModalOpen} onClose={handleCloseNewModal}>
  <DialogContent
    sx={{
      padding: 0, // Remove any padding from the DialogContent
    }}
  >
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={2}
      gap={2}
      sx={{
        width: '100%',
        maxWidth: 600, // Set a maximum width for the main container
        minWidth: 400, // Set a minimum width to ensure the content is not too narrow
      }}
    >
      {/* First Container */}
      <Box
        onClick={handleOpenAnnouncementDialog} // Open the original announcement modal
        sx={{
          width: '100%',
          maxWidth: '100%', // Make the container take up full width of the parent Box
          height: 200, // Set the maximum height
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        {/* Inner container for the background image */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: '4px',
            backgroundImage: 'url(https://media.istockphoto.com/id/1401607744/vector/megaphone-loudspeaker-speaker-social-media-advertising-and-promotion-symbol-marketing.jpg?s=612x612&w=0&k=20&c=6mn25IhbAK4vCNpDwo2hySPhOO0hWwkkFDCaYw9tLLs=)', // Background image for the container
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'transform 0.5s ease', // Smooth scaling effect
            transform: 'scale(1)', // Default scale
            '&:hover': {
              transform: 'scale(1.1)', // Slightly grow the background image on hover
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background for better readability
            padding: '8px',
            borderRadius: '4px',
            zIndex: 1, // Ensure text is above the background
          }}
        >
          <Typography variant="h6">Custom Announcement</Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <EmojiEventsIcon />
            <Typography>20,000</Typography>
            <LocalFireDepartmentIcon />
            <Typography>25,000</Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Send an announcement to all your patrons. Your community wins 20k reputation and all patrons wins 2k reputation each.
          </Typography>
        </Box>
      </Box>

      {/* Repeat for other containers (2nd and 3rd) */}
      {/* Second Container */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          height: 200,
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: '4px',
            backgroundImage: 'url(https://www.shutterstock.com/image-vector/brown-parcel-cardboard-box-parachute-600nw-2145458711.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'transform 0.5s ease',
            transform: 'scale(1)',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: '8px',
            borderRadius: '4px',
            zIndex: 1,
          }}
        >
          <Typography variant="h6">Airdrop</Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <EmojiEventsIcon />
            <Typography>50,000</Typography>
            <LocalFireDepartmentIcon />
            <Typography>100,000</Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Create an airdrop (token ERC-20 or NFT) to your patrons. (Coming Soon)
          </Typography>
        </Box>
      </Box>
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseNewModal} color="secondary" className="basefont">
      Cancel
    </Button>
  </DialogActions>
</Dialog>




    </Card>
  );
}
