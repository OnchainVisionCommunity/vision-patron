import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, CircularProgress, Typography, Grid } from "@mui/material";
import { useAddress } from "@thirdweb-dev/react";

// Import the smaller components
import CommunityHeader from "./communitypage/CommunityHeader";
import CommunitySidebar from "./communitypage/CommunitySidebar";
import CommunityAnnouncements from "./communitypage/CommunityAnnouncements";
import CommunityMural from "./communitypage/CommunityMural";
import { sanitizeId } from "../utils/sanitizeId"; // Utility function

// Updated CommunityData interface
interface CommunityData {
  banner: string;
  owner: string;
  description: string;
  settings: any; // This will store the settings object directly
  avatar: string;
  total_tips_all_time: number;
  total_tips_last_30_days: number;
}

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const sanitizedId = sanitizeId(id || "");
  const [communityData, setCommunityData] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const connectedWalletAddress = useAddress();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [accessGranted, setAccessGranted] = useState<boolean>(false); // Initially set to false

  // Fetch community data
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const response = await fetch(`https://api.visioncommunity.xyz/v02/communities/${sanitizedId}`);
        const data = await response.json();

        if (response.ok) {
          setCommunityData({
            ...data.data,
            avatar: data.data.avatar || '',
            total_tips_all_time: data.data.total_tips_all_time || 0,
            total_tips_last_30_days: data.data.total_tips_last_30_days || 0,
            settings: data.data.settings // Use settings directly without parsing
          });

          // Check if the connected wallet is the owner
          if (connectedWalletAddress === data.data.owner) {
            setIsOwner(true);
            setAccessGranted(true); // Owner automatically gets access
          } else {
            setIsOwner(false);
            setAccessGranted(false); // This makes sure non-owners need to pass the patron check
          }
        } else {
          setError("The owner of this wallet has not yet claimed their onchain community.");
        }
      } catch {
        setError("Failed to fetch community data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [sanitizedId, connectedWalletAddress]);

  // Patron check only for non-owners
  useEffect(() => {
    const checkUserAccess = async () => {
      if (connectedWalletAddress && !isOwner) {
        try {
          const patronResponse = await fetch(
            `https://api.visioncommunity.xyz/v02/user/patron?owner_wallet=${sanitizedId}&user_wallet=${connectedWalletAddress}`
          );
          const patronData = await patronResponse.json();

          if (patronResponse.ok && patronData.success) {
            const settings = patronData.data.settings;
            const requiredAmount = parseFloat(settings.patron?.value || "0");
            const filter = settings.patron?.filter || "30d";

            let userTipAmount = 0;
            if (filter === "30d") {
              userTipAmount = parseFloat(patronData.data.tips?.total_sent_last_30_days || "0");
            } else if (filter === "all_time") {
              userTipAmount = parseFloat(patronData.data.tips?.total_sent_all_time || "0");
            }

            // Grant access if user tip amount is sufficient
            if (userTipAmount >= requiredAmount) {
              setAccessGranted(true);
            } else {
              setAccessGranted(false);
            }
          } else {
            setAccessGranted(false);
          }
        } catch (error) {
          setAccessGranted(false);
        }
      }
    };

    // Only run patron check if the user is not the owner
    if (!isOwner) {
      checkUserAccess();
    }
  }, [sanitizedId, connectedWalletAddress, isOwner]);

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
        <Typography variant="h5" textAlign="center" color="white">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!connectedWalletAddress) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h5" textAlign="center" color="white">
          Please connect your wallet to view community details.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", padding: "0 5%", mt: 2 }}>
      {communityData ? (
        <>
          <CommunityHeader communityData={communityData} isOwner={isOwner} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <CommunitySidebar communityId={sanitizedId}/>
            </Grid>
            <Grid item xs={12} md={9}>
              {/* Conditionally render announcements and mural based on access */}
              {accessGranted || isOwner ? (
                <>
                  <CommunityAnnouncements communityId={sanitizedId} isOwner={isOwner} />
                  <CommunityMural isOwner={isOwner} communityId={sanitizedId} ownerWallet={communityData.owner} />
                </>
              ) : (
                <Box
                  sx={{
                    backgroundColor: "white",
                    padding: "16px",
                    borderRadius: "8px",
                    boxShadow: 3, // adds a subtle shadow for a card-like effect
                    border: "1px solid #e0e0e0", // adds a light gray border
                    maxWidth: "100%",
                    margin: "auto", // centers the box horizontally
                  }}
                >
                  <Typography variant="h6" color="textPrimary" textAlign="center">
                    You have not patroned the minimum required amount for this community.
                  </Typography>
                  <Typography variant="body2" color="textSecondary" textAlign="center" mt={2}>
                    Please support this community to gain access to exclusive features.
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </>
      ) : (
        <Typography variant="h5" textAlign="center">
          This community has not yet been claimed by the author.
        </Typography>
      )}
    </Box>
  );
}
