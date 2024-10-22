// components/WelcomeTutorial.tsx
import React, { useState, useRef } from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';

interface WelcomeTutorialProps {
  open: boolean;
  onClose: () => void;
  userAddress: string;
}

const WelcomeTutorial: React.FC<WelcomeTutorialProps> = ({ open, onClose, userAddress }) => {
  // Tutorial steps data
  const tutorialSteps = [
    {
      label: 'Welcome to $Vision Patron',
      imgPath: 'https://patron.visioncommunity.xyz/img/tutorial/step1.png',
      description: 'Welcome to Vision Patron, a gamified social media with privates communities built on Base! Every like counts towards rewards, and it’s a perfect space to build and participate in on-chain communities. Let’s take a quick tour!',
    },
    {
      label: 'How It Works',
      imgPath: 'https://patron.visioncommunity.xyz/img/tutorial/step2.png',
      description: 'Vision Patron runs on two key systems: Energy and Reputation. Energy lets you take actions like liking, posting, or replying. Each action boosts your reputation and the reputation of the community you’re engaging with.',
    },
    {
      label: 'Support Communities',
      imgPath: 'https://patron.visioncommunity.xyz/img/tutorial/step3_3.png',
      description: 'Love a community? Become a patron! Patronizing a community gives you Energy to use and boosts the community’s reputation. It’s a win-win for everyone! You can patronise using your $VISION token or directly swap any token on Base',
    },
    {
      label: 'Earn NFT Shards',
      imgPath: 'https://patron.visioncommunity.xyz/img/tutorial/step4.png',
      description: 'When you patron a community, you earn an NFT Shard. The value of these shards grows as your reputation and the community’s reputation increase within the system.',
    },
    {
      label: 'Roll Your NFTs',
      imgPath: 'https://patron.visioncommunity.xyz/img/tutorial/step5.png',
      description: 'You can "Roll" your NFT Shards for instant rewards. Depending on your reputation score, the rewards can multiply by up to 100x!',
    },
    {
      label: 'More Games Coming Soon',
      imgPath: 'https://patron.visioncommunity.xyz/img/tutorial/step6.png',
      description: 'Not lucky in rolling? No worries! More mini-games are coming to add even more fun and utility to your NFT Shards. Plus, you can always buy or sell them in the marketplace.',
    },
    {
      label: 'Your Journey Begins!',
      imgPath: 'https://patron.visioncommunity.xyz/img/tutorial/step7.png',
      description: 'Are you ready? Patronize communities, collect NFT Shards, boost your on-chain reputation, and decide how you want to play. Welcome to Vision Patron — let the fun begin!',
    },
  ];

  // Create a reference to the Slider instance
  const sliderRef = useRef<any>(null);

  // Slider settings
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false, // Custom navigation with buttons
  };

  // Handle 'Don’t show again' button click
const handleDontShowAgain = async () => {
  try {

    // Make the POST request
    const response = await axios.post('https://api.visioncommunity.xyz/v02/user/welcome/set', {
      wallet: userAddress,
      showTutorial: false,
    });

    onClose(); // Close the modal after success
  } catch (error) {
    // Log the error for debugging
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an error
      console.error('Error message:', error.message);
    }
  }
};


  // Custom handlers for slider navigation
  const handleNext = () => {
    sliderRef.current.slickNext();
  };

  const handlePrev = () => {
    sliderRef.current.slickPrev();
  };

  return (
    <Modal open={open} onClose={onClose}>
<div className="modalparentwelcome">
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '96%',
          maxWidth: '600px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}
        className="modalwelcome"
      >

        <Typography variant="h6" align="center" className="welcometitle">
          {tutorialSteps[0].label}
        </Typography>
        
        <Slider {...settings} ref={sliderRef}>
          {tutorialSteps.map((step, index) => (
            <div key={index}>
              <Box
                component="img"
                src={step.imgPath}
                alt={step.label}
                sx={{
                  width: '100%',
                  height: 'auto',  // Automatically adjusts the height
                  maxHeight: '300px',  // Set a maximum height for larger screens
                  objectFit: 'cover',  // Ensures the image maintains aspect ratio and fills the box
                  '@media (max-width: 600px)': {  // Responsive styling for mobile
                    maxHeight: '200px',  // Decrease max height on smaller screens
                  },
                }}
              />
              <Typography align="center" sx={{ mt: 2 }} className="welcometext">
                {step.description}
              </Typography>
            </div>
          ))}
        </Slider>

        {/* Next and Previous Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button onClick={handlePrev} sx={{ textTransform: 'none' }} className="btnslideadvwelcome">
            Previous
          </Button>
          <Button onClick={handleNext} sx={{ textTransform: 'none' }} className="btnslideadvwelcome">
            Next
          </Button>
        </Box>

        {/* Don't Show Again / Close Buttons */}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}><div className="tutorialoptbtn">
          <Button onClick={onClose} sx={{ textTransform: 'none' }} className="btnpatronme">
            I'll check it later
          </Button>
          <Button onClick={handleDontShowAgain} sx={{ textTransform: 'none' }} className="btnpatronmecancel">
            Don’t show it again
          </Button>
        </div></Box>

      </Box>
      </div>
    </Modal>
  );
};

export default WelcomeTutorial;
