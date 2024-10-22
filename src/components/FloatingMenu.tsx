import { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faTrophy, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/FloatingMenu.module.css';
import { useActiveAccount } from 'thirdweb/react';
import { useUserStatus } from '../context/UserStatusContext'; // Import the user status context

// Helper function to format numbers
const formatNumber = (value: number): string => {
  if (isNaN(value)) return '0.0';

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}mil`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  } else {
    return value.toFixed(1);
  }
};

export default function FloatingMenu() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [openModal, setOpenModal] = useState<'reputation' | 'energy' | null>(null);
  const account = useActiveAccount(); // Get the connected account information
  const { energy, reputation } = useUserStatus(); // Get energy and reputation from global state

  const toggleMenu = () => {
    if (isExpanded) {
      setClosing(true);
      setTimeout(() => {
        setIsExpanded(false);
        setClosing(false);
      }, 300); // Duration of slide-down animation
    } else {
      setIsExpanded(true);
    }
  };

  const handleOpenModal = (type: 'reputation' | 'energy') => {
    setOpenModal(type);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  // Don't render anything if the wallet is not connected
  if (!account?.address) {
    return null;
  }

  return (
    <>
      {/* Small Rectangle or Circle when clicked */}
      <div className={`${styles.menu} ${isExpanded ? styles.expanded : ''}`} onClick={toggleMenu}>
        {!isExpanded ? (
          <div className={styles.smallMenu}>
            <div className={`${styles.counter} ${styles.reputation}`}>
              <FontAwesomeIcon icon={faTrophy} />
              <span>{formatNumber(reputation)}</span> {/* Dynamic formatted reputation */}
            </div>
            <div className={styles.separator}></div> {/* Soft gray separator */}
            <div className={`${styles.counter} ${styles.energy}`}>
              <FontAwesomeIcon icon={faFire} />
              <span>{formatNumber(energy)}</span> {/* Dynamic formatted energy */}
            </div>
          </div>
        ) : (
          <div className={styles.closeIcon}>
            <FontAwesomeIcon icon={faTimes} />
          </div>
        )}
      </div>

      {/* Expanded container with slide-up and slide-down animations */}
      {isExpanded && (
        <div className={`${styles.expandedContainer} ${closing ? styles.slideDown : ''}`}>
          <div className={`${styles.row} ${styles.reputation}`}>
            <FontAwesomeIcon icon={faTrophy} className={styles.icon} />
            <span>Reputation [{formatNumber(reputation)}]</span>
            <Button
              onClick={() => handleOpenModal('reputation')}
              sx={{
                fontFamily: 'BaseFont, sans-serif',
                fontSize: '10px',
                textDecoration: 'dashed',
              }}
            >
              What is?
            </Button>
          </div>
          <div className={`${styles.row} ${styles.energy}`}>
            <FontAwesomeIcon icon={faFire} className={styles.icon} />
            <span>Energy [{formatNumber(energy)}]</span>
            <Button
              onClick={() => handleOpenModal('energy')}
              sx={{
                fontFamily: 'BaseFont, sans-serif',
                fontSize: '10px',
                textDecoration: 'dashed',
              }}
            >
              What is?
            </Button>
          </div>
        </div>
      )}

      {/* Modal for "What is?" explanation */}
      <Modal open={openModal !== null} onClose={handleCloseModal}>
        <Box className={styles.modalBox}>
          <Typography variant="h6">
            {openModal === 'reputation' ? 'What is Reputation?' : 'What is Energy?'}
          </Typography>
          <img src="/path-to-image" alt={openModal} className={styles.modalImage} />
          <Typography>
            {openModal === 'reputation' ? (
              'Reputation represents your standing within the community, based on your actions and contributions.'
            ) : (
              'Energy represents the current power you have to perform actions within the platform.'
            )}
          </Typography>
          <Button onClick={handleCloseModal}>Close</Button>
        </Box>
      </Modal>
    </>
  );
}
