import { useState } from "react";
import { Box, Typography, Button, Modal } from "@mui/material";
import { useAddress, useSigner } from "@thirdweb-dev/react";
import axios from "axios";
import community from '../assets/images/community.png';

// Styling for the modal box
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

const ClaimCommunity = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); // To store message for modal
  const [communityLink, setCommunityLink] = useState(""); // To store community link
  const [showSuccess, setShowSuccess] = useState(false); // To show success modal
  const address = useAddress(); // Get the connected wallet address
  const signer = useSigner(); // Get the signer to sign messages

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleClaimCommunity = async () => {
    if (!address || !signer) {
      alert("Wallet is not connected");
      return;
    }

    try {
      setLoading(true);

      // Include the timestamp in the message
      const timestamp = Math.floor(Date.now() / 1000); // Current Unix timestamp (seconds)
      const message = `I want to claim my community onchain: ${address} at ${timestamp}`;
      const signature = await signer.signMessage(message);

      const response = await axios.post("https://api.visioncommunity.xyz/v02/user/signmessage", {
        walletAddress: address,
        signature,
        message,
        timestamp, // Send the timestamp along with the request
      });

      // Handle the different responses from the backend
      if (response.data.success) {
        setModalMessage(response.data.message);
        setCommunityLink(response.data.link); // Store the community link
        setShowSuccess(true);
      } else {
        setModalMessage(response.data.message || "Failed to claim community");
        if (response.data.link) {
          setCommunityLink(response.data.link); // Store the community link if already claimed
        }
        setShowSuccess(false);
      }
    } catch (error) {
      console.error("Error claiming community:", error);

      if (error instanceof Error) {
        // If error is of type Error, safely access message
        setModalMessage("An error occurred: " + error.message);
      } else {
        // Handle the case where error is not an instance of Error
        setModalMessage("An unknown error occurred");
      }

      setShowSuccess(false);
    } finally {
      setLoading(false);
      setOpen(false); // Close initial modal
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        mt: 8,
        mb: 8,
        padding: 2,
      }}
    >
      <hr className="sep2" />
      <h2 className="text-3xl font-bold text-center mb-8">
        {/* Title */}
        <Typography variant="h5" gutterBottom className="communityanounce">
          Claim Your Community!
        </Typography>
      </h2>

      {/* Subtitle */}
      <Typography variant="body1" className="claimpara">
        Claim your community for free and let your audience become your patrons!<br/>
        Send announcements and exclusives to patrons and curate your onchain community
      </Typography>
      <Button variant="contained" color="primary" className="btnpatronme extraclass" sx={{ mt: 2 }} onClick={handleOpen} >
        Claim Your Community
      </Button>

      {/* Claim Button */}

      {/* Modal for Claiming Community */}
      <Modal open={open} onClose={handleClose} aria-labelledby="claim-community-modal" aria-describedby="claim-community-description">
        <Box sx={modalStyle}>
          <Typography id="claim-community-modal" className="modaltitle" gutterBottom >
            Claim Community
          </Typography>
          <Typography id="claim-community-description" sx={{ mb: 2 }} className="modaltext">
            You are about to claim your onchain community. Please sign with your wallet to continue.
          </Typography>
          <Button
            variant="contained"
            className="btnpatronme"
            fullWidth
            sx={{ mb: 2 }}
            onClick={handleClaimCommunity}
            disabled={loading}
          >
            {loading ? "Processing..." : "Sign and Claim"}
          </Button>
          <Button variant="outlined" color="secondary" fullWidth onClick={handleClose} className="btnpatronmecancel">
            Cancel
          </Button>
        </Box>
      </Modal>

      {/* Success/Error Modal */}
      <Modal open={showSuccess || modalMessage.length > 0} onClose={() => setShowSuccess(false)}>
        <Box sx={modalStyle}>
          <Typography className="modaltitle" gutterBottom>
            {showSuccess ? "Success" : "Info"}
          </Typography>
          <Typography  className="modaltext">{modalMessage}</Typography>
          {communityLink && (
            <Button
              variant="contained"
              className="btnpatronme"
              fullWidth
              onClick={() => {
                window.location.href = communityLink;
              }}
            >
              See Community
            </Button>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ClaimCommunity;
