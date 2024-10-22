import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Avatar, TextField, Container } from '@mui/material';
import { useActiveAccount, ConnectButton } from 'thirdweb/react'; 
import axios from 'axios';
import ReactPlayer from 'react-player';
import UserFeed from './UserFeed';
import CreateProfile from './CreateProfile';
import { connectButtonConfig } from '../config/connectButtonConfig';
import WelcomeTutorial from './WelcomeTutorial';

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
                  <Box className="info-block" style={{ backgroundImage: 'url(/block1.jpg)' }}>
                    <Typography variant="h6">Private Social Media</Typography>
                    <Typography variant="body2">Users can discover communities to become patrons of. By becoming a patron of a community, the user receives an NFT Shard representing "a piece of that community".</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box className="info-block" style={{ backgroundImage: 'url(/block2.jpg)' }}>
                    <Typography variant="h6">Gamified Experience</Typography>
                    <Typography variant="body2">By interacting with communities and other members, patrons gain reputation for themselves and their communities. The higher the reputation, the greater the prizes won within the platform such as lotteries, mini-games and events.</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box className="info-block" style={{ backgroundImage: 'url(/block3.jpg)' }}>
                    <Typography variant="h6">Build and Discover Communtities</Typography>
                    <Typography variant="body2">Patron is the perfect platform for creating, growing, and participating in onchain communities. Built entirely on Base and fully on-chain, it ensures transparency and offers rewards for highly engaged communities and active members.</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Container>

            {/* Shape Divider */}
            <Box className="shape-divider" />
          </Box>
          
        </>
      ) : null}
    </>
  );
}
