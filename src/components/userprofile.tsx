import React, { useState, useEffect } from "react";
import { Box, Grid, CircularProgress, Typography, Button } from "@mui/material";
import { useAddress, useSigner } from "@thirdweb-dev/react";
import axios from "axios";
import ProfileLeft from "./profile/ProfileLeft";
import ProfileRight from "./profile/ProfileRight";

// Define the shape of the user data you expect from the API
interface Community {
  receiver_wallet: string;
  amount: string;
  details?: {
    avatar?: string;
    basename?: string;
  };
}

interface Notification {
  sender: string;
  date: string;
  announcement_id: string;
}

interface UserProfileData {
  user: {
    wallet: string;
    avatar?: string;
    basename?: string;
    social?: {
      twitter?: {
        status: string;
        account: string;
      };
      instagram?: {
        status: string;
        account: string;
      };
      warpcast?: {
        status: string;
        account: string;
      };
      lunchbreak?: {
        status: string;
        account: string;
      };
    };
  };
  patronCommunities: Community[]; // Make patronCommunities mandatory
  notifications: Notification[];
}

const UserProfile: React.FC = () => {
  const address = useAddress();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null); // Explicitly typed profileData
  const [loading, setLoading] = useState(true);
  const signer = useSigner();

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!address) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `https://api.visioncommunity.xyz/v02/user/get?wallet=${address}`
        );
        console.log("API Response:", response.data); // Log the API response for debugging

        const { data } = response;
        if (data.success) {
          setProfileData({
            ...data,
            patronCommunities: data.patronCommunities || [], // Ensure it's an empty array if not present
          });
        } else {
          setProfileData(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [address]);

  // Profile creation
  const createProfile = async () => {
    if (!signer) return;
    try {
      const timestamp = Math.floor(Date.now() / 1000); // Generate the current timestamp
      const message = `Sign to create your profile for wallet: ${address} at ${timestamp}`;
      const signature = await signer.signMessage(message);

      await axios.post("https://api.visioncommunity.xyz/v02/user/create", {
        walletAddress: address,
        signature,
        message,
        timestamp,
      });
      window.location.reload(); // Refresh page to load the new profile
    } catch (error) {
      console.error("Profile creation error:", error);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Wallet not connected
  if (!address) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h5">
          Please connect your wallet to view your profile.
        </Typography>
      </Box>
    );
  }

  // No profile found
  if (!profileData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Button
          variant="contained"
          color="primary"
          onClick={createProfile}
          className="btnpatronme"
        >
          Create my VISION PATRON profile
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", padding: "2%", minHeight: "100vh" }}>
      <Grid container spacing={4}>
        {/* Right Side (Avatar, Edit Profile, Social Media) */}
        <Grid item xs={12} md={4} order={{ xs: 1, md: 1 }}>
          <ProfileRight profileData={profileData.user} />
        </Grid>

        {/* Left Side (Communities, Badges, Notifications) */}
        <Grid item xs={12} md={8} order={{ xs: 2, md: 2 }}>
          <ProfileLeft profileData={profileData} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile;
