import React, { useState, useEffect } from 'react';
import { Box, Grid, Button, IconButton, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import AppsIcon from '@mui/icons-material/Apps';
import GridViewIcon from '@mui/icons-material/GridView';
import UserDetails from './feed/UserDetails';
import NFTGallery from './fragments/NFTGallery';
import NFTList from './fragments/NFTList';
import RollFragmentModal from './fragments/RollFragmentModal';
import { ethers } from 'ethers';
import contractABI from '../abis/patron_testnet.json'; // Make sure the ABI is correctly referenced
import { useActiveAccount } from 'thirdweb/react';
import axios from 'axios';
import CreateProfile from './CreateProfile';

const RollFragment = () => {
  const [view, setView] = useState<'list' | 'grid-4' | 'grid-9'>('grid-4'); // Layout state
  const [showOnlyUnrolled, setShowOnlyUnrolled] = useState(false); // Toggle for unrolled fragments
  const [nfts, setNfts] = useState<NFT[]>([]); // NFT data state
  const [currentPage, setCurrentPage] = useState(1); // Page state
  const [totalPages, setTotalPages] = useState(1); // Total pages based on NFTs count
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null); // State for the selected NFT
  const [openModal, setOpenModal] = useState(false); // Modal state
  const [loading, setLoading] = useState(false); // Loading state for fetching NFTs
  const [hasProfile, setHasProfile] = useState<boolean | null>(null); // To track if the user has a profile
  const NFTsPerPage = 24; // Number of NFTs to display per page

  const providerUrl = process.env.NEXT_PUBLIC_CB_ENDPOINT;
  const contractAddress = process.env.NEXT_PUBLIC_TRANSFER_AND_MINT_CONTRACT!;

  const account = useActiveAccount();

  // Function to fetch NFT metadata from the backend API
  const fetchNFTMetadata = async (nftIds: string[], page: number) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.visioncommunity.xyz/v02/nft/getowned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nftIds, // Send the NFT IDs
          page,
          pageSize: NFTsPerPage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Convert `nfts` object into an array and set the state
        const nftsArray = Object.values(data.nfts);
        setNfts(nftsArray); // Store fetched NFTs metadata in state as an array
        setTotalPages(data.total_pages);
      } else {
        console.error('Error fetching NFT metadata:', data.error);
      }
    } catch (error) {
      console.error('Error during metadata fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to check if the profile exists
  const checkProfile = async (walletAddress: string) => {
    try {
      const response = await axios.get(
        `https://api.visioncommunity.xyz/v02/user/get?wallet=${walletAddress}`
      );
      if (response.status === 200 && response.data.success) {
        setHasProfile(true); // Profile exists
      } else {
        setHasProfile(false); // No profile found
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setHasProfile(false); // No profile found
      } else {
        console.error('Error fetching profile:', error);
      }
    }
  };

  // Function to fetch NFT IDs owned by the wallet
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!account?.address) return; // Return early if wallet is not connected
      setLoading(true);
      const provider = new ethers.providers.JsonRpcProvider(providerUrl);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      try {
        // Use the tokensOfOwner function to get all token IDs owned by the wallet
        const tokenIds = await contract.tokensOfOwner(account.address);

        // Convert NFT IDs to strings and store them
        const nftIds = tokenIds.map((id: any) => id.toString());

        if (nftIds.length > 0) {
          // Fetch metadata for the first page of NFTs
          fetchNFTMetadata(nftIds, currentPage);
        } else {
          // Handle case where the wallet owns no NFTs
          setNfts([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (account?.address) {
      // If the wallet is connected, check for profile
      checkProfile(account.address);
      fetchNFTs();
    }
  }, [providerUrl, contractAddress, currentPage, account]);

  // Handle switching between grid and list views
  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: 'list' | 'grid-4' | 'grid-9') => {
    if (newView) {
      setView(newView);
    }
  };

  // Handle modal open
  const handleOpenModal = (nft: NFT) => {
    // Extract amount and pooled from the metadata attributes
    const amountAttr = nft.metadata.attributes.find(attr => attr.trait_type === 'Amount');
    const pooledAttr = nft.metadata.attributes.find(attr => attr.trait_type === 'Pooled');

    const amount = amountAttr ? Number(amountAttr.value) : 0;  // Ensure numeric
    const pooled = pooledAttr ? Number(pooledAttr.value) : 0;  // Ensure numeric

    // Calculate reputation as the average of sender and receiver reputation
    const reputation = (nft.normalized_sender_reputation + nft.normalized_receiver_reputation) / 2;

    // Use nft.nft_id instead of nft.id to match the API response
    const nftId = nft.nft_id;

    // Set selected NFT and open modal, passing the extracted values
    setSelectedNFT({ ...nft, reputation, amount, pooled, id: nftId });
    setOpenModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedNFT(null);
  };

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // If the wallet is connected but the profile is not found, show the CreateProfile component
  if (hasProfile === false) {
    return <CreateProfile />;
  }

  // Return early if wallet is not connected
  if (!account?.address) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h6" gutterBottom>
          Please, sign in / connect wallet to see this page
        </Typography>
      </Box>
    );
  }

  return (
    <div className="pagefeed" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Grid container spacing={2} sx={{ height: 'calc(100vh)', overflow: 'hidden' }} >
        {/* Left Sidebar (User Profile) */}

          <UserDetails walletAddress={account.address} /> {/* Pass connected wallet address */}


        {/* NFT Gallery Section */}
        <Grid item xs={12} md={9} 
            sx={{
              height: '100%', // Adjust height dynamically
              padding: 2,
              overflowY: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
        >
          {/* Search and Settings Section */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            {/* Search Bar */}
            <TextField
              variant="outlined"
              className="textinputnft"
              placeholder="Search your fragments (NFTs)..."
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <IconButton>
              <SearchIcon className="btnpatronme srcbtn" />
            </IconButton>

            {/* View Icons */}
            <ToggleButtonGroup value={view} exclusive onChange={handleViewChange} sx={{ mr: 2 }}>
              <ToggleButton value="list" className="iconnft">
                <ViewListIcon />
              </ToggleButton>
              <ToggleButton value="grid-4" className="iconnft">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="grid-9" className="iconnft">
                <AppsIcon />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Toggle for "Show Only Unrolled" */}
            <ToggleButton
              value="check"
              selected={showOnlyUnrolled}
              onChange={() => setShowOnlyUnrolled(!showOnlyUnrolled)}
              className="btnpatronme"
            >
              Show Only Unrolled
            </ToggleButton>
          </Box>

          {/* NFT Display (List or Grid) */}
          {loading ? (
            <Typography>Loading NFTs...</Typography>
          ) : view === 'list' ? (
            <NFTList nfts={nfts} showOnlyUnrolled={showOnlyUnrolled} onOpenModal={handleOpenModal} />
          ) : (
            <NFTGallery nfts={nfts} view={view} showOnlyUnrolled={showOnlyUnrolled} onOpenModal={handleOpenModal} />
          )}

          {/* Pagination Controls */}
          <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
            <Button variant="outlined" onClick={handlePreviousPage} disabled={currentPage === 1}>
              Previous
            </Button>
            <Typography sx={{ mx: 2 }}>
              Page {currentPage} of {totalPages}
            </Typography>
            <Button variant="outlined" onClick={handleNextPage} disabled={currentPage === totalPages}>
              Next
            </Button>
          </Box>

          {/* Modal for "Roll Fragment" */}
          {selectedNFT && (
            <RollFragmentModal open={openModal} onClose={handleCloseModal} nft={selectedNFT} />
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default RollFragment;
