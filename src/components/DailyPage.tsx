// src/components/DailyPage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import UserDetails from './feed/UserDetails';
import Daily from './Daily';
import TrendingCommunities from './feed/TrendingCommunities';
import { useActiveAccount } from 'thirdweb/react';
import axios from 'axios';
import { useUserStatus } from '../context/UserStatusContext';
import { Snackbar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DailyPage: React.FC = () => {
  const account = useActiveAccount();
  const [dailyData, setDailyData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
const { updateEnergy, updateReputation } = useUserStatus();

  useEffect(() => {
    if (account?.address) {
      fetchDailyData(account.address);
    }
  }, [account]);

  const fetchDailyData = async (walletAddress: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://api.visioncommunity.xyz/v02/user/daily/get?wallet=${walletAddress}`);
      
      if (response.data.success) {
        setDailyData(response.data);
      } else {
        setDailyData({
          success: false,
          settings: [],
          wallet: {
            current_day: 1,
            is_claimed: 0,
            consecutive_days: 0,
          }
        });
      }
    } catch (err) {
      setError('Failed to load daily rewards data.');
    } finally {
      setLoading(false);
    }
  };

const handleClaimReward = async (walletAddress: string) => {
  try {
    setLoading(true);
    const response = await axios.post('https://api.visioncommunity.xyz/v02/user/daily/claim', {
      wallet: walletAddress,
    });

    if (response.data.success) {
      const { reputation, energy, vision_token } = response.data.data;

      // Update the user's energy and reputation
      updateEnergy(parseFloat(energy));
      updateReputation(parseFloat(reputation));

      // Set the Snackbar message
      const visionMessage = parseFloat(vision_token) > 0 ? `, ${vision_token} $VISION` : '';
      const message = `Rewards claimed: Energy (${energy}), Reputation (${reputation})${visionMessage}`;
      setSnackbarMessage(message);
      setSnackbarOpen(true); // Open the Snackbar

      // Refresh the daily data after a successful claim
      await fetchDailyData(walletAddress);
    } else {
      setError(response.data.message || 'Failed to claim reward.');
    }
  } catch (err) {
    setError('Failed to claim the reward. Please try again later.');
  } finally {
    setLoading(false);
  }
};


const handleSnackbarClose = (event?: React.SyntheticEvent, reason?: string) => {
  if (reason === 'clickaway') {
    return;
  }
  setSnackbarOpen(false);
  setSnackbarMessage(null);
  console.log('Snackbar closed'); // Debug: Log Snackbar closing
};


  return (
    <div className="pagefeed" style={{ height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
<Snackbar
  open={snackbarOpen}
  autoHideDuration={6000}
  onClose={handleSnackbarClose}
  message={snackbarMessage}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Position the Snackbar at the top center
  action={
    <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
      <CloseIcon fontSize="small" />
    </IconButton>
  }
/>

      {account?.address ? (
        <Grid container spacing={2} sx={{ height: 'calc(100vh)', overflow: 'hidden' }}>
          <UserDetails walletAddress={account.address} />

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
            {loading ? (
              <Typography variant="body1">Loading...</Typography>
            ) : error ? (
              <Typography variant="body1" color="error">{error}</Typography>
            ) : (
              <Daily dailyData={dailyData} onClaim={() => handleClaimReward(account.address)} />
            )}
          </Grid>

          <Grid
            className="feedcustom pdtop30"
            item
            xs={0}
            md={3}
            sx={{
              display: { xs: 'none', md: 'block' },
              overflowY: 'auto',
              height: '100%',
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
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Please, sign in / connect wallet to see this page
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default DailyPage;
