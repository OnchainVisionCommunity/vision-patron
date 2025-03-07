// src/components/communitypage/CommunitySidebar.tsx

import { useState, useEffect } from "react";
import { Box, Typography, Avatar, CircularProgress } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import axios from "axios";

interface Patron {
  wallet: string;
  basename?: string;
  avatar: string;
  amount: string;
}

interface CommunitySidebarProps {
  communityId: string; // Accept the communityId as a prop
}

export default function CommunitySidebar({ communityId }: CommunitySidebarProps) {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatrons = async () => {
      try {
        // Fetch patrons for the specific community using the communityId
        const response = await axios.get(`https://api.visioncommunity.xyz/v02/community/patrons`, {
          params: { community: communityId },
        });

        if (response.data.success) {
          setPatrons(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching patrons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatrons();
  }, [communityId]); // Fetch patrons when the communityId changes

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <Box sx={{ border: "1px solid #333", padding: 2, borderRadius: "5px" }}>
    <div className="containertitle">
      <Typography variant="h6" gutterBottom className="communityanounce">
        Latest Patrons
      </Typography>
    </div>
      <hr className="sep topbottom10pxmargin" />

      {loading ? (
        <CircularProgress />
      ) : patrons.length === 0 ? (
        <Typography variant="body2">No patrons yet, be the first one!</Typography>
      ) : (
        patrons.map((patron) => (
          <Box
            key={patron.wallet}
            sx={{
              display: "flex",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <Avatar
              alt={patron.basename || patron.wallet}
              src={patron.avatar || "https://api.visioncommunity.xyz/img/placeholder/avatar.jpg"}
              sx={{ width: 30, height: 30, marginRight: 2 }}
            />
            <Box>
              <Typography
                component="a"
                className="patronnameside"
                href={`/profile/${patron.wallet}`}
                sx={{
                  fontWeight: "bold",
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {patron.basename ? patron.basename : formatAddress(patron.wallet)}
                <OpenInNewIcon fontSize="verysmall" sx={{ marginLeft: 1 }} />
              </Typography>
              <Typography variant="body3" className="patronamt patronnamesideamount" >
                {parseFloat(patron.amount).toFixed(2)} $VISION
              </Typography>
            </Box>
          </Box>
        ))
      )}


    </Box>
  );
}
