// src/components/UserFeed.tsx
import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Snackbar, Button } from '@mui/material';
import UserDetails from './feed/UserDetails';
import CommunityMessages from './feed/CommunityMessages';
import TrendingCommunities from './feed/TrendingCommunities';
import { useActiveAccount } from 'thirdweb/react';
import WelcomeTutorial from './WelcomeTutorial';
import { useUserStatus } from '../context/UserStatusContext';

const UserFeed = () => {
  const account = useActiveAccount();
  const [welcomeStatus, setWelcomeStatus] = useState<number | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [giftClaimed, setGiftClaimed] = useState<string | null>(null);
  const [showGiftSnackbar, setShowGiftSnackbar] = useState(false);
  const { updateEnergy, updateReputation } = useUserStatus();
  
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

  useEffect(() => {
    if (account?.address) {
      const fetchWelcomeAndGiftStatus = async () => {
        try {
          // Fetch welcome status
          const welcomeResponse = await fetch(`https://api.visioncommunity.xyz/v02/user/welcome/get?wallet=${account.address}`);
          const welcomeData = await welcomeResponse.json();
          if (welcomeData.success) {
            setWelcomeStatus(welcomeData.welcome);
            if (welcomeData.welcome === 1) {
              setIsTutorialOpen(true);
            }
          } else {
            console.error('Failed to fetch welcome status:', welcomeData.error);
          }

          // Fetch gift claim status
          const giftResponse = await fetch(`https://api.visioncommunity.xyz/v02/user/welcome/gift/check?wallet=${account.address}`);
          const giftData = await giftResponse.json();
          if (giftData.success) {
            setGiftClaimed(giftData.gift_claimed);
            if (giftData.gift_claimed === 'no') {
              setShowGiftSnackbar(true); // Show snackbar if gift is not claimed
            }
          } else {
            console.error('Failed to fetch gift status:', giftData.error);
          }
        } catch (error) {
          console.error('Error fetching statuses:', error);
        }
      };

      fetchWelcomeAndGiftStatus();
    }
  }, [account?.address]);

  // Handle claiming the gift
  const handleClaimGift = async () => {
    try {
      const response = await fetch('https://api.visioncommunity.xyz/v02/user/welcome/gift/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: account.address }),
      });

      const data = await response.json();
      if (data.success) {
        setGiftClaimed('yes'); // Mark the gift as claimed
        setShowGiftSnackbar(false); // Hide the snackbar
        updateEnergy(data.energy); // Update energy in UserStatusContext
        updateReputation(data.reputation); // Update reputation in UserStatusContext
      } else {
        console.error('Failed to claim gift:', data.message);
      }
    } catch (error) {
      console.error('Error claiming gift:', error);
    }
  };
  
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
            <CommunityMessages
              userWallet={account.address}
              isOwner={false}
              ownerWallet={account?.address} // Use the wallet address if connected
              messages={[]} // Placeholder messages
              setMessages={() => {}} // Placeholder function
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
          {/* Snackbar for gift claim */}
<Snackbar
  open={showGiftSnackbar}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
  onClose={() => setShowGiftSnackbar(false)}
  message={
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="https://cdn-icons-png.flaticon.com/512/4213/4213958.png" alt="Gift Icon" style={{ marginRight: '8px', width: '40px' }} />
        <div>
          <div className="claimgifttitle">Claim your welcome gift!</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>🔥 3000 energy</span> 
            <div style={{ flexGrow: 1, margin: '0 8px', background: '#ccc', height: '4px', width: '50px' }}></div> 
            <span>🏆 3000 reputation</span>
          </div>
        </div>
      </div>
      <Button 
        color="primary" 
        size="small" 
        onClick={handleClaimGift} 
        style={{ marginTop: '8px' }}
        className="btnpatronme"
      >
        Claim GIFT
      </Button>
    </div>
  }
/>


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

export default UserFeed;
