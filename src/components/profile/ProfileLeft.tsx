import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { format } from "date-fns"; // Importing date-fns for date formatting

// Set initial number of communities/notifications to show per load
const PAGE_SIZE = 10;

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

interface ProfileData {
  patronCommunities: Community[];
  notifications: Notification[];
}

interface ProfileLeftProps {
  profileData: ProfileData;
}

const ProfileLeft: React.FC<ProfileLeftProps> = ({ profileData }) => {
  const navigate = useNavigate();
  const [communitiesPage, setCommunitiesPage] = useState(1);
  const [visibleNotifications, setVisibleNotifications] = useState(PAGE_SIZE);

  // Helper function to format the wallet address
  const formatWalletAddress = (wallet: string): string => {
    return wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "";
  };

  // Helper function to format the VISION amount with 2 decimal places
  const formatVisionAmount = (amount: string): string => {
    return parseFloat(amount).toFixed(2);
  };

  // Helper function to format the date
  const formatToLocalDate = (utcDateString: string): string => {
    const parsedDate = new Date(utcDateString);
    return format(parsedDate, "PPpp"); // Format: e.g., Sep 30, 2024, 5:00 PM
  };

  // Get total number of pages for the communities
  const totalCommunityPages = Math.ceil(
    profileData.patronCommunities.length / PAGE_SIZE
  );

  // Paginate communities (10 per page)
  const paginatedCommunities = profileData.patronCommunities.slice(
    (communitiesPage - 1) * PAGE_SIZE,
    communitiesPage * PAGE_SIZE
  );

  // Handle Load More for Notifications
  const handleLoadMoreNotifications = () => {
    setVisibleNotifications((prev) => prev + PAGE_SIZE);
  };

  return (
    <Box>
      {/* Patroned Communities */}
      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Typography className="profiletitlebox" gutterBottom>
            Patroned Communities
          </Typography>
          {paginatedCommunities.length ? (
            paginatedCommunities.map((community: Community, index: number) => {
              const communityDetails = community.details || {};
              const avatarUrl =
                communityDetails.avatar || "/default-community-avatar.png";
              const communityName = communityDetails.basename
                ? communityDetails.basename
                : formatWalletAddress(community.receiver_wallet);

              return (
                <Box
                  key={community.receiver_wallet + index}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  my={1}
                >
                  <Avatar src={avatarUrl} alt={communityName} />

                  {/* Community name or Basename */}
                  <Box ml={2}>
                    <Typography variant="body1">{communityName}</Typography>
                    <Typography
                      className="basefont smalltext"
                      color="textSecondary"
                    >
                      {formatVisionAmount(community.amount)} $VISION
                    </Typography>
                  </Box>

                  {/* Navigation Arrow to Community */}
                  <IconButton
                    onClick={() =>
                      navigate(`/community/${community.receiver_wallet}`)
                    }
                    color="primary"
                    sx={{ marginLeft: "auto" }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
              );
            })
          ) : (
            <Typography>No patroned communities found.</Typography>
          )}

          {/* Pagination Controls */}
          {profileData.patronCommunities.length > PAGE_SIZE && (
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button
                disabled={communitiesPage === 1}
                onClick={() => setCommunitiesPage((prev) => prev - 1)}
                className="btnpatronme"
              >
                Previous
              </Button>
              <Typography>
                Page {communitiesPage} of {totalCommunityPages}
              </Typography>
              <Button
                disabled={communitiesPage >= totalCommunityPages}
                onClick={() => setCommunitiesPage((prev) => prev + 1)}
                className="btnpatronme"
              >
                Next
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Badges */}
      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Typography className="profiletitlebox" gutterBottom>
            Badges
          </Typography>
          <Typography>Coming Soon</Typography>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardContent>
          <Typography className="profiletitlebox" gutterBottom>
            My Community
          </Typography>
          {profileData.notifications.length ? (
            profileData.notifications
              .slice(0, visibleNotifications)
              .map((notification: Notification, index: number) => {
                const communityDetails = profileData.patronCommunities.find(
                  (community) =>
                    community.receiver_wallet === notification.sender
                );
                const senderName = communityDetails?.details?.basename
                  ? communityDetails.details.basename
                  : formatWalletAddress(notification.sender);

                return (
                  <Box key={notification.announcement_id} my={1}>
                    <Typography className="basefont smalltext">
                      {senderName} published an announcement on{" "}
                      {formatToLocalDate(notification.date)}
                    </Typography>
                    {/* Link to the related community */}
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() =>
                        navigate(`/community/${notification.sender}`)
                      }
                    >
                      View Community
                    </Button>
                  </Box>
                );
              })
          ) : (
            <Typography>No notifications yet.</Typography>
          )}

          {/* Load More Notifications Button */}
          {visibleNotifications < profileData.notifications.length && (
            <Button
              onClick={handleLoadMoreNotifications}
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
            >
              Load More
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfileLeft;
