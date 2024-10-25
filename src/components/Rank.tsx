// src/components/Rank.tsx
import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, List, ListItem, ListItemAvatar, ListItemText, Button } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface WalletDetails {
  id: number;
  wallet: string;
  basename: string | null;
  avatar: string;
  banner: string;
  social: any;
  welcome: string;
  welcome_gift: number;
}

interface ReputationData {
  id: number;
  wallet: string;
  reputation: number;
  normalized_reputation: number;
  walletDetails: WalletDetails;
}

const formatReputation = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'mil';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  return value.toString();
};

const Rank: React.FC = () => {
  const [reputationData, setReputationData] = useState<ReputationData[]>([]);
  const [page, setPage] = useState(1);
  const limit = 30;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Fetch data from the API
    axios
      .get(`https://api.visioncommunity.xyz/v02/rank/user/get?page=${page}&limit=${limit}`)
      .then((response) => {
        if (response.data.success) {
          setReputationData(response.data.reputationData);
          const totalItems = response.data.totalItems || 0;
          setTotalPages(Math.ceil(totalItems / limit));
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <Box sx={{ padding: 2, backgroundColor: 'transparent' }}>
      <List>
        {reputationData.map((user) => {
          const displayName = user.walletDetails.basename
            ? user.walletDetails.basename
            : `${user.wallet.substring(0, 6)}...${user.wallet.slice(-4)}`;

          return (
			  <>
            <ListItem key={user.id} sx={{ padding: 0 }}>
              <Link
                to={`/profile/${user.wallet}`}
                style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
                  <ListItemAvatar>
                    <Avatar src={user.walletDetails.avatar} alt={displayName} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography className="rankdisplayname" variant="h6" sx={{ color: 'white' }}>
                        {displayName}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        Raw Reputation: {formatReputation(user.reputation)} | Normalized: {user.normalized_reputation.toFixed(1)}
                      </Typography>
                    }
                  />
                </Box>
              </Link>
              
            </ListItem>
            <hr className="sep" />
            </>
          );
        })}
      </List>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePreviousPage}
          disabled={page <= 1}
          sx={{ marginRight: 1 }}
        >
          Previous
        </Button>
        <Typography variant="body2" sx={{ color: 'white', alignSelf: 'center' }}>
          Page {page} of {totalPages}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNextPage}
          disabled={page >= totalPages}
          sx={{ marginLeft: 1 }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default Rank;
