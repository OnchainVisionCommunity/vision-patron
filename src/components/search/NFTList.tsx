import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

interface NFT {
  id: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
      display_type?: string;
    }>;
  };
  sender_wallet: string;
  receiver_wallet: string;
  sender_reputation: number;
  receiver_reputation: number;
  normalized_sender_reputation: number;
  normalized_receiver_reputation: number;
  rolled: boolean;
  success: boolean;
}

interface NFTListProps {
  nfts: NFT[];
  showOnlyUnrolled: boolean;
  onOpenModal: (nft: NFT, reputation: number, amount: number, pooled: number) => void;
}

const NFTList: React.FC<NFTListProps> = ({ nfts, showOnlyUnrolled, onOpenModal }) => {
  return (
    <Box>
      {/* Header Row */}
      <Box
        display={{ xs: 'none', md: 'flex' }}  /* Hide on mobile */
        sx={{ padding: 2, fontWeight: 'bold', backgroundColor: '#f0f0f0' }}
      >
        <Box flex={2}>Name</Box>
        <Box flex={2}>Patron</Box>
        <Box flex={2}>Community</Box>
        <Box flex={1}>Reputation</Box>
        <Box flex={1}>Rolled</Box>
        <Box flex={1}>Amount</Box>
        <Box flex={1}>Pooled</Box>
        <Box flex={1}>Image</Box>
      </Box>

      {nfts
        .filter((nft) => !showOnlyUnrolled || !nft.rolled) // Use rolled field directly
        .map((nft) => {
          // Extract key attributes from metadata
          const amountAttr = nft.metadata.attributes.find(attr => attr.trait_type === 'Amount');
          const pooledAttr = nft.metadata.attributes.find(attr => attr.trait_type === 'Pooled');
          const senderBaseAttr = nft.metadata.attributes.find(attr => attr.trait_type === 'Sender Basename');
          const receiverBaseAttr = nft.metadata.attributes.find(attr => attr.trait_type === 'Receiver Basename');

          const amount = amountAttr ? Number(amountAttr.value) : 0; // Ensure numeric values
          const pooled = pooledAttr ? Number(pooledAttr.value) : 0; // Ensure numeric values

          // Calculate the average reputation
          const reputation = (nft.normalized_sender_reputation + nft.normalized_receiver_reputation) / 2;

          // Show the basename or wallet address for sender and receiver
          const displaySender = senderBaseAttr && senderBaseAttr.value
            ? senderBaseAttr.value
            : `${nft.sender_wallet.slice(0, 6)}...${nft.sender_wallet.slice(-4)}`;

          const displayReceiver = receiverBaseAttr && receiverBaseAttr.value
            ? receiverBaseAttr.value
            : `${nft.receiver_wallet.slice(0, 6)}...${nft.receiver_wallet.slice(-4)}`;

          return (
            <Box
              key={nft.id}
              display="flex"
              flexDirection={{ xs: 'column', md: 'row' }} // Stack on mobile, row on desktop
              sx={{
                padding: 2,
                backgroundColor: nft.rolled ? '#f8d7da' : '#d4edda', // Red for rolled, green for unrolled
                alignItems: 'center',
                mb: 2,
                cursor: nft.rolled ? 'default' : 'pointer',
                ':hover img': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.3s ease',
                },
              }}
              onClick={() => onOpenModal(nft, reputation, amount, pooled)} // Pass amount and pooled to modal
            >
              {/* Name */}
              <Box flex={2} mb={{ xs: 1, md: 0 }}>
                <Typography variant="body1" fontWeight="bold">
                  {nft.metadata.name}
                </Typography>
              </Box>

              {/* Patron (Sender) */}
              <Box flex={2} mb={{ xs: 1, md: 0 }}>
                <Typography variant="body2">{displaySender}</Typography>
              </Box>

              {/* Community (Receiver) */}
              <Box flex={2} mb={{ xs: 1, md: 0 }}>
                <Typography variant="body2">{displayReceiver}</Typography>
              </Box>

              {/* Reputation */}
              <Box flex={1} mb={{ xs: 1, md: 0 }}>
                <Typography variant="body2">{reputation.toFixed(2)}</Typography>
              </Box>

              {/* Rolled */}
              <Box flex={1} mb={{ xs: 1, md: 0 }}>
                <Typography variant="body2" color={nft.rolled ? 'error' : 'success'}>
                  {nft.rolled ? 'Yes' : 'No'}
                </Typography>
              </Box>

              {/* Amount */}
              <Box flex={1} mb={{ xs: 1, md: 0 }}>
                <Typography variant="body2">{amount}</Typography>
              </Box>

              {/* Pooled */}
              <Box flex={1} mb={{ xs: 1, md: 0 }}>
                <Typography variant="body2">{pooled}</Typography>
              </Box>

              {/* Image with Zoom Effect */}
              <Box flex={1} display="flex" justifyContent="center" alignItems="center">
                <Avatar
                  src={nft.metadata.image}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '8px',
                    transition: 'transform 0.3s ease',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Box>
          );
        })}
    </Box>
  );
};

export default NFTList;
