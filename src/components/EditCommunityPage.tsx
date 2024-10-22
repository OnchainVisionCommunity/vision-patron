import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import UserDetails from './feed/UserDetails';
import { useActiveAccount } from 'thirdweb/react';
import axios from 'axios';
import CreateProfile from './createprofile';
import EditCommunity from './EditCommunity';

const EditCommunityPage: React.FC = () => {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null); // To track if the user has a profile
  const account = useActiveAccount();

  // Check if the user has a profile
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

  // Fetch profile when wallet is connected
  useEffect(() => {
    if (account?.address) {
      checkProfile(account.address);
    }
  }, [account]);

  // If the wallet is connected but no profile exists, show CreateProfile component
  if (hasProfile === false) {
    return <CreateProfile />;
  }

  // Return early if the wallet is not connected
  if (!account?.address) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h6" gutterBottom>
          Please, sign in / connect wallet to see this page.
        </Typography>
      </Box>
    );
  }

  return (
    <div className="pagefeed" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Grid container spacing={2} sx={{ height: 'calc(100vh)', overflow: 'hidden' }}>
        {/* Left Sidebar (User Profile) */}
        <UserDetails walletAddress={account.address} /> {/* Pass connected wallet address */}

        {/* Right Section - EditCommunity (Now the child component) */}
        <Grid item xs={12} md={9}
          sx={{
            height: '100%',
            padding: 2,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {/* Pass necessary props to the EditCommunity component */}
          <EditCommunity walletAddress={account.address} />
        </Grid>
      </Grid>
    </div>
  );
};

export default EditCommunityPage;
