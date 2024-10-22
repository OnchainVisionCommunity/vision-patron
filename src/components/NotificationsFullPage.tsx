import React, { useEffect, useState } from "react";
import { Box, Grid, useMediaQuery, useTheme, Typography, CircularProgress } from "@mui/material";
import { useActiveAccount } from "thirdweb/react"; // Thirdweb SDK for getting active account
import UserDetails from './feed/UserDetails';
import NotificationsPage from "./NotificationsPage";
import axios from "axios"; // Import axios for API calls
import CreateProfile from "./CreateProfile";
import TrendingCommunities from './feed/TrendingCommunities';

const NotificationsFullPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const account = useActiveAccount();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  const checkProfile = async (walletAddress: string) => {
    try {
      const response = await axios.get(
        `https://api.visioncommunity.xyz/v02/user/get?wallet=${walletAddress}`
      );
      if (response.status === 200 && response.data.success) {
        setHasProfile(true); // Profile exists
      } else {
        setHasProfile(false); // No profile found
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setHasProfile(false); // No profile found
      } else {
        console.error('Error fetching profile:', error);
      }
    }
  };

  // Function to check if the profile exists
  const fetchProfile = async (walletAddress: string) => {
    try {
      const response = await axios.get(
        `https://api.visioncommunity.xyz/v02/user/get?wallet=${walletAddress}`
      );
      if (response.status === 200 && response.data.success) {
        setHasProfile(true); // Profile found
      } else {
        setHasProfile(false); // No profile found
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setHasProfile(false); // No profile found
      } else {
        console.error("Error fetching profile:", error);
      }
    } finally {
      setLoading(false); // Stop loading when the check is done
    }
  };

  // Fetch the profile when the wallet is connected
  useEffect(() => {
    if (account?.address) {
      fetchProfile(account.address);
    } else {
      setLoading(false);
    }
  }, [account?.address]);
  
  // If the wallet is connected but the profile is not found, show the CreateProfile component
  if (hasProfile === false) {
    return <CreateProfile />;
  }

  // Loading spinner while checking for the profile
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // If the wallet is connected but no profile found, show the CreateProfile component
  if (account?.address && hasProfile === false) {
    return <CreateProfile />;
  }

  // Return early if wallet is not connected
  if (!account?.address) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h6" gutterBottom>
          Please, sign in / connect wallet to see this page
        </Typography>
      </Box>
    );
  }

  return (
     <div className="pagefeed" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Grid container spacing={2} sx={{ height: 'calc(100vh)', overflow: 'hidden' }} >
        {/* Left Sidebar (User Profile) */}

          <UserDetails walletAddress={account.address} /> {/* Pass connected wallet address */}

        {/* Right Side (NotificationsPage) - Full width on mobile */}
          <Grid
            item
            className="feedcustom pdtop30 grinot"
            xs={12}
            md={6}
            sx={{
              height: '100%', // Adjust height dynamically
              padding: 2,
              overflowY: 'auto',
              backgroundColor: '#fff',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
          <NotificationsPage walletAddress={account.address} />
        </Grid>
        
        
        
          {/* Right Sidebar */}
          <Grid
            className="feedcustom pdtop30"
            item
            xs={0}
            md={3}
            sx={{
              display: { xs: 'none', md: 'block' }, // Hide on small screens
              overflowY: 'auto',
              height: '100%', // Adjust height dynamically
              backgroundColor: '#f9f9f9',
              padding: 2,
              borderLeft: '1px solid #333',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            <TrendingCommunities />
          </Grid>
          
          
      </Grid>
    </div>
  );
};

export default NotificationsFullPage;
