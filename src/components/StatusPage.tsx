// src/components/UserFeed.tsx
import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import UserDetails from './feed/UserDetails';
import Status from './Status';
import TrendingCommunities from './feed/TrendingCommunities';
import { useActiveAccount } from 'thirdweb/react';

const StatusPage = () => {
  const account = useActiveAccount(); // SDK v5: Get the active account

  return (
    <div className="pagefeed" style={{ height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              height: 'auto',
maxHeight: '100vh',
              padding: 2,
              overflowY: 'auto',
              backgroundColor: '#fff',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            <Status />
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

export default StatusPage;
