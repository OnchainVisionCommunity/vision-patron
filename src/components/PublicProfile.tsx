import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import { sanitizeId } from "../utils/sanitizeId"; // Utility function for sanitizing wallet addresses
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"; // Import the Icon
import { useNavigate } from "react-router-dom";

// Helper to format wallet address as 0x1234...5678
const formatWalletAddress = (wallet: string): string => {
  return wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "";
};

// Helper to format VISION amount with 2 decimals
const formatVisionAmount = (amount: number | string): string => {
  return parseFloat(amount.toString()).toFixed(2);
};

// Set initial number of communities to show per load
const PAGE_SIZE = 10;

interface Community {
  receiver_wallet: string;
  amount: number | string;
  details?: {
    avatar?: string;
    basename?: string;
  };
}

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

interface ProfileData {
  wallet: string;
  avatar?: string;
  basename?: string;
  social?: {
    social?: SocialMedia;
  };
}

const PublicProfile: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>(); // Get wallet address from URL parameters
  const sanitizedWalletAddress = sanitizeId(walletAddress || ""); // Sanitize wallet address
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [patronCommunities, setPatronCommunities] = useState<Community[]>([]); // Patron communities state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [communitiesPage, setCommunitiesPage] = useState(1); // Page state for paginated communities
  const navigate = useNavigate();

  // Fetch profile data based on wallet address
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `https://api.visioncommunity.xyz/v02/user/getpublic?wallet=${sanitizedWalletAddress}`
        );
        if (response.status === 404) {
          throw new Error("Profile not found");
        }
        setProfileData(response.data.user); // Access user data inside the response
        setPatronCommunities(response.data.patronCommunities || []); // Set patron communities from the response
      } catch (error) {
        console.error("Error fetching public profile:", error);
        setError("Profile not found or an error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [sanitizedWalletAddress]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h5">{error}</Typography>
      </Box>
    );
  }

  if (!profileData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h5">Profile not found.</Typography>
      </Box>
    );
  }

  const socialMedia = profileData.social?.social || {}; // Access nested social structure safely
  const avatarUrl = profileData.avatar || "/default-avatar.png";
  const displayName = profileData.basename
    ? profileData.basename
    : formatWalletAddress(profileData.wallet);

  // Paginate communities (10 per page)
  const totalCommunityPages = Math.ceil(patronCommunities.length / PAGE_SIZE);
  const paginatedCommunities = patronCommunities.slice(
    (communitiesPage - 1) * PAGE_SIZE,
    communitiesPage * PAGE_SIZE
  );

  return (
    <Box
      sx={{
        padding: "2rem",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      {/* Display Name (Basename or Wallet Address) */}
      <Box display="flex" justifyContent="center" mb={3}>
        <Typography className="basefontblue bigtext" fontWeight="bold">
          {displayName}
        </Typography>
      </Box>

      {/* Avatar Section */}
      <Box display="flex" justifyContent="center" mb={4}>
        <Avatar
          src={avatarUrl}
          alt="Profile Avatar"
          sx={{ width: 120, height: 120, border: "3px solid #ddd" }}
        />
      </Box>

      <Box mt={2} display="flex" gap={2} alignItems="center" justifyContent="center" mb={3}>
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

      {/* Badges Section */}
      <Card sx={{ marginBottom: 4 }}>
        <CardContent>
          <Typography className="profiletitlebox" gutterBottom>
            Badges
          </Typography>
          <Typography>Coming Soon</Typography>
        </CardContent>
      </Card>

      {/* Patroned Communities */}
      <Card>
        <CardContent>
          <Typography className="profiletitlebox" gutterBottom>
            Patroned Communities
          </Typography>
          {paginatedCommunities.length ? (
            paginatedCommunities.map((community: Community, index: number) => {
              const communityDetails = community.details || {};
              const communityAvatarUrl = communityDetails.avatar || "/default-community-avatar.png";
              const communityName = communityDetails.basename
                ? communityDetails.basename
                : formatWalletAddress(community.receiver_wallet);

              return (
                <Box
                  key={community.receiver_wallet + index}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  my={1}
                >
                  <Avatar src={communityAvatarUrl} alt={communityName} />
                  <Box ml={2}>
                    <Typography variant="body1">{communityName}</Typography>
                    <Typography className="basefont smalltext" color="textSecondary">
                      {formatVisionAmount(community.amount)} $VISION
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={() => navigate(`/community/${community.receiver_wallet}`)}
                    color="primary"
                    sx={{ marginLeft: "auto" }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
              );
            })
          ) : (
            <Typography>No patroned communities found.</Typography>
          )}

          {/* Pagination Controls */}
          {patronCommunities.length > PAGE_SIZE && (
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button
                disabled={communitiesPage === 1}
                onClick={() => setCommunitiesPage((prev) => prev - 1)}
                variant="outlined"
              >
                Previous
              </Button>
              <Typography>
                Page {communitiesPage} of {totalCommunityPages}
              </Typography>
              <Button
                disabled={communitiesPage >= totalCommunityPages}
                onClick={() => setCommunitiesPage((prev) => prev + 1)}
                variant="outlined"
              >
                Next
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PublicProfile;
