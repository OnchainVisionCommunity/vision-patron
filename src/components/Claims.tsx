// src/components/feed/Claims.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Link } from '@mui/material';
import axios from 'axios';

interface Win {
  nft_id: number;
  amount_won: string;
  origin: string;
  txhash?: string;
}

interface WinsProps {
  userWallet: string;
}

const Claims: React.FC<WinsProps> = ({ userWallet }) => {
  const [wins, setWins] = useState<Win[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noRecords, setNoRecords] = useState(false); // New state to handle no records

  useEffect(() => {
    // Fetch the wins data from the API
    const fetchWins = async () => {
      try {
        const response = await axios.post('https://api.visioncommunity.xyz/v02/user/get/wins', {
          walletAddress: userWallet,
        });

        if (response.data.success === false) {
          setNoRecords(true); // Set no records found
        } else {
          // Filter results where origin is 'lottery'
          const lotteryWins = response.data.data.filter((win: Win) => win.origin === 'lottery');
          setWins(lotteryWins);
        }
      } catch (err) {
        setError('Failed to fetch wins data.');
      } finally {
        setLoading(false);
      }
    };

    fetchWins();
  }, [userWallet]);

  const formatAmount = (amount: string) => {
    // Format the amount to 2 decimal places
    return parseFloat(amount).toFixed(2);
  };

  if (loading) {
    return <Typography>Loading your wins...</Typography>;
  }

  if (error) {
    return <Typography>{error}</Typography>;
  }

  if (noRecords || wins.length === 0) {
    return (
      <Box sx={{ padding: 1 }}>
        <Typography variant="h6" sx={{ color: '#fff', textAlign: 'center', marginTop: 2 }}>
          You haven't won any prizes yet.
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#fff', textAlign: 'center', marginTop: 1 }}>
          Start rolling NFT Shards in the lottery to win $VISION!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 1 }}>
      {wins.map((win, index) => (
        <Card
          key={index}
          sx={{
            marginBottom: 1,
            padding: 1,
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: 'none',
            borderBottom: '1px solid #666',
            cursor: win.txhash ? 'pointer' : 'default',
          }}
          {...(win.txhash && {
            component: Link,
            href: `https://basescan.org/tx/${win.txhash}`,
            target: '_blank',
            rel: 'noopener noreferrer',
          })}
        >
          <CardContent sx={{ padding: '8px 0' }}>
            <Typography className="wintitle" sx={{ color: '#fff', marginBottom: '4px' }}>
              You won the lottery with the NFT ID #{win.nft_id}
            </Typography>
            <Typography className="winsubtitle" sx={{ color: '#fff' }}>
              You won {formatAmount(win.amount_won)} $VISION and it was transferred to your wallet.
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default Claims;
