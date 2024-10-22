import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useActiveAccount } from "thirdweb/react";  
import { signMessage } from "thirdweb/utils";
import axios from "axios";

const CreateProfile: React.FC = () => {
  const account = useActiveAccount();
  const createProfile = async () => {
    if (!account?.address) {
      return;
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const message = `Sign to create your profile for wallet: ${account.address} at ${timestamp}`;
      const signature = await signMessage({ account, message });

      await axios.post("https://api.visioncommunity.xyz/v02/user/create", {
        walletAddress: account.address,
        signature,
        message,
        timestamp,
      });
      window.location.reload();
    } catch (error) {
      console.error("Profile creation error:", error);
    }
  };

  // Wallet not connected
  if (!account?.address) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography className="walletnotconn">
          Please connect your wallet/sign-in to create your profile.
        </Typography>
      </Box>
    );
  }

  // Display button to create profile
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Button variant="contained" color="primary" onClick={createProfile} className="btnpatronme">
        Create my VISION PATRON profile
      </Button>
    </Box>
  );
};

export default CreateProfile;
