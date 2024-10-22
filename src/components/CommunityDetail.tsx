import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, CircularProgress, Typography, Grid, Alert } from "@mui/material";
import { useActiveAccount } from "thirdweb/react";
import UserDetails from './feed/UserDetails';

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
  const account = useActiveAccount();

  const [communityData, setCommunityData] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [accessGranted, setAccessGranted] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const maxRetries = 3;
const [communityStatus, setCommunityStatus] = useState<number | null>(null);

  // Function to reset state
  const resetState = () => {
    setCommunityData(null);
    setLoading(true);
    setError(null);
    setIsOwner(false);
    setAccessGranted(false);
  };

  // Fetch community data once the wallet is connected
  const fetchCommunityData = async () => {
    try {
      setLoading(true); // Start loading state
      const communityResponse = fetch(`https://api.visioncommunity.xyz/v02/communities/${sanitizedId}`);
      const patronCheckResponse = fetch(
        `https://api.visioncommunity.xyz/v02/user/patron?owner_wallet=${sanitizedId}&user_wallet=${account?.address}`
      );

      // Wait for both API requests to complete
      const [communityRes, patronRes] = await Promise.all([communityResponse, patronCheckResponse]);
      const communityData = await communityRes.json();
      const patronData = await patronRes.json();

      if (communityRes.ok && patronRes.ok && communityData.success && patronData.success) {
        setCommunityData({
          ...communityData.data,
          avatar: communityData.data.avatar || '',
          total_tips_all_time: communityData.data.total_tips_all_time || 0,
          total_tips_last_30_days: communityData.data.total_tips_last_30_days || 0,
          settings: communityData.data.settings,
        });

	    // Set community status
	    setCommunityStatus(communityData.data.status);
    
        // Check if the connected wallet is the owner
        if (account?.address === communityData.data.owner) {
          setIsOwner(true);
          setAccessGranted(true); // Owner automatically gets access
        } else {
          setIsOwner(false);
          // Patron check
          const settings = patronData.data.settings;
          const requiredAmount = parseFloat(settings.patron?.value || "0");
          const filter = settings.patron?.filter || "30d";

          let userTipAmount = 0;
          if (filter === "30d") {
            userTipAmount = parseFloat(patronData.data.tips?.total_sent_last_30_days || "0");
          } else if (filter === "all_time") {
            userTipAmount = parseFloat(patronData.data.tips?.total_sent_all_time || "0");
          }

          setAccessGranted(userTipAmount >= requiredAmount);
        }
        setError(null); // Clear any previous errors
      } else {
        throw new Error("Failed to fetch community or patron data.");
      }
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      if (retryCount < maxRetries) {
        setRetryCount(retryCount + 1); // Retry fetching data
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data and reset retry counter when wallet is detected
  useEffect(() => {
    if (account?.address) {
      resetState(); // Reset state on wallet change
      fetchCommunityData();
    }
  }, [account?.address, sanitizedId, retryCount]);

  // Show loading state or error if applicable
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

  // Show message if wallet is not connected
  if (!account?.address) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h5" textAlign="center" color="white">
          Please connect your wallet to view community details.
        </Typography>
      </Box>
    );
  }

  // Render the community details page when data is available
  return (
    <div className="pagefeed" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Grid container spacing={2} sx={{ height: 'calc(100vh)', overflow: 'hidden' }}>
{communityStatus === 0 && (
    <Box sx={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000 }}>
        <Alert severity="warning">This community has been disabled by its owner. You can still interact with the community and reputation will be distributed normally, however the community will not be visible in searches and trends.</Alert>
    </Box>
)}
{communityStatus === 2 && (
    <Box sx={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000 }}>
        <Alert severity="error">This community is suspended because has been flagged as a possible scam or has violated the Patrons's <a href="/terms/">terms of use</a>.</Alert>
    </Box>
)}
        <UserDetails walletAddress={account.address} />
        <Grid item xs={12} md={9}
          sx={{
            height: '100%', // Adjust height dynamically
            padding: 2,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {communityData && communityStatus !== 2 ? (
            <>
              <CommunityHeader communityData={communityData} isOwner={isOwner} />
              <Grid container spacing={3}>
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
                        boxShadow: 3,
                        border: "1px solid #e0e0e0",
                        maxWidth: "100%",
                        margin: "auto",
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
                <Grid item xs={12} md={3}>
                  <CommunitySidebar communityId={sanitizedId} />
                </Grid>
              </Grid>
            </>
          ) : (
            <Typography variant="h5" textAlign="center">
              This community has not yet been claimed by the author.
            </Typography>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
