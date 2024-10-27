import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  Link,
  SelectChangeEvent,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import AvatarUpload from "./AvatarUpload";
import BannerUpload from "./BannerUpload";
import { sanitizeId } from "../../utils/sanitizeId";
import axios from "axios";
import { useActiveAccount } from "thirdweb/react";
import { signMessage } from "thirdweb/utils";
import { createThirdwebClient } from "thirdweb"; 

// Thirdweb SDK imports for Basename resolution
import { resolveL2Name, BASENAME_RESOLVER_ADDRESS } from "thirdweb/extensions/ens";
import { base } from "thirdweb/chains";

//WARPCAST INTEGRATION
import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider, SignInButton } from "@farcaster/auth-kit";
const config = {
  domain: 'visioncommunity.xyz',
  siweUri: 'https://api.visioncommunity.xyz/v02/connection/warpcast/connect',
  rpcUrl: process.env.NEXT_PUBLIC_OP,
  relay: 'https://relay.farcaster.xyz',
};

interface EditCommunityFormProps {
  connectedWalletAddress: string;
  avatar: string;
  banner: string;
  description: string;
  setAvatar: (url: string) => void;
  setBanner: (url: string) => void;
  setDescription: (desc: string) => void;
  handleSave: () => void;
  connectionType: string;
}

const EditCommunityForm: React.FC<EditCommunityFormProps> = ({
  connectedWalletAddress,
  avatar,
  banner,
  description,
  setAvatar,
  setBanner,
  setDescription,
  handleSave,
  connectionType,
}) => {
  const { id } = useParams<{ id: string }>();
  const sanitizedId = sanitizeId(id || "");
  const navigate = useNavigate();
  const client = createThirdwebClient({ clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "" });

  const [communityData, setCommunityData] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useBasename, setUseBasename] = useState(false);
  const [resolvedBasename, setResolvedBasename] = useState<string | null>(null);
  const [basenameError, setBasenameError] = useState<string | null>(null);
  
  const [twitterConnected, setTwitterConnected] = useState<boolean>(false);
  const [twitterAccount, setTwitterAccount] = useState<string>("");

  const [warpcastConnected, setWarpcastConnected] = useState<boolean>(false);
  const [warpcastAccount, setWarpcastAccount] = useState<string>("");

  const [lunchbreakConnected, setLunchbreakConnected] = useState<boolean>(false);
  const [lunchbreakAccount, setLunchbreakAccount] = useState<string>("");
  
  const [drakulaConnected, setDrakulaConnected] = useState<boolean>(false);
  const [drakulaAccount, setDrakulaAccount] = useState<string>("");

  const [siteConnected, setSiteConnected] = useState<boolean>(false);
  const [siteAccount, setSiteAccount] = useState<string>("");

  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    warpcast: "",
    lunchbreak: "",
    site: "",
  });

  const [patronSettings, setPatronSettings] = useState({
    filter: "30d",
    value: "",
  });

  // New State for category
  const [category, setCategory] = useState<string>("");

  const account = useActiveAccount();

const [warpcastConnecting, setWarpcastConnecting] = useState(false);
const [warpcastUsername, setWarpcastUsername] = useState<string | null>(null);

const [communityNameType, setCommunityNameType] = useState<string>("wallet"); // Default to wallet
const [customName, setCustomName] = useState<string>(""); // For custom name input
const [customNameError, setCustomNameError] = useState<string | null>(null); // For validation error

  // Fetch community data and populate the form
 useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const response = await fetch(`https://api.visioncommunity.xyz/v02/communities/${sanitizedId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          const communitySettings = JSON.parse(data.data.settings);
          console.log(data);

          setCommunityData({
            ...data.data,
            avatar: data.data.avatar || "",
            banner: data.data.banner || "",
            description: data.data.description || "",
            total_tips_all_time: data.data.total_tips_all_time || 0,
            total_tips_last_30_days: data.data.total_tips_last_30_days || 0,
            category: data.data.category || "others",
          });

          // Set the community name type based on the presence of customname or basename
          if (data.data.customname) {
            setCommunityNameType('custom');
            setCustomName(data.data.customname);
          } else if (data.data.basename) {
            setCommunityNameType('basename');
            setResolvedBasename(data.data.basename);
          } else {
            setCommunityNameType('wallet');
          }
          
          // Pre-fill the category
          setCategory(data.data.category || "others");

          // Set the social links for Twitter, Warpcast, Lunchbreak, and Site
          setSocialLinks({
            twitter: communitySettings.social?.twitter?.account || "",
            warpcast: communitySettings.social?.warpcast?.account || "",
            lunchbreak: communitySettings.social?.lunchbreak?.account || "",
            drakula: communitySettings.social?.drakula?.account || "",
            site: communitySettings.social?.site?.account || "",
          });

          // Set the patron settings
          setPatronSettings({
            filter: communitySettings.patron?.filter || "30d",
            value: communitySettings.patron?.value || "",
          });

          // Update the Twitter connection state
          if (communitySettings.social?.twitter?.status === "yes") {
            setTwitterConnected(true);
            setTwitterAccount(communitySettings.social.twitter.account);
          } else {
            setTwitterConnected(false);
            setTwitterAccount("");
          }

          // Update the Warpcast connection state
          if (communitySettings.social?.warpcast?.status === "yes") {
            setWarpcastConnected(true);
            setWarpcastAccount(communitySettings.social.warpcast.account);
          } else {
            setWarpcastConnected(false);
            setWarpcastAccount("");
          }

          // Update the Lunchbreak connection state
          if (communitySettings.social?.lunchbreak?.status === "yes") {
            setLunchbreakConnected(true);
            setLunchbreakAccount(communitySettings.social.lunchbreak.account);
          } else {
            setLunchbreakConnected(false);
            setLunchbreakAccount("");
          }
          
          // Update the Lunchbreak connection state
          if (communitySettings.social?.drakula?.status === "yes") {
            seDrakulaConnected(true);
            setDrakulaAccount(communitySettings.social.drakula.account);
          } else {
            setDrakulaConnected(false);
            setDrakulaAccount("");
          }

          // Update the Site connection state
          if (communitySettings.social?.site?.status === "yes") {
            setSiteConnected(true);
            setSiteAccount(communitySettings.social.site.account);
          } else {
            setSiteConnected(false);
            setSiteAccount("");
          }

          // If the API returns a basename, set the basename
          if (data.data.basename) {
            setResolvedBasename(data.data.basename);
            setUseBasename(true);
          } else {
            setResolvedBasename(null);
            setUseBasename(false);
          }

          // Set ownership based on connected wallet
          setIsOwner(account?.address === data.data.owner);
        } else {
          setError("The owner of this wallet has not yet claimed their onchain community");
        }
      } catch (err) {
        setError("Failed to fetch community data");
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [sanitizedId, account]);


const validateCustomName = (name: string) => {
  const regex = /^[a-zA-Z0-9.-]{1,30}$/; // Letters, numbers, dots, hyphens, max 30 characters
  if (!regex.test(name)) {
    return "Invalid custom name. Only letters, numbers, periods, and hyphens are allowed, max 30 characters.";
  }
  return null;
};

  const handleSocialChange = (platform: keyof typeof socialLinks, value: string) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  const handlePatronChange = (field: keyof typeof patronSettings, value: string) => {
    setPatronSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategory(event.target.value); // Update the selected category
  };

  // Function to handle Twitter connection
const handleTwitterConnect = async () => {
  try {
    // Redirect to your backend Twitter OAuth endpoint
    window.location.href = `https://api.visioncommunity.xyz/v02/connection/twitter/connect?type=community&wallet=${sanitizedId}`;
  } catch (error) {
    console.error("Error connecting Twitter:", error);
  }
};

  // Function to handle Warpcast connection
  const handleWarpcastConnect = async () => {
    try {
      // Redirect to your backend Warpcast OAuth endpoint
      window.location.href = "https://your-backend.com/auth/warpcast";
    } catch (error) {
      console.error("Error connecting Warpcast:", error);
    }
  };

  // When the user toggles to check for a Basename
  const handleToggleChange = async () => {
    if (!useBasename) {
      // User wants to switch to Basename, attempt to resolve it
      try {
        const name = await resolveL2Name({
          client, // Use the thirdweb client
          address: communityData.owner, // The wallet address we want to resolve
          resolverAddress: BASENAME_RESOLVER_ADDRESS,
          resolverChain: base,
        });

        if (name) {
          setResolvedBasename(name);
          setUseBasename(true); // Set to use Basename if resolved
          setBasenameError(null); // Clear any error
        } else {
          // No Basename found, show error and revert back to wallet
          setBasenameError("Looks like you don't have a basename yet.");
          setUseBasename(false); // Revert to wallet address
        }
      } catch (error) {
        setBasenameError("Failed to resolve Basename. Please try again.");
        setUseBasename(false); // Revert to wallet address on error
      }
    } else {
      // User wants to revert back to wallet address
      setUseBasename(false);
      setBasenameError(null); // Clear any error
    }
  };

const saveCommunitySettings = async () => {
  try {
    // Sanitize input data
    const sanitizedDescription = description.trim();
    const sanitizedCategory = category.trim();
    const sanitizedAvatar = avatar;
    const sanitizedBanner = banner;

    // Generate current timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // Prepare message for signature
    const message = `Updating community settings for ${connectedWalletAddress} at ${timestamp}`;
    const signature = await signMessage({ account, message }); // SDK5: Use signMessage

    // Handle community name based on the selected type
    let finalBasename = null;
    if (communityNameType === "basename") {
      finalBasename = resolvedBasename; // Ensure this is already resolved
    } else if (communityNameType === "custom") {
      if (!customName || customNameError) {
        alert("Please provide a valid custom community name.");
        return;
      }
      finalBasename = ""; // Send empty if custom name is used
    }

    // Filter only the lunchbreak and site fields from socialLinks
    const filteredSocialLinks = {
		drakula: socialLinks.drakula,
      lunchbreak: socialLinks.lunchbreak,
      site: socialLinks.site,
    };

    // Prepare the payload with only the fields that need to be updated
const communityPayload = {
  avatar: sanitizedAvatar,
  banner: sanitizedBanner,
  description: sanitizedDescription,
  category: sanitizedCategory,
  socialLinks: filteredSocialLinks,  // Only lunchbreak and site
  patronSettings,
  basename: finalBasename,  // Use basename or empty if custom name is used
  customname: communityNameType === 'custom' ? customName : null,  // Only send custom name if type is 'custom'
  signature, // Include the signed message to verify wallet ownership
  walletAddress: connectedWalletAddress,
  timestamp, // Include the timestamp
};

    // Send the request to the API
    const response = await axios.put(
      `https://api.visioncommunity.xyz/v02/communities/editv2/${sanitizedId}`,
      communityPayload
    );

    if (response.data.success) {
      // Navigate to the community view page instead of going back
      navigate(`/communities/${sanitizedId}`); // Go to the community view page
    } else {
      // Check if custom name is already taken
      if (response.data.error && response.data.error.includes("Custom name already taken")) {
        setCustomNameError("This custom name is already in use. Please choose another.");
      } else {
        alert("Failed to update community. Please try again.");
      }
    }
  } catch (error) {
    if (error.response?.data?.error?.includes("Custom name already taken")) {
      setCustomNameError("This custom name is already in use. Please choose another.");
    } else {
      alert("An error occurred while updating the community.");
    }
  }
};



const handleCommunityNameTypeChange = async (e: SelectChangeEvent<string>) => {
  const selectedType = e.target.value;
  setCommunityNameType(selectedType);

  // Trigger Basename resolution when "Basename" is selected
  if (selectedType === "basename") {
    try {
      const name = await resolveL2Name({
        client, // Use the thirdweb client
        address: communityData?.owner, // The wallet address to resolve
        resolverAddress: BASENAME_RESOLVER_ADDRESS,
        resolverChain: base,
      });

      if (name) {
        setResolvedBasename(name);
        setUseBasename(true);
        setBasenameError(null); // Clear error if resolved successfully
      } else {
        setResolvedBasename(null);
        setUseBasename(false);
        setBasenameError("No basename found for this wallet. Please get a Basename."); // Error if not found
      }
    } catch (error) {
      setBasenameError("Failed to resolve Basename. Please try again.");
      setResolvedBasename(null);
      setUseBasename(false);
    }
  }
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

        // Set both warpcastConnected and warpcastAccount immediately
        setWarpcastConnected(true);
        setWarpcastAccount(username);  // Store the connected username immediately

        // Also update socialLinks with the new Warpcast account
        setSocialLinks((prev) => ({
          ...prev,
          warpcast: username,
        }));
      } else {
        console.error("Failed to connect Warpcast account");
      }
    })
    .catch((error) => {
      console.error("Error connecting Warpcast account", error);
    });
};



  // Community Name (Wallet or Basename)
const communityName = useBasename && resolvedBasename 
  ? resolvedBasename 
  : communityData?.owner || "";  // Ensure communityData is not null
  
if (loading || !communityData) {
  return <Typography>Loading community data...</Typography>;
}




  return (
	  <AuthKitProvider config={config}>
    <Grid container spacing={4} className="containeredit">
      {/* Left Section - Avatar Upload */}
      <Grid item xs={12} md={4}>
        <AvatarUpload avatar={avatar} setAvatar={setAvatar} />
      </Grid>

      {/* Right Section */}
      <Grid item xs={12} md={8}>
        {/* Banner Upload */}
        <BannerUpload banner={banner} setBanner={setBanner} />

        {/* Community Info */}
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Community Information
          </Typography>

          {/* Community Name */}
<FormControl fullWidth margin="normal">
  <InputLabel>Community Name Type</InputLabel>
  <Select
    value={communityNameType}
    onChange={handleCommunityNameTypeChange}  // Trigger the handler
    label="Community Name Type"
  >
    <MenuItem value="wallet">Wallet Address</MenuItem>
    <MenuItem value="basename">Basename</MenuItem>
    <MenuItem value="custom">Custom Name</MenuItem>
  </Select>
</FormControl>

<FormControl fullWidth margin="normal">
  {communityNameType === "wallet" && (
    <TextField label="Community Name (Wallet Address)" value={connectedWalletAddress} disabled />
  )}
  
  {communityNameType === "basename" && (
    <>
      <TextField 
        label="Community Name (Basename)" 
        value={resolvedBasename || ""} 
        disabled 
      />
      {basenameError && (
        <Alert severity="error">
          {basenameError}{" "}
          <Link href="https://www.base.org/names" target="_blank" rel="noopener">
            Get a Basename here.
          </Link>
        </Alert>
      )}
    </>
  )}
  
{communityNameType === "custom" && (
  <>
    <TextField
      label="Custom Community Name"
      value={customName}
      onChange={(e) => {
        const newName = e.target.value;
        setCustomName(newName);
        setCustomNameError(validateCustomName(newName)); // Validate input
      }}
      error={Boolean(customNameError)} // Show error state if customNameError is not null
      helperText={customNameError} // Display the error message below the input
    />
  </>
)}
</FormControl>


          {/* Description */}
          <FormControl fullWidth margin="normal">
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
            />
          </FormControl>

          {/* Category Selector */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select value={category} onChange={handleCategoryChange} label="Category">
              <MenuItem value="artists">Artists</MenuItem>
              <MenuItem value="builders">Builders</MenuItem>
              <MenuItem value="tokens">Tokens</MenuItem>
              <MenuItem value="content-creator">Content Creator</MenuItem>
              <MenuItem value="kol">KOL</MenuItem>
              <MenuItem value="personal">Personal</MenuItem>
              <MenuItem value="others">Others</MenuItem>
            </Select>
          </FormControl>

          {/* Social Media Links */}
          <Typography variant="h6" mt={3} mb={2}>
            Social Media Links
          </Typography>
          <Grid container spacing={2}>
            {/* Twitter Connection Button */}
            <Grid item xs={12} md={6}>
              {twitterConnected ? (
                <Button variant="outlined" className="btnpatronme" fullWidth sx={{ mb: 2 }} disabled>
                  Twitter Connected [{twitterAccount}]
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  className="btnpatronme"
                  onClick={handleTwitterConnect}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Connect Twitter
                </Button>
              )}
            </Grid>

{/* Warpcast Section */}
<Grid item xs={12} md={6}>
  {warpcastConnected ? (
    <Button
      variant="outlined"
      fullWidth
      disabled
      className="btnpatronme"
      sx={{ mb: 2 }}
    >
      Connected Warpcast [{warpcastAccount}]
    </Button>
  ) : (
    <Box position="relative" sx={{ mb: 4 }}>
      {/* Connect Warpcast Button */}
      <Button
        variant="outlined"
        className="btnpatronme"
        fullWidth
        sx={{ mb: 2 }}
        onClick={() => setWarpcastConnecting(true)} // Show the SignInButton when clicked
      >
        Connect Warpcast
      </Button>

      {/* Show the SignInButton right below the Connect Warpcast button */}
      {warpcastConnecting && (
        <Box 
          display="flex" 
          justifyContent="center" 
          position="absolute" 
          top="60%"
          left="30%" 
          transform="translateX(-50%)" 
          sx={{ mt: 1 }}  // Add margin to create spacing
        >
          <SignInButton
            onSuccess={({ fid, username }) => handleWarpcastLoginSuccess(fid, username)}
            onError={(error) => console.error("Login error", error)}
          />
        </Box>
      )}
    </Box>
  )}
</Grid>




            {/* Drakula (Editable) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Drakula"
                value={socialLinks.drakula}
                onChange={(e) => handleSocialChange("drakula", e.target.value)}
              />
            </Grid>
            
            {/* Lunchbreak (Editable) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lunchbreak"
                value={socialLinks.lunchbreak}
                onChange={(e) => handleSocialChange("lunchbreak", e.target.value)}
              />
            </Grid>
            
            {/* Site (Editable) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site"
                value={socialLinks.site}
                onChange={(e) => handleSocialChange("site", e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Patron Settings */}
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Patron Settings
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Minimum Patron to Unlock Community"
                  value={patronSettings.value}
                  onChange={(e) => handlePatronChange("value", e.target.value)}
                  type="number"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Filter</InputLabel>
                <Select
                  value={patronSettings.filter}
                  onChange={(e) => handlePatronChange("filter", e.target.value)}
                  label="Filter"
                >
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="all_time">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Save Button */}
        <Box mt={4} display="flex" justifyContent="space-between">
          <Button className="btnpatronme" fullWidth onClick={saveCommunitySettings}>
            Save Changes
          </Button>
          <Button className="btnpatronmecancel" fullWidth onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Box>
      </Grid>
    </Grid>
    </AuthKitProvider>
  );
};

export default EditCommunityForm;
