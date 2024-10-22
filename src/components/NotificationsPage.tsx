import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axios from "axios";

// Helper to format wallet address as 0x1234...5678
const formatWalletAddress = (wallet: string): string => {
  return wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "";
};

// Helper function to format the date
const formatToLocalDate = (utcDateString: string): string => {
  const parsedDate = new Date(utcDateString);
  return format(parsedDate, "PPpp"); // e.g., Sep 30, 2024, 5:00 PM
};

// Set initial number of notifications to show per load
const PAGE_SIZE = 10;

interface Notification {
  id: number;
  kind: string;
  sender: string;
  date: string;
  community_info?: {
    owner: string;
    basename?: string;
    customname?: string;
    avatar?: string;
  };
  sender_info?: {
    wallet: string;
    basename?: string;
    avatar?: string;
  };
  text?: string;
  reputation?: number;
  energy?: number;
  stream_id?: string;
  status: number; // 1: unread, 0: read
}

interface NotificationsPageProps {
  walletAddress: string;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ walletAddress }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `https://api.visioncommunity.xyz/v02/user/get/notifications?wallet=${walletAddress}&page=1&pageSize=100`
        );
        if (response.data.success) {
          setNotifications(response.data.notifications || []);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Unable to fetch notifications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [walletAddress]);

  // Handle loading more notifications
  const handleLoadMoreNotifications = () => {
    setVisibleNotifications((prev) => prev + PAGE_SIZE);
  };

useEffect(() => {
  // Function to mark all notifications as read
  const markNotificationsAsRead = async () => {
    try {
      await axios.post("https://api.visioncommunity.xyz/v02/user/post/readnotifications", {
        wallet: walletAddress,
      });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Call the function to mark notifications as read
  markNotificationsAsRead();
}, [walletAddress]);

  // Helper to get sender's display name
  const getDisplayName = (notification: Notification) => {
    const displayName =
      notification.sender_info?.basename || formatWalletAddress(notification.sender);
    return displayName;
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
        <Typography variant="h5">{error}</Typography>
      </Box>
    );
  }

  return (
    <div className="containernotification">
      {/* Notifications Section */}
      <Card sx={{ marginBottom: 0, padding: '0px' }} className="notcard">
        <CardContent>
          {notifications.length ? (
            notifications.slice(0, visibleNotifications).map((notification: Notification, index: number) => {
              const senderName = getDisplayName(notification);
              const avatarUrl = notification.sender_info?.avatar || "/default-community-avatar.png";

              // Determine background color based on notification status (unread = status 1)
              const backgroundColor = notification.status === 1 ? "#333" : "transparent";

              let title = "";
              let subtitle = "";
              let linkTo = "#";

              // Handle different notification kinds
              switch (notification.kind) {
                case "like":
                  title = `${senderName} liked your post in ${notification.community_info?.customname || notification.community_info?.basename || formatWalletAddress(notification.community_info?.owner || "")}`;
                  linkTo = `/communities/${notification.community_info?.owner}/stream/${notification.stream_id}`;
                  break;
                case "stream":
                  title = `${senderName} posted in your community ${notification.community_info?.customname || notification.community_info?.basename || formatWalletAddress(notification.community_info?.owner || "")}`;
                  subtitle = notification.text || "";
                  linkTo = `/communities/${notification.community_info?.owner}/stream/${notification.stream_id}`;
                  break;
                case "reply":
                  title = `${senderName} replied to your post in ${notification.community_info?.customname || notification.community_info?.basename || formatWalletAddress(notification.community_info?.owner || "")}`;
                  subtitle = notification.text || "";
                  linkTo = `/communities/${notification.community_info?.owner}/stream/${notification.stream_id}`;
                  break;
                case "patronised":
                  title = `${senderName} patronised your community ${notification.community_info?.customname || notification.community_info?.basename || formatWalletAddress(notification.community_info?.owner || "")}`;
                  subtitle = `Congratulations! Your community earned ${notification.reputation}`;
                  linkTo = `/communities/${notification.community_info?.owner}`;
                  break;
                case "patron":
                  title = `You patronised the community ${notification.community_info?.customname || notification.community_info?.basename || formatWalletAddress(notification.community_info?.owner || "")}`;
                  subtitle = `Congratulations! Your community earned ${notification.energy} and an NFT Shard`;
                  linkTo = `/communities/${notification.community_info?.owner}`;
                  break;
                case "patroned":
                  title = `${senderName} patronised your community ${notification.community_info?.customname || notification.community_info?.basename || formatWalletAddress(notification.community_info?.owner || "")}`;
                  subtitle = `Congratulations! Your community earned ${notification.reputation} reputation`;
                  linkTo = `/communities/${notification.community_info?.owner}`;
                  break;
                case "minter":
                  title = `You patronised the community ${notification.community_info?.customname || notification.community_info?.basename || formatWalletAddress(notification.community_info?.owner || "")}`;
                  subtitle = `Congratulations, patron! Your earned ${notification.energy} energy and an NFT Shard`;
                  linkTo = `/communities/${notification.community_info?.owner}`;
                  break;
                default:
                  title = "Unknown notification type";
              }

              return (
                <Box
                  key={notification.id}
                  display="flex"
                  alignItems="center"
                  my={1}
                  p={2}
                  sx={{
                    cursor: "pointer",
                    backgroundColor,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: "#333",
                    },
                  }}
                  onClick={() => navigate(linkTo)} // Navigate to the link when the box is clicked
                >
                  <Avatar src={avatarUrl} alt={senderName} sx={{ width: 30, height: 30 }} />

                  <Box ml={2}>
                    <div className="notitle">{title}</div>
                    {subtitle && (
                      <div className="nosubtitle">
                        {subtitle}
                      </div>
                    )}
                    <div className="nodate">
                      {formatToLocalDate(notification.date)}
                    </div>
                  </Box>

                </Box>
              );
            })
          ) : (
            <div className="notitle">No notifications yet.</div>
          )}

          {/* Load More Notifications Button */}
          {visibleNotifications < notifications.length && (
            <Button
              onClick={handleLoadMoreNotifications}
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              className="btnpatronme"
            >
              Load More
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
