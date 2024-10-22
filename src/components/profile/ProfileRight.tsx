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
  IconButton,
} from "@mui/material";
import axios from "axios";
import { resolveL2Name, BASENAME_RESOLVER_ADDRESS } from "thirdweb/extensions/ens";
import { base } from "thirdweb/chains";
import { useActiveAccount } from "thirdweb/react"; 
import { signMessage } from "thirdweb/utils";
import AvatarUpload from "../editprofile/AvatarUpload";
import BannerUpload from "../editprofile/BannerUpload";
import { createThirdwebClient } from "thirdweb"; 
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditIcon from '@mui/icons-material/Edit';

//WARPCAST INTEGRATION
import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider, SignInButton } from "@farcaster/auth-kit";
const config = {
  domain: 'visioncommunity.xyz',
  siweUri: 'https://api.visioncommunity.xyz/v02/connection/warpcast/connect',
  rpcUrl: process.env.NEXT_PUBLIC_OP,
  relay: 'https://relay.farcaster.xyz',
};

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
    site?: {
      status?: string;
      account?: string;
    };
  };
}

interface ProfileRightProps {
  profileData: ProfileData;
  connectionType: string;
}

const ProfileRight: React.FC<ProfileRightProps> = ({ profileData, connectionType }) => {
  const [useBasename, setUseBasename] = useState(profileData?.basename ? true : false);
  const [resolvedBasename, setResolvedBasename] = useState<string | null>(profileData?.basename || null);
  const [basenameError, setBasenameError] = useState<string | null>(null);

  const [avatar, setAvatar] = useState(profileData?.avatar || "https://api.visioncommunity.xyz/img/placeholder/avatar.jpg");
  const [banner, setBanner] = useState("https://api.visioncommunity.xyz/img/placeholder/banner.png");
  const [socialMedia, setSocialMedia] = useState({
    lunchbreak: profileData?.social?.lunchbreak?.account || "",
    site: profileData?.social?.site?.account || "",
  });

  const [twitterConnected, setTwitterConnected] = useState(profileData?.social?.twitter?.status === "yes");
  const [twitterAccount, setTwitterAccount] = useState(profileData?.social?.twitter?.account || "");
  const [warpcastConnected, setWarpcastConnected] = useState(profileData?.social?.warpcast?.status === "yes");
  const [instagramConnected, setInstagramConnected] = useState(profileData?.social?.instagram?.status === "yes");

  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalError, setModalError] = useState(false);
  const account = useActiveAccount();
const [warpcastConnecting, setWarpcastConnecting] = useState(false);
const [warpcastUsername, setWarpcastUsername] = useState<string | null>(null);


  const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  });

useEffect(() => {
  // Ensure Twitter, Instagram, Warpcast, and other social media are updated
  setTwitterConnected(profileData?.social?.social?.twitter?.status === "yes");
  setTwitterAccount(profileData?.social?.social?.twitter?.account || "");
  setWarpcastConnected(profileData?.social?.social?.warpcast?.status === "yes");
  setInstagramConnected(profileData?.social?.social?.instagram?.status === "yes");

  setSocialMedia({
    lunchbreak: profileData?.social?.social?.lunchbreak?.account || "",
    site: profileData?.social?.social?.site?.account || "",
  });

  // Ensure Banner and Avatar are updated from profile data
  setAvatar(profileData?.avatar || "https://api.visioncommunity.xyz/img/placeholder/avatar.jpg");
  setBanner(profileData?.banner || "https://api.visioncommunity.xyz/img/placeholder/banner.png");

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
    if (!account?.address) {
      console.error("No active account available");
      return;
    }

    // Re-check and resolve the Basename before proceeding
    let finalBasename = null;
    if (useBasename && profileData?.wallet) {
      try {
        const resolvedName = await resolveL2Name({
          client,
          address: profileData.wallet,
          resolverAddress: BASENAME_RESOLVER_ADDRESS,
          resolverChain: base,
        });

        if (resolvedName) {
          finalBasename = resolvedName; // If valid, use this as the basename
        } else {
          throw new Error("No valid Basename found for this wallet.");
        }
      } catch (error) {
        console.error("Error resolving Basename:", error);
        setModalMessage("Failed to resolve Basename. Please try again.");
        setModalError(true);
        setOpenModal(true);
        return;
      }
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const message = `Updating profile for ${account.address} at ${timestamp}`;

    // Use the SDK v5 signMessage function
    const signature = await signMessage({
      account,
      message,
    });

    // Construct the data to be sent to the backend
    const updatedData = {
      avatar: avatar,
      banner: banner, // Include banner in the data
      socialLinks: {
        lunchbreak: socialMedia.lunchbreak,
        site: socialMedia.site,
      },
      basename: finalBasename, // Ensure we pass the re-validated Basename
      walletAddress: account.address,
      signature: signature,
      timestamp: timestamp,
    };

    // Send the updated profile data to the backend
    const response = await axios.put(`https://api.visioncommunity.xyz/v02/user/update`, updatedData);

    if (response.data.success) {
      setModalMessage("Profile updated successfully! Reloading page...");
      setModalError(false);
      setOpenModal(true);
      setTimeout(() => {
        window.location.reload(); // Reload page on successful profile update
      }, 1000);
    } else {
      setModalMessage("Failed to update profile. Please try again.");
      setModalError(true);
      setOpenModal(true);
      console.log(response);
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
      window.location.href = `https://api.visioncommunity.xyz/v02/connection/twitter/connect?type=user&wallet=${profileData.wallet}`;
    } catch (error) {
      console.error("Error connecting Twitter:", error);
    }
  };


  const handleInstagramConnect = async () => {
    try {
      // Logic to connect Instagram
    } catch (error) {
      console.error("Error connecting Instagram:", error);
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
		console.log("Resolved Basename:", name);
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
  
  
  
  
  
const handleWarpcastLoginSuccess = (fid: number, username: string) => {
  if (!account?.address) {
    console.error("No wallet connected");
    return;
  }

  axios
    .post("https://api.visioncommunity.xyz/v02/connection/warpcast/connect", {
      fid,
      username,
      wallet: account.address,  // Use the actual connected wallet address
      type: connectionType,     // Send the type (user or community)
    })
    .then((response) => {
      if (response.data.success) {
        console.log("Warpcast account connected successfully");
        setWarpcastConnected(true);
        setWarpcastUsername(username);  // Store the connected username
      } else {
        console.error("Failed to connect Warpcast account");
      }
    })
    .catch((error) => {
      console.error("Error connecting Warpcast account", error);
    });
};

  
  
  
  
  
  

  return (

    <Box sx={{  borderRadius: "8px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }} className="boxleft">
      {/* Header with Edit and Public Profile button */}
<AuthKitProvider config={config}>

      {/* Banner with Avatar */}
<Box position="relative" mb={3} textAlign="center">
  {/* Banner */}  
  <BannerUpload banner={banner} setBanner={setBanner} style={{ width: "100%", height: "200px", objectFit: "cover" }} />

  {/* View Public Profile button in the top-right corner of the banner */}
  <Box position="absolute" top="10px" left="10px">
    <Button
      variant="contained"
      className="btnpatronme"
      size="small"
      onClick={() => window.open(`/profile/${profileData?.wallet}`, "_blank")}
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white",
        padding: "4px 8px",
      }}
    >
      View Profile
      <OpenInNewIcon sx={{ ml: 1, fontSize: "16px" }} />
    </Button>
  </Box>

  {/* Avatar at the bottom center of the banner */}
  <Box position="absolute" left="50%" bottom="-50px" style={{ transform: "translateX(-50%)" }}>
    <AvatarUpload avatar={avatar} setAvatar={setAvatar} />
  </Box>
</Box>



      {/* Display Wallet or Basename */}
      <hr className="sep" />
      <div className="profileNametitle">
        <h4>Public Name</h4>
        <Typography className="basefontblue profilenamecont" fontWeight="bold" sx={{ mb: 0 }}>
          {useBasename && resolvedBasename ? resolvedBasename : truncateWallet(profileData.wallet)}
        </Typography>
      </div>

      {/* Basename and Social Media */}
      <Box mt={3}>
        <div className="classBaseNameProfile">
          <FormControlLabel
            control={
              <Switch
                checked={useBasename}
                onChange={handleBasenameToggle}
                sx={{
                  "& .MuiSwitch-switchBase": {
                    color: "#fff", // Thumb color when unchecked
                  },
                  "& .MuiSwitch-switchBase + .MuiSwitch-track": {
                    backgroundColor: "#ffccbc", // Track color when unchecked
                  },
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#fff", // Thumb color when checked
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#0070f3", // Track color when checked
                  },
                }}
              />
            }
            label={useBasename ? "Revert to Wallet Address" : "Use Basename"}
            sx={{ mb: 2 }}
          />
        </div>

        {basenameError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {basenameError}{" "}
            <a href="https://www.base.org/names" target="_blank" rel="noopener noreferrer" style={{ color: "#1976d2" }}>
              Get a Basename here.
            </a>
          </Alert>
        )}

        <Box
          sx={{
            border: '1px solid #666',
            borderRadius: '10px',
            padding: '10px',
            mt: 1,
          }}
        >
          {/* Section Heading */}
          <div className="socialmedia">Social Media</div>

          {/* Twitter Section */}
          {twitterConnected ? (
            <Button variant="outlined" className="btnpatronme" fullWidth sx={{ mb: 2 }} disabled>
              Twitter Connected [{twitterAccount}]
            </Button>
          ) : (
            <Button variant="outlined" className="btnpatronme" onClick={handleTwitterConnect} fullWidth sx={{ mb: 2 }}>
              Connect Twitter
            </Button>
          )}

{/* Warpcast Section */}
{warpcastConnected ? (
  <Button
    variant="outlined"
    fullWidth
    disabled
    className="btnpatronme"
    sx={{ mb: 2 }}
  >
    Connected Warpcast [{warpcastUsername || profileData.social?.social?.warpcast?.account || ""}]
  </Button>
) : (
  <>
    {/* Connect Warpcast Button */}
    <Box display="flex" justifyContent="center" fullWidth sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        fullWidth
        className="btnpatronme fullwidth"
        onClick={() => setWarpcastConnecting(true)}
      >
        Connect Warpcast
      </Button>
    </Box>

    {/* Show SignInButton only after clicking Connect */}
    {warpcastConnecting && (
      <Box display="flex" justifyContent="center" fullWidth sx={{ mb: 2 }}>
        <SignInButton
          onSuccess={({ fid, username }) => handleWarpcastLoginSuccess(fid, username)}
          onError={(error) => console.error("Login error", error)}
        />
      </Box>
    )}
  </>
)}



          {/* Site (Editable) */}
          <TextField
            label="Site"
            value={socialMedia.site}
            onChange={(e) => setSocialMedia({ ...socialMedia, site: e.target.value })}
            fullWidth
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                color: "white",
                borderRadius: "50px",
                "& fieldset": { borderColor: "white" },
                "&:hover fieldset": { borderColor: "white" },
                "&.Mui-focused fieldset": { borderColor: "white" },
              },
              "& .MuiInputLabel-root": { color: "white" },
              "& .MuiInputLabel-root.Mui-focused": { color: "white" },
            }}
          />

          {/* Lunchbreak (Editable) */}
          <TextField
            label="Lunchbreak"
            value={socialMedia.lunchbreak}
            onChange={(e) => setSocialMedia({ ...socialMedia, lunchbreak: e.target.value })}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                borderRadius: "50px",
                "& fieldset": { borderColor: "white" },
                "&:hover fieldset": { borderColor: "white" },
                "&.Mui-focused fieldset": { borderColor: "white" },
              },
              "& .MuiInputLabel-root": { color: "white" },
              "& .MuiInputLabel-root.Mui-focused": { color: "white" },
            }}
          />
        </Box>
      </Box>

      {/* Save Button */}
      <Button variant="contained" className="btnpatronme" sx={{ mt: 4, width: "100%" }} onClick={saveProfile}>
        Save Changes
      </Button>

      {/* Modal for Success/Error Messages */}
<Dialog open={openModal} onClose={modalError ? handleCloseModal : undefined}>
  <DialogTitle className="basefont">{modalError ? "Error" : "Success"}</DialogTitle>
  <DialogContent>
    <Typography>{modalMessage}</Typography>
  </DialogContent>
  <DialogActions>
    {/* Only show the close button if there is an error */}
    {modalError && (
      <Button onClick={handleCloseModal} className="btnpatronme" variant="contained">
        Close
      </Button>
    )}
  </DialogActions>
</Dialog>

</AuthKitProvider>
    </Box>
  );
};

export default ProfileRight;
