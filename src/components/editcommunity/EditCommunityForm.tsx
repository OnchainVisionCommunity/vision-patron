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
import { useSigner } from "@thirdweb-dev/react"; // Thirdweb SDK for signature handling

// Import the client you created in client.ts
import { client } from "../../client";

// Thirdweb SDK imports for Basename resolution
import { resolveL2Name, BASENAME_RESOLVER_ADDRESS } from "thirdweb/extensions/ens";
import { base } from "thirdweb/chains";

interface EditCommunityFormProps {
  connectedWalletAddress: string;
  avatar: string;
  banner: string;
  description: string;
  setAvatar: (url: string) => void;
  setBanner: (url: string) => void;
  setDescription: (desc: string) => void;
  handleSave: () => void;
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
}) => {
  const { id } = useParams<{ id: string }>();
  const sanitizedId = sanitizeId(id || ""); // Provide fallback to an empty string or handle undefined
  const signer = useSigner(); // For signing the message to verify wallet ownership
  const navigate = useNavigate(); // For navigating back on success

  const [communityData, setCommunityData] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useBasename, setUseBasename] = useState(false); // Toggle between Basename and Wallet Address
  const [resolvedBasename, setResolvedBasename] = useState<string | null>(null); // For resolved basename
  const [basenameError, setBasenameError] = useState<string | null>(null); // Error for missing Basename

  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    warpcast: "",
    instagram: "",
    lunchbreak: "",
  });

  const [patronSettings, setPatronSettings] = useState({
    filter: "30d", // Default to 'Last 30 Days'
    value: "",
  });

  // New State for category
  const [category, setCategory] = useState<string>("");

  // Fetch community data and populate the form
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const response = await fetch(`https://api.visioncommunity.xyz/v02/communities/${sanitizedId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          const communitySettings = JSON.parse(data.data.settings);

          setCommunityData({
            ...data.data,
            avatar: data.data.avatar || "",
            banner: data.data.banner || "",
            description: data.data.description || "",
            total_tips_all_time: data.data.total_tips_all_time || 0,
            total_tips_last_30_days: data.data.total_tips_last_30_days || 0,
            category: data.data.category || "others", // Set the category or default to "others"
          });

          // Pre-fill the category
          setCategory(data.data.category || "others");

          setSocialLinks({
            twitter: communitySettings.social?.twitter?.account || "",
            warpcast: communitySettings.social?.warpcast?.account || "",
            instagram: communitySettings.social?.instagram?.account || "",
            lunchbreak: communitySettings.social?.lunchbreak?.account || "",
          });

          setPatronSettings({
            filter: communitySettings.patron?.filter || "30d",
            value: communitySettings.patron?.value || "",
          });

          // If the API returns a basename, we set the resolved basename and let users toggle it
          if (data.data.basename) {
            setResolvedBasename(data.data.basename);
            setUseBasename(true); // By default, use the Basename if it exists
          } else {
            setResolvedBasename(null);
            setUseBasename(false); // Use wallet address if no Basename in API
          }

          setIsOwner(connectedWalletAddress === data.data.owner);
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
  }, [sanitizedId, connectedWalletAddress]);

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
    window.location.href = `https://api.visioncommunity.xyz/v02/connection/twitter/connect?community_id=${sanitizedId}`;
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
          client, // Use the thirdweb client from client.ts
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

    // Sign the message to confirm wallet ownership, including the timestamp
    const message = `Updating community settings for ${connectedWalletAddress} at ${timestamp}`;
    const signature = await signer?.signMessage(message);

    // Include basename in the payload
    const communityPayload = {
      avatar: sanitizedAvatar,
      banner: sanitizedBanner,
      description: sanitizedDescription,
      category: sanitizedCategory,
      socialLinks,
      patronSettings,
      basename: useBasename ? resolvedBasename : null,  // Add basename here
      signature, // Include the signed message to verify wallet ownership
      walletAddress: connectedWalletAddress,
      timestamp, // Include the timestamp
    };

    // Send the request to the API
    const response = await axios.put(
      `https://api.visioncommunity.xyz/v02/communities/edit/${sanitizedId}`,
      communityPayload
    );

    if (response.data.success) {
      // Navigate to the community view page instead of going back
      navigate(`/communities/${sanitizedId}`); // Go to the community view page
    } else {
      alert("Failed to update community. Please try again.");
    }
  } catch (error) {
    alert("An error occurred while updating the community.");
  }
};


  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  // Community Name (Wallet or Basename)
  const communityName = useBasename && resolvedBasename ? resolvedBasename : communityData.owner;

  return (
    <Box p={3} sx={{ maxWidth: 1200, margin: "0 auto" }}>
      <Grid container spacing={4}>
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
              <TextField label="Community Name" value={communityName} disabled />
              <FormControlLabel
                control={<Switch checked={useBasename} onChange={handleToggleChange} />}
                label={useBasename ? "Revert to Wallet Address" : "Use Basename"}
              />
            </FormControl>

            {/* Error message for Basename */}
            {basenameError && (
              <Alert severity="error">
                {basenameError}{" "}
                <Link href="https://www.base.org/names" target="_blank" rel="noopener">
                  Get a Basename here.
                </Link>
              </Alert>
            )}

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
              {/* Twitter (Connect only) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Twitter"
                  value={socialLinks.twitter}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleTwitterConnect}
                        disabled={socialLinks.twitter !== ""}
                      >
                        {socialLinks.twitter ? "Connected" : "Connect Twitter"}
                      </Button>
                    ),
                  }}
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
            <Button variant="contained" color="primary" fullWidth onClick={saveCommunitySettings}>
              Save Changes
            </Button>
            <Button variant="outlined" color="secondary" fullWidth onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditCommunityForm;
