// src/components/Daily.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Modal, Grid, Avatar } from '@mui/material';
import { Star, CheckCircle } from '@mui/icons-material';

interface DailyProps {
  dailyData: {
    success: boolean;
    settings: Array<{
      day: number;
      reputation_reward: string;
      energy_reward: string;
      vision_reward: string;
    }>;
    wallet: {
      id: number;
      wallet: string;
      total_reputation: string;
      total_energy: string;
      total_vision: string;
      first_claim: string;
      last_claim: string;
      is_claimed: number;
      current_day: number;
      consecutive_days: number;
      next_claim_time: string;
    } | null;
  };
  onClaim: () => void;
}

const Daily: React.FC<DailyProps> = ({ dailyData, onClaim }) => {
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    if (dailyData?.wallet && dailyData.wallet.next_claim_time) {
      setClaimTimer(dailyData.wallet.next_claim_time);
    }
  }, [dailyData]);

  const setClaimTimer = (nextClaimTime: string) => {
    const targetTime = new Date(nextClaimTime).getTime();
    const now = Date.now();
    const timeDifference = targetTime - now;

    if (timeDifference > 0) {
      setTimer(Math.ceil(timeDifference / 1000)); // Timer in seconds
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev && prev <= 1) {
            clearInterval(interval);
            return null; // Stop the timer when it reaches zero
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    } else {
      setTimer(null); // Timer is over, allow claiming
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleOpen = (day: number) => {
    setOpen(true);
    onClaim();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const renderDayTile = (day: number) => {
    const reward = dailyData.settings.find((setting) => setting.day === day);
    const isWalletEmpty = !dailyData.wallet || !dailyData.wallet.current_day;
    const currentDay = isWalletEmpty ? 1 : dailyData.wallet.current_day;
    const isPastDay = day < currentDay;
    const isCurrentDay = day === currentDay;
    const isFutureDay = day > currentDay;
    const nextClaimTime = dailyData.wallet?.next_claim_time
      ? new Date(dailyData.wallet.next_claim_time).getTime()
      : null;
    const now = Date.now();
    const timerActive = nextClaimTime && nextClaimTime > now;
    const claimAvailable = isCurrentDay && !timerActive;

    const visionReward = parseFloat(reward?.vision_reward || '0');

    return (
      <Grid item xs={12} sm={4} md={day === 7 ? 12 : 4} key={day}>
        <Box
          sx={{
            backgroundColor: isPastDay || isFutureDay ? '#ccc' : '#204595',
            padding: 2,
            borderRadius: 2,
            textAlign: 'center',
            boxShadow: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'auto',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <Avatar
            sx={{
              bgcolor: isPastDay ? 'success.main' : 'primary.main',
              marginBottom: 1,
            }}
          >
            {isPastDay ? <CheckCircle /> : <Star />}
          </Avatar>
          <Typography variant="h6" className="basefont titleday">
            Day {day}
          </Typography>
          <Typography variant="body2">
            Reputation: {reward?.reputation_reward || 0}, Energy: {reward?.energy_reward || 0}
            {visionReward > 0 && `, Vision: ${Math.round(visionReward)}`}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            className="btnpatronme"
            onClick={() => handleOpen(day)}
            disabled={isPastDay || isFutureDay || (isCurrentDay && timerActive)}
            sx={{ marginTop: 1 }}
          >
            {isPastDay
              ? 'Claimed'
              : isFutureDay
              ? 'Claim'
              : isCurrentDay && timerActive
              ? formatTime(timer!)
              : 'Claim'}
          </Button>
        </Box>
      </Grid>
    );
  };

  return (
    <Box sx={{ padding: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom className="basefont onerem">
        Daily Checkpoint Rewards
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 4 }}>
        Claim your rewards every day! Each day offers a bigger prize, and on Day 7, there's a special bonus reward waiting for you.
      </Typography>
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        {[1, 2, 3].map((day) => renderDayTile(day))}
      </Grid>
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        {[4, 5, 6].map((day) => renderDayTile(day))}
      </Grid>
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12}>
          {renderDayTile(7)}
        </Grid>
      </Grid>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" component="h2">
            Congratulations!
          </Typography>
          <Typography sx={{ mt: 2 }}>
            You have claimed your reward for today.
          </Typography>
          <Button onClick={handleClose} sx={{ mt: 2 }} variant="contained" color="secondary">
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Daily;
