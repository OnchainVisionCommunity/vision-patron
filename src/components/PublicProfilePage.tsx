import React, { useState, useEffect } from "react";
import { Box, Grid, CircularProgress, Typography, Button } from "@mui/material";
import { useActiveAccount, ConnectButton } from "thirdweb/react";  
import { createThirdwebClient } from "thirdweb";  
import { signMessage } from "thirdweb/utils"; // Import the signMessage utility
import axios from "axios";
import PublicProfile from "./PublicProfile";
import UserDetails from './feed/UserDetails';
import TrendingCommunities from './feed/TrendingCommunities';

const PublicProfilePage: React.FC = () => {
  const client = createThirdwebClient({ clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "" });
  const account = useActiveAccount();  // Get the active account
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);


  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!account?.address) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `https://api.visioncommunity.xyz/v02/user/get?wallet=${account.address}`
        );
        const { data } = response;
        console.log("API Response:", response);
        if (data.success) {
          setProfileData({
            ...data,
            patronCommunities: data.patronCommunities || [], 
          });
        } else {
          setProfileData(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [account?.address]);

  // Profile creation using signMessage from thirdweb/utils
  const createProfile = async () => {
    console.log('Create Profile function called');
    if (!account?.address) {
      console.log('No account available');
      return;
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const message = `Sign to create your profile for wallet: ${account.address} at ${timestamp}`;
      console.log('Message to sign:', message);

      // Use the signMessage utility to sign the message
      const signature = await signMessage({ account, message });
      console.log('Signature:', signature);

      await axios.post("https://api.visioncommunity.xyz/v02/user/create", {
        walletAddress: account.address,
        signature,
        message,
        timestamp,
      });

      console.log('Profile created, reloading page');
      window.location.reload();
    } catch (error) {
      console.error("Profile creation error:", error);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Wallet not connected
  if (!account?.address) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography className="walletnotconn">
          Please connect your wallet/sign-in to view your profile.
        </Typography>
      </Box>
    );
  }

  // No profile found
  if (!profileData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Button
          variant="contained"
          color="primary"
          onClick={createProfile}
          className="btnpatronme"
        >
          Create my VISION PATRON profile
        </Button>
      </Box>
    );
  }

  return (
<>
    <div className="pagefeed" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Check if wallet is connected */}
      {account?.address ? (
        <Grid container spacing={2} sx={{ height: 'calc(100vh)', overflow: 'hidden' }}>
          
          {/* Left Sidebar */}

            <UserDetails walletAddress={account.address} />


          {/* Middle Section (Feed) */}
          <Grid
            item
            className="feedcustom pdtop30"
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
            <PublicProfile
            />
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
      ) : (
        // Show message if wallet is not connected
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Please, sign in / connect wallet to see this page
          </Typography>
        </Box>
      )}
    </div>
</>
  );
};

export default PublicProfilePage;
