import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import { resolveL2Name, BASENAME_RESOLVER_ADDRESS } from "thirdweb/extensions/ens";
import { base } from "thirdweb/chains";
import { useSigner, useAddress } from "@thirdweb-dev/react";
import AvatarUpload from "../editcommunity/AvatarUpload";

// Import the client from your Thirdweb configuration
import { client } from "../../client";

// Helper function to truncate wallet address
const truncateWallet = (wallet: string): string => `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

interface ProfileData {
  wallet: string;
  avatar?: string;
  basename?: string;
  social?: {
    twitter?: {
      status?: string;
      account?: string;
    };
    instagram?: {
      status?: string;
      account?: string;
    };
    warpcast?: {
      status?: string;
      account?: string;
    };
    lunchbreak?: {
      status?: string;
      account?: string;
    };
  };
}

interface ProfileRightProps {
  profileData: ProfileData;
}

const ProfileRight: React.FC<ProfileRightProps> = ({ profileData }) => {
  const [useBasename, setUseBasename] = useState(profileData?.basename ? true : false);
  const [resolvedBasename, setResolvedBasename] = useState<string | null>(profileData?.basename || null);
  const [basenameError, setBasenameError] = useState<string | null>(null);
  const [twitterConnected, setTwitterConnected] = useState(profileData?.social?.twitter?.status === "yes");
  const [twitterAccount, setTwitterAccount] = useState(profileData?.social?.twitter?.account || "");
  const signer = useSigner();
  const walletAddress = useAddress();

  const [avatar, setAvatar] = useState(profileData?.avatar || "/default-avatar.png");
  const [socialMedia, setSocialMedia] = useState({
    lunchbreak: profileData?.social?.lunchbreak?.account || "",
  });

  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalError, setModalError] = useState(false);

  useEffect(() => {
    // Check if Twitter is connected based on the API response
    setTwitterConnected(profileData?.social?.twitter?.status === "yes");
    setTwitterAccount(profileData?.social?.twitter?.account || "");

    // Resolve the Basename if not available in the API response
    if (!resolvedBasename && profileData?.wallet) {
      resolveL2Name({
        client,
        address: profileData.wallet,
        resolverAddress: BASENAME_RESOLVER_ADDRESS,
        resolverChain: base,
      })
        .then((name) => {
          if (name) setResolvedBasename(name);
        })
        .catch((error) => {
          console.error("Error resolving Basename:", error);
        });
    }
  }, [profileData, resolvedBasename]);

  const saveProfile = async () => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const message = `Updating profile for ${walletAddress} at ${timestamp}`;
      const signature = await signer?.signMessage(message);

      const updatedData = {
        avatar: avatar,
        socialLinks: {
          twitter: twitterAccount,
          lunchbreak: socialMedia.lunchbreak,
        },
        basename: useBasename ? resolvedBasename : null,
        walletAddress: walletAddress,
        signature: signature,
        timestamp: timestamp,
      };

      const response = await axios.put(`https://api.visioncommunity.xyz/v02/user/update`, updatedData);

      if (response.data.success) {
        setModalMessage("Profile updated successfully!");
        setModalError(false);
        setOpenModal(true);
      } else {
        setModalMessage("Failed to update profile. Please try again.");
        setModalError(true);
        setOpenModal(true);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setModalMessage("Error occurred while saving profile.");
      setModalError(true);
      setOpenModal(true);
    }
  };

  const handleTwitterConnect = async () => {
    try {
      window.location.href = `https://api.visioncommunity.xyz/v02/connection/twitter/connect?community_id=${profileData.wallet}`;
    } catch (error) {
      console.error("Error connecting Twitter:", error);
    }
  };

  const handleBasenameToggle = async () => {
    if (useBasename) {
      setUseBasename(false);
      setBasenameError(null);
    } else {
      try {
        const name = await resolveL2Name({
          client,
          address: profileData.wallet,
          resolverAddress: BASENAME_RESOLVER_ADDRESS,
          resolverChain: base,
        });

        if (name) {
          setResolvedBasename(name);
          setUseBasename(true);
          setBasenameError(null);
        } else {
          setBasenameError("No Basename found for this wallet.");
        }
      } catch (error) {
        setBasenameError("Error resolving Basename. Please try again.");
        setUseBasename(false);
      }
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Box sx={{ padding: "2rem", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}>
      {/* Header with Edit and Public Profile button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography className="basefontblcktitle">Edit Profile</Typography>
        <Button variant="contained" className="btnpatronme" onClick={() => window.open(`/profile/${profileData?.wallet}`, "_blank")}>
          View Public Profile
        </Button>
      </Box>

      {/* Avatar Upload Component */}
      <AvatarUpload avatar={avatar} setAvatar={setAvatar} />

      {/* Basename and Social Media */}
      <Box mt={3}>
        <FormControlLabel
          control={<Switch checked={useBasename} onChange={handleBasenameToggle} color="primary" />}
          label={useBasename ? "Revert to Wallet Address" : "Use Basename"}
          sx={{ mb: 3 }}
        />

        {basenameError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {basenameError}{" "}
            <a href="https://www.base.org/names" target="_blank" rel="noopener noreferrer" style={{ color: "#1976d2" }}>
              Get a Basename here.
            </a>
          </Alert>
        )}

        {/* Display Wallet or Basename */}
        <Typography className="basefontblue" fontWeight="bold" sx={{ mb: 2 }}>
          {useBasename && resolvedBasename ? resolvedBasename : truncateWallet(profileData.wallet)}
        </Typography>

        {/* Twitter Section */}
        {twitterConnected ? (
          <TextField label="Twitter" value={twitterAccount} fullWidth margin="normal" variant="outlined" disabled sx={{ mb: 2 }} />
        ) : (
          <Button variant="outlined" color="primary" onClick={handleTwitterConnect} fullWidth sx={{ mb: 2 }}>
            Connect Twitter
          </Button>
        )}

        {/* Lunchbreak (Editable) */}
        <TextField
          label="Lunchbreak"
          value={socialMedia.lunchbreak}
          onChange={(e) => setSocialMedia({ ...socialMedia, lunchbreak: e.target.value })}
          fullWidth
          margin="normal"
          variant="outlined"
        />
      </Box>

      {/* Save Button */}
      <Button variant="contained" className="btnpatronme" sx={{ mt: 4, width: "100%" }} onClick={saveProfile}>
        Save Changes
      </Button>

      {/* Modal for Success/Error Messages */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle className="basefont">{modalError ? "Error" : "Success"}</DialogTitle>
        <DialogContent>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} className="btnpatronme" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileRight;
