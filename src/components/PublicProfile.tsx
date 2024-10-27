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
  Modal,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { sanitizeId } from "../utils/sanitizeId"; // Utility function for sanitizing wallet addresses
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"; // Import the Icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faTrophy, faCheckCircle, faTimes } from "@fortawesome/free-solid-svg-icons"; // Icons

// Helper to format wallet address as 0x1234...5678
const formatWalletAddress = (wallet: string): string => {
  return wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "";
};

// Helper to format numbers with thousands/millions and 1 decimal
const formatNumber = (value: number | string): string => {
  const numberValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numberValue)) return "0.0";
  if (numberValue >= 1000000) {
    return `${(numberValue / 1000000).toFixed(1)}M`;
  } else if (numberValue >= 1000) {
    return `${(numberValue / 1000).toFixed(1)}K`;
  } else {
    return numberValue.toFixed(1);
  }
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

interface Badge {
  status_label: string;
  image: string;
}

interface ProfileData {
  wallet: string;
  avatar?: string;
  basename?: string;
  social?: any;
}

interface ReputationEnergy {
  reputation: number;
  energy: number;
  normalizedReputation: number;
}

const PublicProfile: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>(); // Get wallet address from URL parameters
  const sanitizedWalletAddress = sanitizeId(walletAddress || ""); // Sanitize wallet address
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]); // Store badges
  const [patronCommunities, setPatronCommunities] = useState<Community[]>([]); // Patron communities state
  const [reputationEnergy, setReputationEnergy] = useState<ReputationEnergy | null>(null); // Store reputation and energy
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [communitiesPage, setCommunitiesPage] = useState(1); // Page state for paginated communities
  const [openModal, setOpenModal] = useState<"reputation" | "energy" | "normalizedReputation" | null>(null);
const [isOwner, setIsOwner] = useState(false);
const [community, setCommunity] = useState(null);  
  
  const navigate = useNavigate();
const socialMediaIcons = {
  twitter: "https://patron.visioncommunity.xyz/img/icons/x-white.png",
  instagram: "https://patron.visioncommunity.xyz/img/icons/instagram-white.png",
  warpcast: "https://patron.visioncommunity.xyz/img/icons/warpcast-white.png",
  lunchbreak: "https://patron.visioncommunity.xyz/img/icons/lunchbreak-white.png",
  drakula: "https://patron.visioncommunity.xyz/img/icons/drakula-white.png",
  site: "https://patron.visioncommunity.xyz/img/icons/www-white.png",
};

// Base URLs for social media platforms (editable)
const socialMediaBaseUrls = {
  twitter: "https://x.com",
  instagram: "https://instagram.com",
  warpcast: "https://warpcast.com",
  lunchbreak: "https://lunchbreak.com",
  drakula: "https://drakula.app/user",
  site: "", // Full link provided directly
};

const socialLinks = profileData?.social?.social || {};


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

        // Set state with the fetched data
        setProfileData(response.data.user);
        setBadges([...response.data.badges.highlight, ...response.data.badges.earned]); // Combine badges
        setPatronCommunities(response.data.patronCommunities || []); // Set patron communities
        setReputationEnergy({
          reputation: response.data.reputation.raw,
          energy: response.data.energy,
          normalizedReputation: response.data.reputation.normalized,
        });
        setIsOwner(response.data.isOwner); // Set ownership status
        setCommunity(response.data.community); // Set community data

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

  const avatarUrl = profileData.avatar || "/default-avatar.png";
  const bannerUrl = profileData.banner || "/default-banner.jpg";
  const displayName = profileData.basename
    ? profileData.basename
    : formatWalletAddress(profileData.wallet);

  // Paginate communities (10 per page)
  const totalCommunityPages = Math.ceil(patronCommunities.length / PAGE_SIZE);
  const paginatedCommunities = patronCommunities.slice(
    (communitiesPage - 1) * PAGE_SIZE,
    communitiesPage * PAGE_SIZE
  );

  const handleOpenModal = (type: "reputation" | "energy" | "normalizedReputation") => {
    setOpenModal(type);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  return (
    <div  style={{ backgroundColor: "#111", borderRadius: "8px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }} className="boxleft">
      {/* Banner Section */}
      <Box
        sx={{
          position: "relative",
          backgroundColor: "#f5f5f5",
          height: "200px",
          backgroundImage: `url(${bannerUrl})`,
          backgroundSize: "cover",
          borderRadius: "5px"
        }}
      />
{isOwner && community?.status === 1 && (
  <Box position="absolute" top="10px" right="10px">
    <Button
      variant="contained"
      onClick={() => navigate(`/communities/${community.owner}`)}
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white",
        padding: "4px 8px",
      }}
    >
      My Community
    </Button>
  </Box>
)}

      {/* Avatar Section - Positioned to be 50% inside banner */}
      <Box display="flex" justifyContent="center" position="relative" sx={{ top: "-60px" }}>
        <Avatar
          src={avatarUrl}
          alt="Profile Avatar"
          sx={{ width: 120, height: 120, border: "3px solid #fff" }}
        />
      </Box>

      <Box mt={-5}>
        {/* Display Name (Basename or Wallet Address) */}
        <Box display="flex" justifyContent="center" mb={0}>
          <Typography className="basefont bigtext" fontWeight="bold">
            {displayName}
          </Typography>
          {/* Highlighted Badges */}
          <Box ml={2} display="flex">
            {badges
              .filter((badge) => badge.status_label === "highlight")
              .slice(0, 2)
              .map((badge, index) => (
                <Avatar
                  key={index}
                  src={badge.image}
                  alt="Badge"
                  sx={{ width: 32, height: 32, marginLeft: 1 }}
                />
              ))}
          </Box>
        </Box>


<Box display="flex" justifyContent="center" gap={1} mt={1} mb={1}>
  {Object.entries(socialLinks).map(([platform, { status, account }]) => {
    if (status === "yes" && account) {
      // Use full link for "site" and construct links for other platforms
      const href =
        platform === "site"
          ? account // Use the full link provided for the website
          : `${socialMediaBaseUrls[platform]}/${account}`; // Construct URL for other platforms

      const iconUrl = socialMediaIcons[platform];

      return (
        <IconButton
          key={platform}
          component="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label={platform}
          sx={{marginbottom:'15px'}}
        >
          <img
            src={iconUrl}
            alt={`${platform} icon`}
            style={{ width: 24, height: 24 }}
          />
        </IconButton>
      );
    }
    return null;
  })}
</Box>



<Box display="flex" justifyContent="center" mb={4}>
  <Box
    display="flex"
    gap={2}
    sx={{
      padding: "10px 20px", // More padding on left and right
      borderRadius: "8px",
      backgroundColor: "transparent",
      border: "1px solid #333",
      gap: "30px"
    }}
  >
    {/* Reputation */}
    <Box
      onClick={() => handleOpenModal("reputation")}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "#0052ff", // Blue for reputation
        cursor: "pointer",
        '&:hover': {
          '&::after': {
            content: '"Reputation: raw reputation in the community."',
            position: 'absolute',
            gap: "2px",
            backgroundColor: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            color: '#000',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            top: '-35px',
          },
        },
        position: 'relative',
      }}
    >
      <FontAwesomeIcon icon={faTrophy} />
      <span className="indprofile">Reputation
      <br/><b>{formatNumber(reputationEnergy?.reputation || 0)}</b></span>
    </Box>

    {/* Energy */}
    <Box
      onClick={() => handleOpenModal("energy")}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        color: "#ff4500",
        cursor: "pointer",
        '&:hover': {
          '&::after': {
            content: '"Energy: Qauntity of energy available."',
            position: 'absolute',
            backgroundColor: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            color: '#000',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            top: '-35px',
          },
        },
        position: 'relative',
      }}
    >
      <FontAwesomeIcon icon={faFire} />
      <span className="indprofile">Energy
      <br/><b>{formatNumber(reputationEnergy?.energy || 0)}</b></span>
    </Box>

    {/* Normalized Reputation */}
    <Box
      onClick={() => handleOpenModal("normalizedReputation")}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "green", // Green for normalized reputation
        cursor: "pointer",
        '&:hover': {
          '&::after': {
            content: '"Normalized Reputation: A scaled 0 to 100 of the reputation compared with all community."',
            position: 'absolute',
            backgroundColor: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            color: '#000',
            gap: "2px",
            whiteSpace: 'nowrap',
            zIndex: 1000,
            top: '-35px',
          },
        },
        position: 'relative',
      }}
    >
      <FontAwesomeIcon icon={faCheckCircle} />
      <span className="indprofile">Norm. Rep.
      <br/><b>{formatNumber(reputationEnergy?.normalizedReputation || 0)}</b></span>
    </Box>
  </Box>
</Box>


        {/* Badges Section */}
        <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
          {badges.map((badge, index) => (
            <Card key={index} sx={{ width: "120px", padding: 2, textAlign: "center" }}>
              <Avatar src={badge.image} alt="Badge" sx={{ width: 64, height: 64 }} />
              <Typography>{badge.status_label === "highlight" ? "Highlight" : "Earned"}</Typography>
            </Card>
          ))}
        </Box>

        {/* Patroned Communities Section */}
        <div className="conttitleprofile">Latest Patrons</div>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {paginatedCommunities.map((community: Community, index: number) => {
            const communityDetails = community.details || {};
            const communityAvatarUrl = communityDetails.avatar || "/default-community-avatar.png";
            
            const communityName = communityDetails.basename
              ? communityDetails.basename
              : formatWalletAddress(community.receiver_wallet);

            return (
              <Card key={index} sx={{ flex: "1 0 calc(50% - 16px)", marginBottom: "16px" }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar src={communityAvatarUrl} alt={communityName} />
                    <Box ml={2}>
                      <Typography variant="body1">{communityName}</Typography>
                      <Typography>{formatVisionAmount(community.amount)} $VISION</Typography>
                    </Box>
                    <IconButton onClick={() => navigate(`/community/${community.receiver_wallet}`)} sx={{ marginLeft: "auto" }}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Pagination Controls */}
        {patronCommunities.length > PAGE_SIZE && (
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button disabled={communitiesPage === 1} onClick={() => setCommunitiesPage((prev) => prev - 1)}>
              Previous
            </Button>
            <Typography>
              Page {communitiesPage} of {totalCommunityPages}
            </Typography>
            <Button disabled={communitiesPage >= totalCommunityPages} onClick={() => setCommunitiesPage((prev) => prev + 1)}>
              Next
            </Button>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default PublicProfile;
