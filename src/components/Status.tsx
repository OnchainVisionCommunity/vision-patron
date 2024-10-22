// src/components/feed/Status.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faFire, faHandHoldingUsd, faCircle } from '@fortawesome/free-solid-svg-icons';

interface TokenInfo {
  total_supply: string;
  total_burned: string;
  patron_burned: string;
  circulation_supply_real: string;
  total_pooled: string;
  patron_pooled: string;
}

const Status: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch token information from the API
    const fetchTokenInfo = async () => {
      try {
        const response = await axios.get('https://api.visioncommunity.xyz/v02/token/info');

        if (response.data.success) {
          setTokenInfo(response.data.data); // Assuming response.data.data contains token information
        } else {
          setError('Failed to fetch token data.');
        }
      } catch (err) {
        setError('Failed to fetch token data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTokenInfo();
  }, []);

  // Helper function to format numbers with commas and round to 2 decimals
  const formatAmount = (amount: string) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount === 0) {
      return '0.00';
    }
    return parsedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) {
    return <Typography>Loading token info...</Typography>;
  }

  if (error) {
    return <Typography>{error}</Typography>;
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" sx={{ color: '#fff', marginBottom: 2 }}>
        $VISION: The CTO (Community Take Over) Token
      </Typography>
      <Typography variant="body1" sx={{ color: '#ccc', marginBottom: 4 }}>
        Patron is a community-driven project built on the principles of collaboration and collective effort. The $VISION
        token represents the heart of this community.
        <p>$VISION is tribute token to CoinBase Vision and it's 100% community driven. We are not affiliated with CB Vision.</p>
      </Typography>

      {tokenInfo && (
        <>
          <Card
            sx={{
              marginBottom: 1,
              padding: 1,
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
              borderBottom: '1px solid #666',
            }}
          >
            <CardContent sx={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faCoins} style={{ color: '#fff', marginRight: '12px' }} />
              <Box>
                <Typography sx={{ color: '#fff' }}>Total Supply: {formatAmount(tokenInfo.total_supply)} $VISION</Typography>
                <Typography sx={{ color: '#aaa', fontSize: '0.9rem' }}>The total supply of $VISION tokens ever created.</Typography>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              marginBottom: 1,
              padding: 1,
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
              borderBottom: '1px solid #666',
            }}
          >
            <CardContent sx={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faFire} style={{ color: '#fff', marginRight: '12px' }} />
              <Box>
                <Typography sx={{ color: '#fff' }}>Total Burn: {formatAmount(tokenInfo.total_burned)} $VISION</Typography>
                <Typography sx={{ color: '#aaa', fontSize: '0.9rem' }}>Tokens permanently removed from circulation.</Typography>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              marginBottom: 1,
              padding: 1,
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
              borderBottom: '1px solid #666',
            }}
          >
            <CardContent sx={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faHandHoldingUsd} style={{ color: '#fff', marginRight: '12px' }} />
              <Box>
                <Typography sx={{ color: '#fff' }}>Patron Burn: {formatAmount(tokenInfo.patron_burned)} $VISION</Typography>
                <Typography sx={{ color: '#aaa', fontSize: '0.9rem' }}>Tokens burned specifically by the Patron community.</Typography>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              marginBottom: 1,
              padding: 1,
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
              borderBottom: '1px solid #666',
            }}
          >
            <CardContent sx={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faCircle} style={{ color: '#fff', marginRight: '12px' }} />
              <Box>
                <Typography sx={{ color: '#fff' }}>
                  Circulating Supply Real: {formatAmount(tokenInfo.circulation_supply_real)} $VISION
                </Typography>
                <Typography sx={{ color: '#aaa', fontSize: '0.9rem' }}>Real circulation after accounting for burns.</Typography>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              marginBottom: 1,
              padding: 1,
              backgroundColor: 'transparent',
              border: 'none',
              boxShadow: 'none',
              borderBottom: '1px solid #666',
            }}
          >
            <CardContent sx={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faCoins} style={{ color: '#fff', marginRight: '12px' }} />
              <Box>
                <Typography sx={{ color: '#fff' }}>Total Pooled: {formatAmount(tokenInfo.total_pooled)} $VISION</Typography>
                <Typography sx={{ color: '#aaa', fontSize: '0.9rem' }}>Currently tokens pooled for lotteries and mini-games</Typography>
              </Box>
            </CardContent>
          </Card>

        </>
      )}
    </Box>
  );
};

export default Status;
