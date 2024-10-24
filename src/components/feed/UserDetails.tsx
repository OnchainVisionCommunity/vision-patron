// src/components/feed/UserDetails.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Box, Avatar, Typography, Button, Drawer, IconButton, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GroupIcon from '@mui/icons-material/Group';
import CasinoIcon from '@mui/icons-material/Casino';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import PaidIcon from '@mui/icons-material/Paid';
import EditIcon from '@mui/icons-material/Edit';
import { faShieldHeart } from '@fortawesome/free-solid-svg-icons';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import { ConnectButton } from 'thirdweb/react';
import { connectButtonConfig } from '../../config/connectButtonConfig';
import logo from '../../assets/images/vp-logo-rec.png';
import visionmenu from '../../assets/images/icons/white/vp-icon-white.png';
import visionicon from '../../assets/images/icons/gray/visionicon-gray.png';
import dexicon from '../../assets/images/icons/gray/dexscreener-gray.png';
import giticon from '../../assets/images/icons/gray/giticon-gray.png';
import telegramicon from '../../assets/images/icons/gray/telegramicon-gray.png';
import xicon from '../../assets/images/icons/gray/xicon-gray.png';

const UserDetails = ({ walletAddress }: { walletAddress: string }) => {
  const [userData, setUserData] = useState<any>(null); // Store user data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [drawerOpen, setDrawerOpen] = useState(false); // Drawer state for mobile

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`https://api.visioncommunity.xyz/v02/user/get?wallet=${walletAddress}`);
        const data = await response.json();
        if (data.success) {
          setUserData(data);
        } else {
          setError('Failed to fetch user data');
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [walletAddress]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }
  
  if (!userData) {
  return <Typography>Loading...</Typography>;
}

  const { user, isOwner, patronCommunities, unreadNotifications, badges } = userData;

  const displayName = user.basename || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  // Function to toggle the Drawer
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    setDrawerOpen(open);
  };

  return (
    <>
      {/* Desktop layout */}
      <Grid
        item
        className="feedcustom pdtop30"
        xs={0}
        md={3}
        sx={{
          display: { xs: 'none', md: 'block' }, // Hide on small screens
          overflowY: 'auto',
          height: '100%', // Adjust height dynamically
          backgroundColor: '#f9f9f9',
          padding: 2,
          borderRight: '1px solid #333',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        <Box display={{ xs: 'none', md: 'block' }} className="userleftdesktop">

{/* ConnectButton */}
<div className="logobuttoncont">
	<Link to="/"><Image src={logo} alt="Vision" className="smalllogovision" /></Link>
	<div className="connwalletcont"><ConnectButton {...connectButtonConfig} /></div>
</div>

          <div className="feedcustomparent userleftparent">
            {/* Header Section */}
            <Box display="flex" justifyContent="start" mb={2}>
              {/* Left: Avatar */}
              <Avatar
                src={user.avatar || 'https://rallyrd.com/wp-content/uploads/2022/03/punk-08.jpg'}
                alt="Profile Avatar"
                sx={{ width: 45, height: 45, mr: 0.7, marginTop: '6px' }}
              />

              {/* Right: User Info */}
              <Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <Typography fontWeight="bold" sx={{ mr: 0.5 }} className="usernamemenu">
                    {displayName}
                  </Typography>
                  {/* Display badges */}
                  {badges?.map((badge: any, index: number) => (
                    <Avatar key={index} src={badge.image} sx={{ width: 18, height: 18, mr: 0.2 }} />
                  ))}
                </Box>

                <Box display="flex">
                  {isOwner && (
                    <Button
                      className="btnpatronme smallbtn"
                      sx={{ mr: 0.5 }}
                      variant="contained"
                      startIcon={<GroupIcon />}
                      component={Link}
                      to={`/communities/${walletAddress}`}
                    >
                      Community
                    </Button>
                  )}
                  <Link to="/profile">
                    <Button className="btnpatronme smallbtn" variant="contained" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                  </Link>
                </Box>
              </Box>
            </Box>





            {/* Profile Options */}
            <div className="optionsparent" style={{ marginBottom: '20px' }}>
              <Link to="/">
                <div className="robototstylefont menudekitem">
                  <HomeIcon style={{ marginRight: '10px' }} />
                  <span>Home</span>
                </div>
              </Link>
              
              <Link to="/patron">
                <div className="robototstylefont menudekitem alignicon">
                  <Image src={visionmenu} style={{ marginRight: '10px' }} className="imgicon" />
                  <span>Patron</span>
                </div>
              </Link>

              <Link to="/notifications">
                <div className="robototstylefont menudekitem" style={{ position: 'relative' }}>
                  <NotificationsIcon style={{ marginRight: '10px' }} />
                  <span>Notifications</span>
                  {unreadNotifications > 0 && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginLeft: '8px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'red',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </div>
              </Link>

              <Link to="/communities">
                <div className="robototstylefont menudekitem">
                  <GroupIcon style={{ marginRight: '10px' }} />
                  <span>Communities</span>
                </div>
              </Link>

              <Link to="/rollfragment">
                <div className="robototstylefont menudekitem">
                  <CasinoIcon style={{ marginRight: '10px' }} />
                  <span>Roll NFT Shards</span>
                </div>
              </Link>
              
				<Link to="/searchshard">
              <div className="robototstylefont menudekitem">
                <SearchIcon style={{ marginRight: '10px' }} />
                <span>Check NFT Shards</span>
              </div>
              </Link>

			<Link to="/">
			  <div className="robototstylefont menudekitem">
			    <LocalPoliceIcon style={{ marginRight: '10px' }} />
			    <span>PvP Deck (Soon)</span>
			  </div>
			</Link>
              
              <Link to="/claims">
                <div className="robototstylefont menudekitem">
                  <PaidIcon style={{ marginRight: '10px' }} />
                  <span>Wins History</span>
                </div>
              </Link>

            </div>




            {/* Patroned Communities */}
            <hr className="sep marginbot20" />
            <div>
              <h3 className="basestylefont marginbot">Patroned Communities</h3>
              {patronCommunities
                .filter((community: any) => community.patron_is_member)
                .map((community: any, index: number) => {
                  const communityName =
                    community.customname ||
                    community.basename ||
                    `${community.owner?.slice(0, 6)}...${community.owner?.slice(-4)}` ||
                    'Unnamed Community';
                  return (
                    <div
                      key={index}
                      className="communityItem menudekitem"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px',
                        cursor: 'pointer',
                      }}
                      onClick={() => window.location.href = `/communities/${community.owner}`}
                    >
                      <img
                        src={community.avatar || 'https://s20056.pcdn.co/wp-content/themes/bureau-qnetwork/assets/img-cdn/placeholder-groups.6cd09088.png'}
                        alt="Community Avatar"
                        style={{ width: '22px', height: '22px', marginRight: '8px', borderRadius: '50px' }}
                      />
                      <div style={{ flexGrow: 1 }}>
                        <span className="robototstylefont">{communityName}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        <div className="otherlinks">v2.3.4 | <Link to="/faq">FAQ</Link> | <Link to="/status">System Status</Link> | <Link to="/terms">Terms of use</Link></div>
        <div className="divmenuicons">
        	<a href="https://visioncommunity.xyz" target="_blank"><Image src={visionicon} /></a>
        	<a href="https://dexscreener.com/base/0xe659020edd96ff279bfb9680e664e4ed44198c7d" target="_blank"><Image src={dexicon} /></a>
        	<a href="https://t.me/onchainvisionbase" target="_blank"><Image src={telegramicon} /></a>
        	<a href="https://x.com/OCVCommunity" target="_blank"><Image src={xicon} /></a>
        	<a href="https://github.com/OnchainVisionCommunity/vision-patron" target="_blank"><Image src={giticon} /></a>
        </div>
        <div className="footer">$VISION is a CTO token and community-driven tribute project. Not affiliated with Coinbase Vision. Developed by <a href="https://warpcast.com/pongl" target="_blank">Chris Pongl</a>.</div>
 
        </Box>
      </Grid>















      {/* Mobile layout with Drawer */}
      <IconButton
        onClick={toggleDrawer(true)}
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 75,  // Changed to bottom
          left: 15,    // Changed to left
          zIndex: 1000,
          border: '1px solid #666',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.4)',
          padding: '0px'
        }}
      >
<Avatar
  src={user.avatar || 'https://rallyrd.com/wp-content/uploads/2022/03/punk-08.jpg'}
  alt="Profile Avatar"
  sx={{ 
    width: 60, 
    height: 60, 
    
  }}
/>

      </IconButton>

      <Drawer
        anchor="left"  // Changed to left
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: { width: '80vw', backgroundColor: '#222', color: 'white',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
         overflowY: 'auto',
          },
        }}
      >

        <Box display={{ xs: 'none', md: 'block' }} className="userleftdesktop">

{/* ConnectButton */}
<div className="logobuttoncont">
	<Link to="/"><Image src={logo} alt="Vision" className="smalllogovision" /></Link>
	<div className="connwalletcont"><ConnectButton {...connectButtonConfig} /></div>
</div>

          <div className="feedcustomparent userleftparent contmenumobile">
            {/* Header Section */}
            <Box display="flex" justifyContent="start" mb={2}>
              {/* Left: Avatar */}
              <Avatar
                src={user.avatar || 'https://rallyrd.com/wp-content/uploads/2022/03/punk-08.jpg'}
                alt="Profile Avatar"
                sx={{ width: 45, height: 45, mr: 0.7, marginTop: '6px' }}
              />

              {/* Right: User Info */}
              <Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <Typography fontWeight="bold" sx={{ mr: 0.5 }} className="usernamemenu">
                    {displayName}
                  </Typography>
                  {/* Display badges */}
                  {badges?.map((badge: any, index: number) => (
                    <Avatar key={index} src={badge.image} sx={{ width: 18, height: 18, mr: 0.2 }} />
                  ))}
                </Box>

                <Box display="flex">
                  {isOwner && (
                    <Button
                      className="btnpatronme smallbtn"
                      sx={{ mr: 0.5 }}
                      variant="contained"
                      startIcon={<GroupIcon />}
                      component={Link}
                      to={`/communities/${walletAddress}`}
                    >
                      Community
                    </Button>
                  )}
                  <Link to="/profile">
                    <Button className="btnpatronme smallbtn" variant="contained" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                  </Link>
                </Box>
              </Box>
            </Box>





            {/* Profile Options */}
            <div className="optionsparent" style={{ marginBottom: '20px' }}>
              <Link to="/">
                <div className="robototstylefont menudekitem">
                  <HomeIcon style={{ marginRight: '10px' }} />
                  <span>Home</span>
                </div>
              </Link>
              
              <Link to="/patron">
                <div className="robototstylefont menudekitem alignicon">
                  <Image src={visionmenu} style={{ marginRight: '10px' }} className="imgicon" />
                  <span>Patron</span>
                </div>
              </Link>

              <Link to="/notifications">
                <div className="robototstylefont menudekitem" style={{ position: 'relative' }}>
                  <NotificationsIcon style={{ marginRight: '10px' }} />
                  <span>Notifications</span>
                  {unreadNotifications > 0 && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginLeft: '8px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'red',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </div>
              </Link>

              <Link to="/communities">
                <div className="robototstylefont menudekitem">
                  <GroupIcon style={{ marginRight: '10px' }} />
                  <span>Communities</span>
                </div>
              </Link>

              <Link to="/rollfragment">
                <div className="robototstylefont menudekitem">
                  <CasinoIcon style={{ marginRight: '10px' }} />
                  <span>Roll NFT Shards</span>
                </div>
              </Link>
              
				<Link to="/searchshard">
              <div className="robototstylefont menudekitem">
                <SearchIcon style={{ marginRight: '10px' }} />
                <span>Check NFT Shards</span>
              </div>
              </Link>

			<Link to="/">
			  <div className="robototstylefont menudekitem">
			    <LocalPoliceIcon style={{ marginRight: '10px' }} />
			    <span>PvP Deck (Soon)</span>
			  </div>
			</Link>
              
              <Link to="/claims">
                <div className="robototstylefont menudekitem">
                  <PaidIcon style={{ marginRight: '10px' }} />
                  <span>Wins History</span>
                </div>
              </Link>

            </div>




            {/* Patroned Communities */}
            <div className="patronedcommunitiesmobile">
              <h3 className="basestylefont marginbot">Patroned Communities</h3>
              {patronCommunities
                .filter((community: any) => community.patron_is_member)
                .map((community: any, index: number) => {
                  const communityName =
                    community.customname ||
                    community.basename ||
                    `${community.owner?.slice(0, 6)}...${community.owner?.slice(-4)}` ||
                    'Unnamed Community';
                  return (
                    <div
                      key={index}
                      className="communityItem menudekitem"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px',
                        cursor: 'pointer',
                      }}
                      onClick={() => window.location.href = `/communities/${community.owner}`}
                    >
                      <img
                        src={community.avatar || 'https://s20056.pcdn.co/wp-content/themes/bureau-qnetwork/assets/img-cdn/placeholder-groups.6cd09088.png'}
                        alt="Community Avatar"
                        style={{ width: '22px', height: '22px', marginRight: '8px', borderRadius: '50px' }}
                      />
                      <div style={{ flexGrow: 1 }}>
                        <span className="robototstylefont">{communityName}</span>
                      </div>
                    </div>
                  );
                })}
                
                <div className="footermobile">
			        <div className="otherlinks">v2.3.4 | <Link to="/faq">FAQ</Link> | <Link to="/status">System Status</Link> | <Link to="/terms">Terms of use</Link></div>
			        <div className="divmenuicons">
			        	<a href="https://visioncommunity.xyz" target="_blank"><Image src={visionicon} /></a>
			        	<a href="https://dexscreener.com/base/0xe659020edd96ff279bfb9680e664e4ed44198c7d" target="_blank"><Image src={dexicon} /></a>
			        	<a href="https://t.me/onchainvisionbase" target="_blank"><Image src={telegramicon} /></a>
			        	<a href="https://x.com/OCVCommunity" target="_blank"><Image src={xicon} /></a>
			        	<a href="https://github.com/OnchainVisionCommunity/vision-patron" target="_blank"><Image src={giticon} /></a>
			        </div>
			        <div className="footer">$VISION is a CTO token and community-driven tribute project. Not affiliated with Coinbase Vision. Developed by <a href="https://warpcast.com/pongl" target="_blank">Chris Pongl</a>.</div>

                </div>
            </div>
          </div>
 
        </Box>

      </Drawer>
    </>
  );
};

export default UserDetails;
