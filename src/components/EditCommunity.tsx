import React, { useState, useEffect } from "react";
import { Card, Typography, Modal, Box, Grid } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useAddress } from "@thirdweb-dev/react";
import EditCommunityForm from "./editcommunity/EditCommunityForm";

// Modal styling
const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

export default function EditCommunity() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const address = useAddress();

  const [communityData, setCommunityData] = useState({
    avatar: "",
    banner: "",
    description: "",
    settings: "{}",
  });
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState("");
  const [open, setOpen] = useState(false);

  // Modal functions
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    navigate("/");
  };

  useEffect(() => {
    // Simulate API call to fetch community data
    const fetchCommunityData = async () => {
      try {
        const response = await fetch(
          `https://api.visioncommunity.xyz/v02/communities/${id}`
        );
        const data = await response.json();
        if (response.ok) {
          setCommunityData({
            avatar: data.data.avatar || "",
            banner: data.data.banner || "",
            description: data.data.description || "",
            settings: data.data.settings || "{}",
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching community data:", error);
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [id]);

  // Validate wallet address
  useEffect(() => {
    if (loading || !address) return;

    if (!address) {
      setModalMessage("Please connect your wallet.");
      handleOpen();
    } else if (address.toLowerCase() !== id?.toLowerCase()) {
      setModalMessage("You are not the owner.");
      handleOpen();
    }
  }, [address, id, loading]);

const handleSave = async () => {
  try {
    const response = await fetch(
      `https://api.visioncommunity.xyz/v02/communities/edit/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(communityData),
      }
    );

    if (response.ok) {
      // Redirect to the community's main view page after successful save
      navigate(`/communities/${id}`); 
    } else {
      console.error("Failed to save community details.");
      alert("Failed to save community details.");
    }
  } catch (error) {

  }
};


  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Card>
      <Grid container>
        <Grid item xs={12}>
          <EditCommunityForm
            avatar={communityData.avatar}           // Pass avatar
            banner={communityData.banner}           // Pass banner
            description={communityData.description} // Pass description
            setAvatar={(url: string) => setCommunityData({ ...communityData, avatar: url })} // Setter for avatar
            setBanner={(url: string) => setCommunityData({ ...communityData, banner: url })} // Setter for banner
            setDescription={(desc: string) => setCommunityData({ ...communityData, description: desc })} // Setter for description
            connectedWalletAddress={address || ""}
            handleSave={handleSave}
          />
        </Grid>
      </Grid>

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography>{modalMessage}</Typography>
        </Box>
      </Modal>
    </Card>
  );
}
