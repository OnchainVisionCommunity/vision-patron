import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Avatar, TextField, Container } from '@mui/material';
import { useActiveAccount, ConnectButton } from 'thirdweb/react'; 
import axios from 'axios';
import ReactPlayer from 'react-player';
import UserFeed from './UserFeed';
import CreateProfile from './CreateProfile';
import { connectButtonConfig } from '../config/connectButtonConfig';
import WelcomeTutorial from './WelcomeTutorial';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function Feed() {
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [showNotConnected, setShowNotConnected] = useState(false);
  const [text, setText] = useState('');
  const [hasProfile, setHasProfile] = useState<boolean | null>(null); // State to check if profile exists
  const words = ['communities', 'artists', 'causes', 'influencers', 'builders',  'friends',  'crowdfunding'];
  const typingSpeed = 60; // Speed of typing
  const erasingSpeed = 30; // Speed of erasing
  const delayBetweenWords = 1000; // Delay before erasing begins
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
    const [isNewUser, setIsNewUser] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Fetch profile information when wallet connects
  useEffect(() => {
    let timeout;

    if (account === undefined) {
      // Show loading screen immediately
      setIsLoading(true);
      // Set a timeout for 1.5 seconds to show "not connected" if still undefined
      timeout = setTimeout(() => {
        if (account === undefined) {
          setShowNotConnected(true);
          setIsLoading(false);
        }
      }, 1500);
    } else if (account?.address) {
      // If wallet is connected, fetch profile
      fetchProfile(account.address);
    } else {
      // Stop loading if the account is not connected
      setIsLoading(false);
      setShowNotConnected(false); // Reset not connected state
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [account]);

  // Function to fetch profile data
  const fetchProfile = async (walletAddress: string) => {
    try {
      const response = await axios.get(
        `https://api.visioncommunity.xyz/v02/user/get?wallet=${walletAddress}`
      );
      if (response.status === 200 && response.data.success) {
        setHasProfile(true); // Profile found
      } else {
        setHasProfile(false); // Profile not found
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setHasProfile(false); // Profile not found
      } else {
        console.error('Error fetching profile:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Typing animation logic
  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[wordIndex];
      if (!isDeleting) {
        if (charIndex < currentWord.length) {
          setText((prevText) => prevText + currentWord[charIndex]);
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), delayBetweenWords);
        }
      } else {
        if (charIndex > 0) {
          setText((prevText) => prevText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        }
      }
    };

    const typingTimeout = setTimeout(handleTyping, isDeleting ? erasingSpeed : typingSpeed);
    return () => clearTimeout(typingTimeout);
  }, [charIndex, isDeleting, wordIndex]);

  // Show loading spinner if still loading
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'black',
        }}
      >
        <Typography
          variant="h4"
          className="basefont"
          sx={{
            color: 'white',
            textAlign: 'center',
          }}
        >
          Loading...
        </Typography>
      </Box>
    );
  }

  // If wallet is connected but no profile found, show CreateProfile component
  if (account?.address && hasProfile === false) {
    return <CreateProfile />;
  }

  // If wallet is connected and profile is found, show UserFeed component
  if (account?.address && hasProfile) {
    return <UserFeed />;
  }

  // If no wallet connected and the timeout has passed, show the "not connected" landing page
  return (
    <>
      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'black',
          }}
          
        >
          <Typography
            variant="h4"
            className="basefont"
            sx={{
              color: 'white',
              textAlign: 'center',
            }}
          >
            Loading...
          </Typography>
        </Box>
      ) : account?.address ? (
        // If the wallet is connected, render the UserFeed component
        <UserFeed />
      ) : showNotConnected ? (
        // If wallet is not connected and timeout has passed, show "not connected" page
        <>
          <div className="banner-section">
            {/* Video Background */}
            <video
              className="bg-video"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="https://visioncommunity.xyz/video/bgvideo.mp4" type="video/mp4" />
            </video>

            {/* Dark Overlay */}
            <div className="overlay" />

            {/* Content in the Banner */}
            <Box className="banner-content" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom className="banner-text bannertitle fsizeb">
                support and patronise
              </Typography>

              {/* Typing Animation Section */}
              <Box className="typing-animation" sx={{ marginBottom: '10px', position: 'relative' }}>
                <span id="typed-text">{text}</span>
                <span id="cursor">|</span>
              </Box>

              <Typography variant="h4" gutterBottom className="banner-text bannertitle">
                onchain.
              </Typography>

              {/* Subtitle*/}
              <Box className="subtitle" sx={{ marginBottom: '20px' }}>
                <Typography className="banner-subtitle">
                  A Social Gamified Experience: unlock private communities, boost your onchain reputation,<br/>and collect powerful, tradable community NFTs Shards to win prizes
                </Typography>
              </Box>




              {/* Animated Icons Below */}
              <Box className="animated-icons" sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <a href="https://dexscreener.com/base/0xe659020edd96ff279bfb9680e664e4ed44198c7d" target="_blank"><Avatar src="https://visioncommunity.xyz/wp-content/uploads/elementor/thumbs/dexs-white-quek594srk7qgk52o3qcqltdn710j0h113mq5gfekw.png" className="grow-icon" /></a>
                <a href="https://t.me/onchainvisionbase" target="_blank"><Avatar src="https://visioncommunity.xyz/wp-content/uploads/elementor/thumbs/telegram-white-quek8vsd5j6lacvah67hv6ug7r518xvpv2b7ux1ok0.png" className="grow-icon" /></a>
                <a href="https://x.com/OCVCommunity" target="_blank"><Avatar src="https://visioncommunity.xyz/wp-content/uploads/elementor/thumbs/x-white-quek98094u577czh74358uw3twjil0ivytcq9bkmww.png" className="grow-icon" /></a>
                <a href="https://visioncommunity.xyz/" target="_blank"><Avatar src="https://patron.visioncommunity.xyz/img/icons/www-white.png" className="grow-icon" /></a>
              </Box>
            </Box>

            {/* Image that animates from bottom to top */}
            <img src="https://visioncommunity.xyz/video/proudbuilonbase.png" alt="Built on Base" className="bottom-left-image" />
          </div>


          {/* "What is?" Section */}
          <Box className="what-is-section">
            <Container maxWidth="md" className="what-is-content">
              <Typography variant="h5" gutterBottom className="section-subtitle">
                What is Patron?
              </Typography>
              <Typography variant="h2" gutterBottom className="section-title">
                Discover Our Features
              </Typography>
              <Typography variant="body1" sx={{ mb: 5 }} className="section-description">
                Patron provides incredible solutions for decentralized onchain communities.
              </Typography>

              {/* Block Elements */}
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} md={6}>
                  <Box className="info-block" style={{ backgroundImage: 'url(https://patron.visioncommunity.xyz/img/home/home001.png)' }}>
                    <Typography variant="h6" className="basefont">Private Social Media</Typography>
                    <Typography variant="body2">Users can discover communities to become patrons of. By becoming a patron of a community, the user receives an NFT Shard representing "a piece of that community".</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box className="info-block" style={{ backgroundImage: 'url(https://patron.visioncommunity.xyz/img/home/home002.png)' }}>
                    <Typography variant="h6" className="basefont">Gamified Experience</Typography>
                    <Typography variant="body2">By interacting with communities and other members, patrons gain reputation for themselves and their communities. The higher the reputation, the greater the prizes won within the platform such as lotteries, mini-games and events.</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box className="info-block" style={{ backgroundImage: 'url(https://patron.visioncommunity.xyz/img/home/home003.png)' }}>
                    <Typography variant="h6" className="basefont">Build and Discover Communtities</Typography>
                    <Typography variant="body2">Patron is the perfect platform for creating, growing, and participating in onchain communities. Built entirely on Base and fully on-chain, it ensures transparency and offers rewards for highly engaged communities and active members.</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Container>

            {/* Shape Divider */}
            <Box className="shape-divider" />
          </Box>
          
{/* Features Section */}
<Box className="features-section">
  <Container maxWidth="lg">
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <Box
          className="feature-block"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
          }}
        >
          <Typography variant="h6" className="basefont">Energy</Typography>
          <Typography variant="body2">Patron a community or daily check-in to earn energy</Typography>
          <img
            src="https://patron.visioncommunity.xyz/img/home/energy-icon-home.png"
            className="feature-icon"
            style={{ width: '80px', height: '80px', marginTop: '15px' }}
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={3}>
        <Box
          className="feature-block"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
          }}
        >
          <Typography variant="h6" className="basefont">Reputation</Typography>
          <Typography variant="body2">Use your energy to interact with communities and win reputation</Typography>
          <img
            src="https://patron.visioncommunity.xyz/img/home/reputation-icon-home.png"
            className="feature-icon"
            style={{ width: '80px', height: '80px', marginTop: '15px' }}
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={3}>
        <Box
          className="feature-block"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
          }}
        >
          <Typography variant="h6" className="basefont">Communities</Typography>
          <Typography variant="body2">Patron communities to collect their NFTs Shard</Typography>
          <img
            src="https://patron.visioncommunity.xyz/img/home/community-icon-home.png"
            className="feature-icon"
            style={{ width: '80px', height: '80px', marginTop: '15px' }}
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={3}>
        <Box
          className="feature-block"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
          }}
        >
          <Typography variant="h6" className="basefont">NFT Shards</Typography>
          <Typography variant="body2">Combine the reputations to roll NFTs Shard in lotteries</Typography>
          <img
            src="https://patron.visioncommunity.xyz/img/home/nft-icon-home.png"
            className="feature-icon"
            style={{ width: '80px', height: '80px', marginTop: '15px' }}
          />
        </Box>
      </Grid>
    </Grid>
  </Container>

  {/* Shape Divider */}
  <Box className="shape-divider" />
</Box>

{/* FAQ Section */}
<Box className="faq-section">
  <Container maxWidth="lg">
  <div className="divtitlefaq">
    <Typography variant="h2" gutterBottom className="section-title">
      FAQ
    </Typography>
   </div>
    {/* FAQ Accordion */}
    <Box>
      {
[
  { question: "What is Patron?", answer: "Patron is a gamified social media that reward users (patrons) that supports community and engage in the plantaform through NFT lotteries with $VISION token rewards" },
  { question: "Who created Patron?", answer: "Patron is a decentralized application (dApp) developed by the $VISION community, an open-source and community-driven initiative. The $VISION token serves as a community takeover token (CTO) and a tribute token for Coinbase Vision, though it operates independently and is not affiliated with Coinbase. The Patron project embodies the principles of decentralization, with contributions and governance driven entirely by the community." },
  { question: "How do I join a community?", answer: "You can join a community by signing up and selecting a community to support. You'll receive an NFT shard representing your membership." },
  { question: "What rewards can I earn?", answer: "Active members can earn reputation points and rewards like lotteries, mini-games, and event prizes." },
  { question: "How do I patron a community?", answer: "To patron a community, go to the 'Patron' section and enter the wallet or basename of the community owner you want to patron. If you are searching for a community, explore the 'Communities' section and click the 'Patron me' button." },
  { question: "Can I become a patron of any wallet/basename?", answer: "Yes, the patron system is permissionless, and any EVM wallet can be patroned. However, note that if you patron a community that has not been created yet, the NFT artwork will be generic, and you will not have access to the community since it has not been established." },
  { question: "If I patron a community that is not yet created and it is created in the future, will I have access to it?", answer: "Yes, your patrons are recorded on-chain and are permanent. Therefore, if a wallet creates a community in the future and you have already been a patron of the community before it was created, you will automatically gain access. However, past patrons before the community was established will still have the NFT with the generic artwork, but they will use the system normally." },
  { question: "How do I create my community? Can anyone create a community?", answer: "To create a community, go to 'Communities,' scroll down, and click on the 'Claim Community' button. You will sign with your wallet, and your community will be created. The community creation system is permissionless, and anyone can create communities. However, if a community violates the terms of use, it may be deactivated." },
  { question: "How does the Energy and Reputation system work?", answer: "Reputations are earned through interactions on the site with the community where you are a patron. Energy is the amount required for you to perform an action that generates reputation. Reputations are distributed among users involved in an action and the community where that action took place." },
  { question: "How is the reputation of an NFT calculated?", answer: "The reputation of an NFT is calculated using normalized reputation: ((user + community) / 2)." },
  { question: "What are reputation tiers?", answer: "The system classifies normalized reputation into tiers. Tiers are assigned as follows:\n0 to 20 = Tier 1\n21 to 40 = Tier 2\n41 to 60 = Tier 3\n61 to 80 = Tier 4\nAbove 80 = Tier 5." },
  { question: "If I sell my NFT Shard on the secondary market, will I still have access to the community?", answer: "Yes, even if you sell your NFT Shard, you will still have access to the community as usual." },
  { question: "If I buy an NFT Shard on the secondary market, do I gain access to the community?", answer: "No, NFT Shards have metadata tied to the person who became a patron of a community. If the NFT is not rolled, you can roll it in the lottery; however, it will not grant access to the community." },
  { question: "If I buy an NFT Shard on the secondary market, will the reputation of the NFT change?", answer: "No, the reputation of an NFT is defined by the patron and the community. Therefore, regardless of the owner of an NFT Shard, its status will always be linked to the reputation status of the community and the patron." },
]

      .map((faq, index) => (
        <Accordion key={index}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`faq-content-${index}`}
            id={`faq-header-${index}`}
          >
            <Typography variant="h6">{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  </Container>
</Box>

<div className="homefooter">
Patron is a project powered by OCV (Onchain Vision Community). $VISION is a CTO token and community-driven tribute project. Not affiliated with Coinbase Vision. Developed by <a href="https://x.com/christianpongl/" target="_blank">Chris Pongl</a>.
</div>          
        </>
      ) : null}
    </>
  );
}
