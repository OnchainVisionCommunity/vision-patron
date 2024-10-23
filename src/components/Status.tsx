// src/components/feed/Status.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
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
        <p>
$VISION: <a href="https://basescan.org/address/0x07609D76e2E098766AD4e2b70B84f05b215d380a" target="_blank">0x07609D76e2E098766AD4e2b70B84f05b215d380a</a><br/>
Patron: <a href="https://basescan.org/address/0x1cfE4E6f7eD7C1693086C158cCF022EC11Ad506A" target="_blank">0x1cfE4E6f7eD7C1693086C158cCF022EC11Ad506A</a><br/>
Patron (Airdrop): <a href="https://basescan.org/address/0xbBf1076719187B59ae46029d44AF8fdeC0C1817F" target="_blank">0xbBf1076719187B59ae46029d44AF8fdeC0C1817F</a>
        </p>
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
            <CardContent sx={{ padding: '0px 0', display: 'flex', alignItems: 'center' }}>
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
            <CardContent sx={{ padding: '0px 0', display: 'flex', alignItems: 'center' }}>
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
            <CardContent sx={{ padding: '0px 0', display: 'flex', alignItems: 'center' }}>
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
            <CardContent sx={{ padding: '0px 0', display: 'flex', alignItems: 'center' }}>
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
            <CardContent sx={{ padding: '0px 0', display: 'flex', alignItems: 'center' }}>
              <FontAwesomeIcon icon={faCoins} style={{ color: '#fff', marginRight: '12px' }} />
              <Box>
                <Typography sx={{ color: '#fff' }}>Total Pooled: {formatAmount(tokenInfo.total_pooled)} $VISION</Typography>
                <Typography sx={{ color: '#aaa', fontSize: '0.9rem' }}>Currently tokens pooled for lotteries and mini-games</Typography>
              </Box>
            </CardContent>
          </Card>

<Box sx={{ marginTop: 4 }}>
  <Typography variant="h6" sx={{ color: '#fff', marginBottom: 2 }}>
    Actions and Requirements
  </Typography>
  <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ color: '#fff' }}>ACTION</TableCell>
          <TableCell sx={{ color: '#fff' }}>ENERGY REQUIRED</TableCell>
          <TableCell sx={{ color: '#fff' }}>REPUTATION (USER)</TableCell>
          <TableCell sx={{ color: '#fff' }}>REPUTATION (COMMUNITY)</TableCell>
          <TableCell sx={{ color: '#fff' }}>COMMENTARY</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell sx={{ color: '#fff' }}>LIKE</TableCell>
          <TableCell sx={{ color: '#fff' }}>-300</TableCell>
          <TableCell sx={{ color: '#fff' }}>+200</TableCell>
          <TableCell sx={{ color: '#fff' }}>+100</TableCell>
          <TableCell sx={{ color: '#fff' }}></TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ color: '#fff' }}>POST</TableCell>
          <TableCell sx={{ color: '#fff' }}>-600</TableCell>
          <TableCell sx={{ color: '#fff' }}>+1000</TableCell>
          <TableCell sx={{ color: '#fff' }}>+500</TableCell>
          <TableCell sx={{ color: '#fff' }}></TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ color: '#fff' }}>REPLY</TableCell>
          <TableCell sx={{ color: '#fff' }}>-400</TableCell>
          <TableCell sx={{ color: '#fff' }}>+600</TableCell>
          <TableCell sx={{ color: '#fff' }}>0</TableCell>
          <TableCell sx={{ color: '#fff' }}></TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ color: '#fff' }}>DOWNVOTE</TableCell>
          <TableCell sx={{ color: '#fff' }}>-300</TableCell>
          <TableCell sx={{ color: '#fff' }}>+100</TableCell>
          <TableCell sx={{ color: '#fff' }}>-100</TableCell>
          <TableCell sx={{ color: '#fff' }}>Downvoted user and community looses 100 reputation</TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ color: '#fff' }}>BOOST</TableCell>
          <TableCell sx={{ color: '#fff' }}>-5000</TableCell>
          <TableCell sx={{ color: '#fff' }}>0</TableCell>
          <TableCell sx={{ color: '#fff' }}>0</TableCell>
          <TableCell sx={{ color: '#fff' }}>Boosted posts appears public in the For You timeline to everyone timeline</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </TableContainer>

  <Box sx={{ marginTop: 4 }}>
    <Typography variant="h6" sx={{ color: '#fff', marginBottom: 2 }}>
      Tiers and Norm. Reputation
    </Typography>
    <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#fff' }}>TIER</TableCell>
            <TableCell sx={{ color: '#fff' }}>NORMALISED REPUTATION</TableCell>
            <TableCell sx={{ color: '#fff' }}>SYSTEM</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: '#fff' }}>1</TableCell>
            <TableCell sx={{ color: '#fff' }}>0 TO 20</TableCell>
            <TableCell sx={{ color: '#fff' }}>
              <span>- Looses 0.1% every 5 minutes (rounded to one decimal)<br/></span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: '#fff' }}>2</TableCell>
            <TableCell sx={{ color: '#fff' }}>21 TO 40</TableCell>
            <TableCell sx={{ color: '#fff' }}>
              <span>- Looses 0.2% every 5 minutes (rounded to one decimal)<br/></span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: '#fff' }}>3</TableCell>
            <TableCell sx={{ color: '#fff' }}>41 TO 60</TableCell>
            <TableCell sx={{ color: '#fff' }}>
              <span>- Looses 0.3% every 5 minutes (rounded to one decimal)<br/></span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: '#fff' }}>4</TableCell>
            <TableCell sx={{ color: '#fff' }}>61 TO 80</TableCell>
            <TableCell sx={{ color: '#fff' }}>
              <span>- Looses 0.5% every 5 minutes (rounded to one decimal)<br/></span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: '#fff' }}>5</TableCell>
            <TableCell sx={{ color: '#fff' }}>ABOVE 80</TableCell>
            <TableCell sx={{ color: '#fff' }}>
              <span>- Looses 0.7% every 5 minutes (rounded to one decimal).<br/></span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
</Box>


        </>
      )}
    </Box>
  );
};

export default Status;
