import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useActiveAccount } from 'thirdweb/react';

interface UserStatusContextProps {
  energy: number;
  reputation: number;
  updateEnergy: (value: number) => void;
  updateReputation: (value: number) => void;
  fetchUserStatus: () => void;
}

const UserStatusContext = createContext<UserStatusContextProps | undefined>(undefined);

export const UserStatusProvider: React.FC = ({ children }) => {
  const [energy, setEnergy] = useState<number>(0);
  const [reputation, setReputation] = useState<number>(0);
  const [animatingEnergy, setAnimatingEnergy] = useState<boolean>(false); // Only keep animation for energy
  const account = useActiveAccount();
  const fetchTimeout = useRef<NodeJS.Timeout | null>(null); // Store timeout reference

  // Energy animation logic
  const animateEnergy = (start: number, end: number) => {
    const duration = 500;
    const increment = (end - start) / (duration / 16); // 16ms per frame (assuming 60fps)
    let currentValue = start;

    setAnimatingEnergy(true); // Block fetches while animating

    const interval = setInterval(() => {
      currentValue += increment;
      if ((increment > 0 && currentValue >= end) || (increment < 0 && currentValue <= end)) {
        currentValue = end;
        clearInterval(interval);
        setAnimatingEnergy(false); // Allow fetches after animation completes
      }
      setEnergy(currentValue);
    }, 16); // Update every 16ms for smooth animation
  };

  // Update energy value with animation and ensure we don't reset it to 0 accidentally
  const updateEnergy = (value: number) => {
    if (value === 0 || value === null) return; // Do nothing if value is 0 or null

    if (!animatingEnergy) {
      const newEnergy = energy + value;
      animateEnergy(energy, Math.max(newEnergy, 0)); // Ensure energy never goes below 0
    }
  };

  // Update reputation directly and ensure we don't reset it to 0 accidentally
  const updateReputation = (value: number) => {
    if (value === 0 || value === null) return; // Do nothing if value is 0 or null

    const newReputation = reputation + value;
    setReputation(Math.max(newReputation, 0)); // Ensure reputation never goes below 0
  };

  // Fetch user status for energy and reputation separately
  const fetchUserStatus = async () => {
    if (account?.address) {
      try {
        const response = await axios.get('https://api.visioncommunity.xyz/v02/user/get/energy', {
          params: { walletAddress: account.address },
        });

        const { energy: fetchedEnergy, reputation: fetchedReputation } = response.data;

        // Update energy and reputation states without animation (fetched directly)
        setEnergy(parseFloat(fetchedEnergy) || 0);
        setReputation(parseFloat(fetchedReputation) || 0);
      } catch (error) {
        console.error('Error fetching energy and reputation:', error);
      }
    }
  };

  // Delayed fetch for energy after animation
  const delayedFetchEnergy = () => {
    if (fetchTimeout.current) {
      clearTimeout(fetchTimeout.current);
    }
    fetchTimeout.current = setTimeout(fetchUserStatus, 1000); // Fetch energy after 1 second
  };

  useEffect(() => {
    if (account?.address) {
      fetchUserStatus();
    }

    // Cleanup on component unmount
    return () => {
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current);
      }
    };
  }, [account?.address]);

  useEffect(() => {
    // Trigger fetch after energy animation completes
    if (!animatingEnergy) {
      delayedFetchEnergy();
    }
  }, [animatingEnergy]);

  return (
    <UserStatusContext.Provider value={{ energy, reputation, updateEnergy, updateReputation, fetchUserStatus }}>
      {children}
    </UserStatusContext.Provider>
  );
};

export const useUserStatus = () => {
  const context = useContext(UserStatusContext);
  if (!context) {
    throw new Error('useUserStatus must be used within a UserStatusProvider');
  }
  return context;
};
