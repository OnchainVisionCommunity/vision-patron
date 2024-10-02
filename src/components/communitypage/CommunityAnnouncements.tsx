import { Grid, Box, Typography, Button, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useSigner } from "@thirdweb-dev/react"; // For wallet interaction
import { ethers } from "ethers"; // For signing messages

interface Announcement {
  id: number;
  text: string;
  banner: string;
  cta: string;
  cta_link: string;
  date: string;
}

interface CommunityAnnouncementsProps {
  communityId: string;
  isOwner: boolean; // Pass this prop to know if the user is the owner
}

export default function CommunityAnnouncements({ communityId, isOwner }: CommunityAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const signer = useSigner(); // Thirdweb signer for signing messages

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`https://api.visioncommunity.xyz/v02/announcement/get/announcement?community=${communityId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setAnnouncements(data.data);
        } else {
          setError("Failed to fetch announcements.");
        }
      } catch (err) {
        setError("An error occurred while fetching announcements.");
      } finally {
        setLoading(false);
      }
    };

    if (communityId) {
      fetchAnnouncements();
    }
  }, [communityId]);

  const deleteAnnouncement = async (announcementId: number) => {
    try {
      if (!signer) {
        throw new Error("Wallet not connected.");
      }

      const walletAddress = await signer.getAddress(); // Get the wallet address from signer
      const timestamp = Math.floor(Date.now() / 1000); // Get current timestamp in seconds

      // Format the message exactly as it is expected on the backend
      const message = `Delete announcement with ID: ${announcementId} at timestamp: ${timestamp}`;

      // Sign the message with the announcement ID and timestamp
      const signature = await signer.signMessage(message);

      const response = await fetch(`https://api.visioncommunity.xyz/v02/announcement/delete/${announcementId}`, {
        method: "POST", // Use POST for sending the delete request
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,   // Send the wallet address
          signature,       // Include the signature
          announcementId,  // Send the announcement ID
          timestamp        // Send the timestamp
        }),
      });

      if (response.ok) {
        setAnnouncements(announcements.filter((announcement) => announcement.id !== announcementId));
        window.location.reload(); // Reload the page after successful deletion
      } else {
        setError("Failed to delete the announcement.");
      }
    } catch (err) {
      setError("An error occurred while deleting the announcement.");
    }
  };

  const signDeletion = async (announcementId: number) => {
    if (!signer) {
      throw new Error("Wallet not connected.");
    }

    const message = `Delete announcement with ID: ${announcementId}`;
    const signature = await signer.signMessage(message);
    return signature;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h6" gutterBottom className="communityanounce">
        Latest Announcements
      </Typography>
      <Grid container spacing={2}>
        {announcements.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Box sx={{ border: "1px solid #ddd", borderRadius: 2, overflow: "hidden" }}>
              
              {/* Conditionally render the image only if the `banner` exists */}
              {post.banner && (
                <img
                  src={post.banner}
                  alt={post.text}
                  style={{ width: "100%", height: "150px", objectFit: "cover", display: "block" }}
                />
              )}
              
              <Box sx={{ padding: 2 }}>
                <Typography sx={{ mt: 2 }} className="annoutitle" textAlign="center">
                  {post.text}
                </Typography>

                {/* Conditionally render the CTA button only if the `cta` text and link exist */}
                {post.cta && post.cta_link && (
                  <Button
                    variant="contained"
                    sx={{ mt: 2, width: "100%" }}
                    className="btnpatronme"
                    href={post.cta_link}
                    target="_blank"
                  >
                    {post.cta}
                  </Button>
                )}

                {/* Conditionally render the delete button if the user is the owner */}
                {isOwner && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => deleteAnnouncement(post.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
