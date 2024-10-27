import React from 'react';
import { Grid, Card, Box, Typography, Button, useMediaQuery } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faCircle, faCheckCircle, faDice, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

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

interface NFTGalleryProps {
  nfts: NFT[];
  view: 'grid-4' | 'grid-9';
  showOnlyUnrolled: boolean;
  onOpenModal: (nft: NFT, reputation: number, amount: number, pooled: number, id: string) => void;
}

const NFTGallery: React.FC<NFTGalleryProps> = ({ nfts, view, showOnlyUnrolled, onOpenModal }) => {
	const isMobile = useMediaQuery('(max-width:600px)');
  const columns = isMobile ? (view === 'grid-4' ? 2 : 3) : (view === 'grid-4' ? 4 : 6);


  return (
    <Grid container spacing={2}>
      {nfts
        .filter((nft) => {
          if (showOnlyUnrolled) {
            return !nft.rolled;
          }
          return true;
        })
.map((nft) => {
  // Ensure metadata and attributes exist
  const metadata = nft.metadata || {};  // Fallback to empty object if metadata is undefined
  const amountAttr = metadata.attributes?.find(attr => attr.trait_type === 'Amount');
  const pooledAttr = metadata.attributes?.find(attr => attr.trait_type === 'Pooled');
  const senderBaseAttr = metadata.attributes?.find(attr => attr.trait_type === 'Sender Basename');
  const receiverBaseAttr = metadata.attributes?.find(attr => attr.trait_type === 'Receiver Basename');

  const amount = amountAttr ? Number(amountAttr.value) : 0;
  const pooled = pooledAttr ? Number(pooledAttr.value) : 0;
  const reputation = (nft.normalized_sender_reputation + nft.normalized_receiver_reputation) / 2;
  const id = nft.id;

  const displaySender = senderBaseAttr && senderBaseAttr.value
    ? senderBaseAttr.value
    : nft.sender_wallet
      ? `${nft.sender_wallet.slice(0, 6)}...${nft.sender_wallet.slice(-4)}`
      : 'Unknown Sender';

  const displayReceiver = receiverBaseAttr && receiverBaseAttr.value
    ? receiverBaseAttr.value
    : nft.receiver_wallet
      ? `${nft.receiver_wallet.slice(0, 6)}...${nft.receiver_wallet.slice(-4)}`
      : 'Unknown Receiver';

  return (
    <Grid
      item
      key={nft.id}
      xs={12 / columns}
      sx={{ cursor: nft.rolled ? 'default' : 'pointer' }}
      onClick={() => onOpenModal(nft, reputation, amount, pooled, id)}
    >
      <Card
        sx={{
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          ':hover img': {
            transform: 'scale(1.1)',
            transition: 'transform 0.3s ease',
          },
          ':hover .roll-button': {
            bottom: 0,
            transition: 'bottom 0.3s ease',
          },
        }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src={metadata.image || 'https://patron.visioncommunity.xyz/img/NFT_MODEL.jpg'}
            alt={metadata.name || 'Unnamed NFT'}
            style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            className="nftimagegallery"
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: '#333',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FontAwesomeIcon icon={faTrophy} style={{ marginRight: '5px' }} />
            <Typography variant="caption">
              {reputation.toFixed(2)}
            </Typography>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: nft.rolled ? '#f44336' : '#4caf50',
              color: '#fff',
              padding: '4px',
              borderRadius: '50%',
            }}
          >
            <FontAwesomeIcon icon={nft.rolled ? faCheckCircle : faCircle} />
          </Box>
        </Box>

        <Box sx={{ padding: '10px' }}>
          <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
            {metadata.name || 'Unnamed NFT'}
          </Typography>
          <Typography variant="body2" color="textSecondary"  className="nftinfogrid">
            Sender: {displaySender}
          </Typography>
          <Typography variant="body2" color="textSecondary"  className="nftinfogrid">
            Receiver: {displayReceiver}
          </Typography>
          <Typography variant="body2" color="textSecondary"  className="nftinfogrid">
            Pooled: {pooled} $VISION
          </Typography>
        </Box>

        <Button
          className="roll-button"
          variant="contained"
          color={nft.rolled ? 'error' : 'primary'}
          startIcon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
          sx={{
            position: 'absolute',
            bottom: '-70px',
            left: 0,
            width: '100%',
            transition: 'bottom 0.3s ease',
          }}
        >
          Check Shard
        </Button>
      </Card>
    </Grid>
  );
})


}
    </Grid>
  );
};

export default NFTGallery;
