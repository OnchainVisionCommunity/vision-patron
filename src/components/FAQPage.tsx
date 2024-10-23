// src/components/FAQPage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import UserDetails from './feed/UserDetails';
import FAQComp from './FAQ';
import TrendingCommunities from './feed/TrendingCommunities';
import { useActiveAccount } from 'thirdweb/react';
import WelcomeTutorial from './WelcomeTutorial';

const FAQPage = () => {
  const account = useActiveAccount();
  const [welcomeStatus, setWelcomeStatus] = useState<number | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false); // State to control modal visibility

  // Fetch welcome status when wallet is connected
  useEffect(() => {
    if (account?.address) {
      const fetchWelcomeStatus = async () => {
        try {
          const response = await fetch(`https://api.visioncommunity.xyz/v02/user/welcome/get?wallet=${account.address}`);
          const data = await response.json();
          if (data.success) {
            setWelcomeStatus(data.welcome); // Set welcome status (1 or 0)
            if (data.welcome === 1) {
              setIsTutorialOpen(true); // Open tutorial modal if welcome status is 1
            }
          } else {
            console.error('Failed to fetch welcome status:', data.error);
          }
        } catch (error) {
          console.error('Error fetching welcome status:', error);
        }
      };

      fetchWelcomeStatus();
    }
  }, [account?.address]);

  return (
    <div className="pagefeed" style={{ height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Check if wallet is connected */}
      {account?.address ? (
        <Grid container spacing={2} sx={{ height: '100vh', overflow: 'hidden' }}>
          {/* Display WelcomeTutorial if welcomeStatus is 1 */}
          {welcomeStatus === 1 && (
            <WelcomeTutorial
              open={isTutorialOpen}
              onClose={() => setIsTutorialOpen(false)}
              userAddress={account.address}
            />
          )}

          <UserDetails walletAddress={account.address} />

          {/* Middle Section (Feed) */}
          <Grid
            item
            className="feedcustom pdtop30"
            xs={12}
            md={6}
            sx={{
              height: 'auto',
              maxHeight: '100vh',
              padding: 2,
              overflowY: 'auto',
              backgroundColor: '#fff',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            <FAQComp />
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
  );
};

export default FAQPage;
