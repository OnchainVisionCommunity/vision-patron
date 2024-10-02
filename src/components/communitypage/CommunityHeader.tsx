// src/components/communitypage/CommunityHeader.tsx
import React, { useState } from "react";
import {
  Avatar,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { useSigner } from "@thirdweb-dev/react";

// Define an interface for the socialMedia structure
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

// Interface for CommunityData
interface CommunityData {
  avatar: string;
  owner: string;
  description: string;
  settings: string; // settings is stored as a string (likely JSON)
  basename?: string;
  total_tips_all_time: number;
  total_tips_last_30_days: number;
  category?: string; // Category field added here
}

// Props for the CommunityHeader component
interface CommunityHeaderProps {
  communityData: CommunityData;
  isOwner: boolean;
}

export default function CommunityHeader({ communityData, isOwner }: CommunityHeaderProps) {
  const [openAnnouncementDialog, setOpenAnnouncementDialog] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [cta, setCta] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [banner, setBanner] = useState<string | null>(null); // Banner state for uploaded image
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [announcementResult, setAnnouncementResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const signer = useSigner(); // Use thirdweb to get the signer

  let socialMedia: SocialMedia = {}; // Initialize as an empty SocialMedia object
  let patronMessage = "Patron at least 100 $VISION to unlock this community"; // Default message

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
    return parsedNumber.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalTipsAllTime = formatNumberWithCommas(communityData.total_tips_all_time || 0);
  const totalTipsLast30Days = formatNumberWithCommas(communityData.total_tips_last_30_days || 0);

  const handleOpenAnnouncementDialog = () => {
    setOpenAnnouncementDialog(true);
  };

  const handleCloseAnnouncementDialog = () => {
    setOpenAnnouncementDialog(false);
  };

  const handleResultModalClose = () => {
    setResultModalOpen(false);
    window.location.reload(); // Reload the page on close
  };

  const handleCreateAnnouncement = async () => {
    setLoading(true);
    setAnnouncementResult(null);

    try {
      // Generate the current timestamp in seconds (UTC)
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const message = `Create announcement for community: ${communityData.owner} at ${currentTimestamp}`;
      const signature = await signer?.signMessage(message);

      if (!signature) {
        throw new Error("Unable to sign message");
      }

      const response = await axios.post("https://api.visioncommunity.xyz/v02/announcement/post", {
        walletAddress: communityData.owner,
        signature,
        message,
        community: communityData.owner,
        text: announcementText,
        banner,
        cta,
        cta_link: ctaLink,
        timestamp: currentTimestamp, // Send the timestamp along with the request
      });

      if (response.data.success) {
        setAnnouncementResult("Announcement created successfully!");
      } else {
        setAnnouncementResult(`Error: ${response.data.message || "Failed to create announcement"}`);
      }
    } catch (error) {
  if (error instanceof Error) {
    setAnnouncementResult(`Error: ${error.message || "Failed to create announcement"}`);
  } else {
    setAnnouncementResult("Error: Failed to create announcement");
  }
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
    maxSize: 5 * 1024 * 1024, // 5MB max size
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

  // Determine the recipient and recipientType for the "Patron me onchain" button
  const recipient = communityData.basename || communityData.owner;
  const recipientType = communityData.basename ? "basename" : "wallet";

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
        >
          <Avatar
            alt={formatAddress(communityData.owner)}
            src={communityData.avatar || "https://www.strasys.uk/wp-content/uploads/2022/02/Depositphotos_484354208_S.jpg"}
            sx={{ width: 150, height: 150 }}
          />
        </Grid>

        {/* Main Content Section */}
        <Grid item xs={12} sm={8} md={6}>
          <CardContent>
            <Typography variant="h4" component="h2" gutterBottom>
              {communityData.basename || formatAddress(communityData.owner)}
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              {communityData.description}
            </Typography>

            {/* Category display */}
            {communityData.category && (
              <Typography>
                <span className="tagcathigh">{communityData.category}</span>
              </Typography>
            )}

            <Box mt={2}>
              <Typography variant="subtitle1" className="communityinfo">
                <strong>Owner:</strong> {formatAddress(communityData.owner)}<br />
                <strong>Patron $VISION [All time]: </strong> {totalTipsAllTime} $VISION<br />
                <strong>Patron $VISION [Last 30 days]: </strong> {totalTipsLast30Days} $VISION
              </Typography>
            </Box>

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
                  onClick={handleOpenAnnouncementDialog}
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
                const url = `/?recipient=${recipient}&type=${recipientType}`;
                window.location.href = url;
              }}
            >
              Patron me onchain
            </Button>
          </Box>
        </Grid>
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
    </Card>
  );
}
