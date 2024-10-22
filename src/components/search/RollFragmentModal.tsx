import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Modal, Popover, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faTrophy, faFire, faCheckCircle, faTimesCircle, faSpinner, faQuestionCircle, faCircle } from '@fortawesome/free-solid-svg-icons';
import { useActiveAccount } from 'thirdweb/react';
import { signMessage } from 'thirdweb/utils';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Assuming you're using react-router-dom for navigation

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

interface RollFragmentModalProps {
  open: boolean;
  onClose: () => void;
  nft: NFT;
  reputation: number;
  amount: number; // Passed from onOpenModal
  pooled: number; // Passed from onOpenModal
  id: string;     // Passed from onOpenModal
}

const RollFragmentModal: React.FC<RollFragmentModalProps> = ({
  open,
  onClose,
  nft,
  amount,
  pooled,
  id,
}) => {
  const [displayReputation, setDisplayReputation] = useState(0);
  const [displayMaxPrize, setDisplayMaxPrize] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [wonPrize, setWonPrize] = useState<number>(0);
  const [rolled, setRolled] = useState(false);
  const account = useActiveAccount();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [animationClass, setAnimationClass] = useState('');

  // Calculate average reputation
  const averageReputation = (nft.normalized_sender_reputation + nft.normalized_receiver_reputation) / 2;

  // Calculate the luck factor based on the average reputation
  const luckFactor = averageReputation;

  // Determine the luck tier based on the luck factor
  const getLuckTier = (luckFactor: number) => {
    if (luckFactor < 20) return 1; // Very Low Luck
    if (luckFactor < 40) return 2; // Low Luck
    if (luckFactor < 60) return 3; // Average Luck
    if (luckFactor < 80) return 4; // Good Luck
    return 5; // Excellent Luck
  };

  const luckTier = getLuckTier(luckFactor);

  // Calculate max prize based on luck tier
  const getMaxPrizeForTier = (tier: number, pooled: number) => {
    switch (tier) {
      case 1:
        return pooled * 1.5;
      case 2:
        return pooled * 5.0;
      case 3:
        return pooled * 100.0;
      case 4:
        return pooled * 500.0;
      case 5:
        return pooled * 1000.0;
      default:
        return 0;
    }
  };

  useEffect(() => {
    if (open) {
      let startValue = 0;
      const increment = averageReputation / 100;

      const counter = setInterval(() => {
        startValue += increment;
        if (startValue >= averageReputation) {
          clearInterval(counter);
          startValue = averageReputation;
        }
        setDisplayReputation(Math.floor(startValue));
      }, 15);

      // Calculate max prize value based on the pooled amount and luck tier
      const maxPrizeTarget = getMaxPrizeForTier(luckTier, nft.pooled);
      let maxPrizeValue = 0;
      const maxPrizeIncrement = maxPrizeTarget / 100;

      const maxPrizeCounter = setInterval(() => {
        maxPrizeValue += maxPrizeIncrement;
        if (maxPrizeValue >= maxPrizeTarget) {
          clearInterval(maxPrizeCounter);
          maxPrizeValue = maxPrizeTarget;
        }
        setDisplayMaxPrize(Number(maxPrizeValue.toFixed(2)));
      }, 15);
    }
  }, [open, averageReputation, luckTier, nft.pooled]);
  
  useEffect(() => {
  if (open && isMobile) {
    setAnimationClass('slide-in'); // Start the slide-in animation when opening
  } else if (!open && isMobile) {
    setAnimationClass('slide-out'); // Start the slide-out animation when closing
  }
}, [open, isMobile]);
const handleClose = () => {
  if (isMobile) {
    setAnimationClass('slide-out'); // Trigger slide-out animation
    setTimeout(onClose, 300); // Delay closing to allow animation to complete
  } else {
    onClose();
  }
};

  const formatReputation = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value;
  };

  const formatPrize = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);

const handleRollFragment = async () => {
  if (!account?.address) {
    alert("Wallet is not connected");
    return;
  }

  try {
    setLoading(true);
    setMessage("Rolling NFT, please wait...");
    setMessageType(null); // Only show the message while processing

    const timestamp = Math.floor(Date.now() / 1000);
    const message = `I want to roll the fragment with NFT id: ${nft.id} by ${account.address} at ${timestamp}`;

    const signature = await signMessage({
      account,
      message,
    });

    const response = await axios.post(
      "https://api.visioncommunity.xyz/v02/nft/roll",
      {
        walletAddress: account.address,
        signature,
        message,
        timestamp,
        nftId: nft.id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      const prize = parseFloat(response.data.prize); // Convert prize from string to number
      const transactionHash = response.data.transaction_hash; // Get the transaction hash
      setWonPrize(prize);
      setRolled(true); // Mark as rolled after success
      setMessageType("success");

      if (prize > 0) {
        setMessage(
          `Fragment rolled successfully! You won ${prize.toFixed(2)} $VISION. The tokens have been sent to your wallet.`
        );
        setMessage(
          <span>
            Fragment rolled successfully! You won {prize.toFixed(2)} $VISION. The tokens have been sent to your wallet.{' '}
            <a
              href={`https://basescan.org/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0070f3' }}
            >
              View on BaseScan
            </a>
          </span>
        );
      } else {
        setMessage("Fragment rolled successfully, but you won no prize.");
      }
    } else if (response.data.error === 'NFT has already been rolled.') {
      setMessageType("error");
      setMessage(
        <span>
          You already rolled this fragment.
        </span>
      );
    } else {
      setMessage(response.data.message || "Failed to roll the fragment.");
      setMessageType("error");
    }
  } catch (error) {
    if (error.message.includes('User denied message signature')) {
      setMessage("User did not sign the message.");
      setMessageType("error");
    } else {
      console.error("Error rolling fragment:", error);
      setMessage("An error occurred while rolling the fragment.");
      setMessageType("error");
    }
  } finally {
    setLoading(false);
  }
};


  const displayWalletAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const getBasenameOrWallet = (wallet: string, basenameAttr?: string) =>
    basenameAttr || displayWalletAddress(wallet);

  const renderLuckCircles = (tier: number) => {
    const circles = [];
    for (let i = 1; i <= 5; i++) {
      circles.push(
        <FontAwesomeIcon
          key={i}
          icon={faCircle}
          style={{
            marginRight: '5px',
            color: i <= tier ? '#4caf50' : '#ccc',
            strokeWidth: 1,
            stroke: '#333',
          }}
        />
      );
    }
    return circles;
  };

  const senderBaseName = nft.metadata.attributes.find(attr => attr.trait_type === 'Sender Basename')?.value as string;
  const receiverBaseName = nft.metadata.attributes.find(attr => attr.trait_type === 'Receiver Basename')?.value as string;

  return (
    <Modal
      open={open}
      onClose={handleClose} 
      aria-labelledby="roll-fragment-modal-title"
      aria-describedby="roll-fragment-modal-description"
      sx={{
        display: 'flex',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        overflowY: 'auto',
        zIndex: 9991,
      }}
    >
      <Box
        sx={{
          width: { xs: '90%', md: 600 },
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: 4,
          boxShadow: 24,
          position: 'relative',
        }}
        className={`nftshardmodal ${isMobile ? animationClass : ''}`}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, mb: 2 }}>
          <Box
            sx={{
              flex: 1,
              mb: { xs: 2, md: 0 },
              textAlign: 'center',
              animation: loading ? 'spin3D 2s linear infinite' : 'none', // Add spinning animation when loading
            }}
          >
            <img
              src={nft.metadata.image}
              alt={nft.metadata.name}
              style={{ width: '100%', height: 'auto', borderRadius: '8px', transformStyle: 'preserve-3d' }} // 3D spin
            />
          </Box>

          <Box sx={{ flex: 1, paddingLeft: { xs: 0, md: 3 }, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography id="roll-fragment-modal-title" sx={{ fontWeight: 'bold', color: '#000' }} className="nfttitle">
              {nft.metadata.name}
            </Typography>
            <Typography sx={{ mb: 2 }} className="nftsubtitle">
              {getBasenameOrWallet(nft.receiver_wallet, receiverBaseName)} NFT Fragment
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
<Box>
  <Typography variant="body1" sx={{ color: '#000', fontWeight: 'bold' }}>
    Patron
  </Typography>
  <Typography variant="body2" sx={{ color: '#555' }}>
    {getBasenameOrWallet(nft.sender_wallet, senderBaseName)}
  </Typography>
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center', // Center vertically
      justifyContent: 'center', // Center horizontally
      mt: 1,
    }}
  >
    <Typography
      variant="body2"
      sx={{
        color: '#0070f3',
        mr: 0.5, // Space between the number and the icon
      }}
    >
      {nft.normalized_sender_reputation.toFixed(1)} / 100
    </Typography>
    <FontAwesomeIcon icon={faTrophy} style={{ color: '#0070f3' }} />
  </Box>
</Box>

<Box>
  <Typography variant="body1" sx={{ color: '#000', fontWeight: 'bold' }}>
    Community
  </Typography>
  <Typography variant="body2" sx={{ color: '#555' }}>
    {getBasenameOrWallet(nft.receiver_wallet, receiverBaseName)}
  </Typography>
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center', // Center vertically
      justifyContent: 'center', // Center horizontally
      mt: 1,
    }}
  >
    <Typography
      variant="body2"
      sx={{
        color: '#0070f3',
        mr: 0.5, // Space between the number and the icon
      }}
    >
      {nft.normalized_receiver_reputation.toFixed(1)} / 100
    </Typography>
    <FontAwesomeIcon icon={faTrophy} style={{ color: '#0070f3' }} />
  </Box>
</Box>


              <Box>
                <Typography variant="body1" sx={{ color: '#000', fontWeight: 'bold' }}>
                  Pooled
                </Typography>
                <Typography variant="body2" sx={{ color: '#555' }}>
                  {nft.pooled} $VISION
                </Typography>
              </Box>
            </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }} className="rollednotrolled">
              {rolled || nft.rolled ? 'This NFT Shard has already been rolled' : loading ? 'Processing...' : 'This NFT Shard has not been rolled'}
            </Typography>
          </Box>
          </Box>
        </Box>

        {/* Display Reputation with Tooltip and Luck Indicator */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f7f7f7',
            padding: 2,
            borderRadius: '8px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FontAwesomeIcon icon={faTrophy} style={{ marginRight: '8px', color: '#ffbf00' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
              {displayReputation.toFixed(1)}/100.0 Reputation
            </Typography>

            <Tooltip
              title="The NFT shard reputation is dynamically calculated as the average of the patron's and community's reputations, benchmarked against the entire system. This results in a score ranging from 0 to 100"
              arrow
              placement="top"
            >
              <IconButton sx={{ ml: 1 }}>
                <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#0070f3' }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderLuckCircles(luckTier)}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f7f7f7',
            padding: 2,
            borderRadius: '8px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
              NFT max prize is {formatPrize(displayMaxPrize)} $VISION
            </Typography>
          </Box>

          <Tooltip
            title="The potential winnings increase based on the NFT shard's reputation, which ranges from 0 to 100. Maximum prizes start at 1.2x and can reach up to 100x, depending on the amount pooled."
            arrow
            placement="top"
          >
            <IconButton sx={{ ml: 1 }}>
              <FontAwesomeIcon icon={faQuestionCircle} style={{ color: '#0070f3' }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Message Box for success/error */}
        {loading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#fffbe6',
              padding: 2,
              borderRadius: '8px',
              mb: 3,
            }}
          >
            <FontAwesomeIcon
              icon={faSpinner}
              spin={true}
              style={{
                marginRight: '8px',
                color: '#f0ad4e',
              }}
            />
            <Typography variant="body1" sx={{ color: '#f0ad4e', fontWeight: 'bold' }}>
              Rolling NFT, please wait...
            </Typography>
          </Box>
        )}
        {message && !loading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: messageType === 'success' ? '#e6ffe6' : '#ffe6e6',
              padding: 2,
              borderRadius: '8px',
              mb: 3,
            }}
          >
            <FontAwesomeIcon
              icon={messageType === 'success' ? faCheckCircle : faTimesCircle}
              style={{
                marginRight: '8px',
                color: messageType === 'success' ? '#4caf50' : '#ff4500',
              }}
            />
            <Typography variant="body1" sx={{ color: messageType === 'success' ? '#4caf50' : '#ff4500', fontWeight: 'bold' }}>
              {message}{' '}

            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
	  <Button
	    className="btnpatronme"
	    sx={{ flex: 1, mr: 1 }}
	    onClick={() => window.open(`https://opensea.io/assets/base/${process.env.NEXT_PUBLIC_VISION_AIRDROP_CONTRACT}/${nft.id}`, '_blank')}
	  >
	    See on Opensea
	  </Button>
          <Button className="btnpatronmecancel" onClick={onClose} sx={{ flex: 1 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RollFragmentModal;
