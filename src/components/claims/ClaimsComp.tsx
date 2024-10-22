import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Avatar } from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import { useActiveAccount } from 'thirdweb/react';
import axios from 'axios';

const ClaimsComp = () => {
  const account = useActiveAccount(); // Get connected wallet info
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [claims, setClaims] = useState<any[]>([]); // Store claim history

  // Fetch claim history from backend
  const fetchClaimHistory = async (walletAddress: string) => {
    try {
      const response = await axios.get(
        `https://api.visioncommunity.xyz/v02/nft/claims/wallet_address=${walletAddress}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.success && response.data.claims) {
        setClaims(response.data.claims); // Store claim history in state
      } else {
        setClaims([]); // No claims found
      }
    } catch (err) {
      console.error('Error fetching claim history:', err);
      setError('Error fetching claim history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account?.address) {
      fetchClaimHistory(account.address); // Fetch claim history when account is available
    } else {
      setError('Wallet not connected');
      setLoading(false);
    }
  }, [account?.address]);

  if (loading) {
    return <Typography>Loading claim history...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  return (
    <div className="msgmural">
      {claims.length > 0 ? (
        <div className="claim-history">
          {claims.map((claim: any) => (
            <Card
              key={claim.id}
              sx={{ mb: 2, padding: 2, display: 'flex', alignItems: 'center' }}
              className="claim-history-card"
            >
              <Avatar sx={{ backgroundColor: '#4caf50', mr: 2 }}>
                <PaidIcon />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight="bold" className="basestylefont">
                  Claimed Tokens
                </Typography>
                <Typography variant="body2" className="vision-amount">
                  You claimed <b>{parseFloat(claim.amount).toFixed(2)} $VISION</b> on {new Date(claim.claimDate).toLocaleString()}
                </Typography>
              </Box>
            </Card>
          ))}
        </div>
      ) : (
        <Card sx={{ mb: 2, padding: 1, display: 'flex', alignItems: 'center' }} className="no-claims-card">
          <Avatar sx={{ backgroundColor: '#f44336', mr: 1 }}>
            <PaidIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold" className="basestylefont">
              No Claims Available
            </Typography>
            <Typography variant="body2" className="vision-amount">
              You don't have any claim history available.
            </Typography>
          </Box>
        </Card>
      )}
    </div>
  );
};

export default ClaimsComp;
