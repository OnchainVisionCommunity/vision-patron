import '../styles/globals.css';
import '../styles/Feed.css';
import '@coinbase/onchainkit/styles.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import Head from 'next/head';
import { base } from 'thirdweb/chains';
import Image from 'next/image';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '../wagmi';
import { ThirdwebProvider, ConnectButton, useActiveAccount } from 'thirdweb/react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { BrowserRouter as Router, Route, Routes, Link, Outlet } from 'react-router-dom';
import axios from 'axios';

import logo from '../assets/images/vp-logo-rec.png';
import logoswap from '../assets/images/logo-onbase-v02.png';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@mui/material';
import visionmenu from '../assets/images/icons/white/visionicon-white.png';

import { connectButtonConfig } from '../config/connectButtonConfig';
import TipComponent from '../pages/TipComponent';
import UserProfile from '../components/userprofile';
import PublicProfilePage from '../components/PublicProfilePage';
import CommunitiesPage from '../components/CommunitiesPage';
import CommunityDetail from '../components/CommunityDetail';
import EditCommunityPage from '../components/EditCommunityPage';
import NotificationsPage from '../components/NotificationsFullPage';
import SearchFragmentPage from '../components/SearchFragmentPage';
import PatronPage from '../components/PatronPage';
import StreamsPage from '../components/StreamsPage';
import FloatingMenu from '../components/FloatingMenu';
import Feed from '../components/Feed';
import RollFragment from '../components/RollFragment';
import ClaimsPage from '../components/ClaimsPage';
import StatusPage from '../components/StatusPage';
import TermsPage from '../components/TermsPage';
import FAQPage from '../components/FAQPage';
import { UserStatusProvider } from '../context/UserStatusContext';
import favicon from '../assets/images/favicon.png'

// Create a QueryClient instance for react-query
const queryClient = new QueryClient();

// Use environment variables for clientId and API key
const thirdwebClientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const onchainKitApiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;



// Notifications Menu Icon with Unread Badge
function NotificationsIcon({ unreadCount }: { unreadCount: number }) {
  return (
    <Badge badgeContent={unreadCount} color="error" overlap="circular">
      <FontAwesomeIcon icon={faBell} size="2x" />
    </Badge>
  );
}

// Home Page Component
function Home() {
  return (
	  <div className="parent">
    <div className="parent-container">
      {/* Left Container: Logo animation and subtitle */}
      <div className="left-container">
        {/* Logo with animation */}
        <div className="flex justify-end items-center h-full header">
          <Image src={logoswap} alt="Logo" className="logo-animation" />
        </div>
        {/* Subtitle */}
        <div className="flex justify-end items-center h-full header subtitle subtitle-animation">
          Unlock a new world of onchain communities.<br />Become an onchain patron.
        </div>
        <div className="social">
          <a href="https://t.me/onchainvisionbase" target="_blank" rel="noopener noreferrer">
            <img
              src="https://visioncommunity.xyz/wp-content/uploads/elementor/thumbs/telegram-white-quek8vsd5j6lacvah67hv6ug7r518xvpv2b7ux1ok0.png"
              alt="Telegram"
            />
          </a>
          <a href="https://x.com/OCVCommunity" target="_blank" rel="noopener noreferrer">
            <img
              src="https://visioncommunity.xyz/wp-content/uploads/elementor/thumbs/x-white-quek98094u577czh74358uw3twjil0ivytcq9bkmww.png"
              alt="Twitter"
            />
          </a>
          <a href="https://visioncommunity.xyz/" target="_blank" rel="noopener noreferrer">
            <img
              src="https://patron.visioncommunity.xyz/img/icons/www-white.png"
              alt="Website"
            />
          </a>
        </div>
        <div className="tokeninfo">
          <a href="https://basescan.org/address/0x07609D76e2E098766AD4e2b70B84f05b215d380a" target="_blank">$VISION</a>/
          <a href="https://basescan.org/address/0xE8D2B6c63f74591dF9E91261E28a9292b7e91B8D" target="_blank">Patron</a>/
          <a href="https://basescan.org/address/0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD" target="_blank">OnchainSwap</a>
        </div>
      </div>

      {/* Right Container: TipComponent and token addresses */}
      <div className="right-container">
        <TipComponent />
      </div>
    </div>
    </div>
  );
}





// Responsive Menu Component Backup
function ResponsiveMenu() {
  const [isMobile, setIsMobile] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const account = useActiveAccount(); // Get the active account

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // API call to fetch unread notifications count
useEffect(() => {
  const fetchNotifications = async () => {
    if (account?.address) {  // Check if the wallet is connected
      try {
        const response = await axios.get(`https://api.visioncommunity.xyz/v02/user/notifications?wallet=${account.address}`); // Pass the wallet address to the API
        const unreadCount = response.data.unreadCount || 0;
        setUnreadCount(unreadCount); // Set unreadCount from API, default to 0 if undefined
        
        // Set the PWA app badge with the unread notifications count
        if ('setAppBadge' in navigator) {
          navigator.setAppBadge(unreadCount);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setUnreadCount(0);

        // Clear the app badge if there was an error fetching notifications
        if ('clearAppBadge' in navigator) {
          navigator.clearAppBadge();
        }
      }
    }
  };

  fetchNotifications();
}, [account?.address]);

  return (
    <>
      {/* Menu when the wallet is NOT connected, shown on both desktop and mobile */}
      {!account?.address && (
        <nav className={`botmobmen w-full ${isMobile ? 'fixed bottom-0 bg-white' : 'top-0 bg-white'} flex justify-between items-center p-2 z-50`}>
          <div className="logo-container">
            <Link to="/">
              <Image src={logo} alt="Logo" className="logoheader" />
            </Link>
          </div>
          <div className="connwallet">
            <ConnectButton {...connectButtonConfig} />
          </div>
        </nav>
      )}

      {/* Bottom Menu on Mobile when wallet is connected */}
      {isMobile && account?.address && (
        <nav className="w-full fixed bottom-0 bg-black z-50 navdes mobilebottommenu">
          <div className="nav-menu flex justify-around items-center">
            <NavItem to="/" text="Home" icon={faHome} isMobile={isMobile} className="menuiconmobile"/>
            <NavItem to="/patron" text="Patron" icon={visionmenu} isMobile={isMobile} className="menuiconmobile"/>
            <NavItem to="/profile" text="Profile" icon={faUser} isMobile={isMobile} className="menuiconmobile"/>
            <NavItem to="/communities" text="Communities" icon={faGlobe} isMobile={isMobile} className="menuiconmobile"/>

            {/* Notification Icon */}
            <Link to="/notifications" className="flex flex-col items-center relative notification-container">
              <FontAwesomeIcon icon={faBell} className="notification-icon menuiconmobile" />
              {unreadCount > 0 && (
                <span className="notification-badge absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-3.5 w-3.5 flex items-center justify-center menuiconmobile unreadmobi">
                  {unreadCount}
                </span>
              )}
              <span className="text-white text-xs mt-1 text-center">Notifications</span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}



// Individual Navigation Item
function NavItem({ to, text, icon, isMobile }: { to: string, text: string, icon: any, isMobile: boolean }) {
  const isFontAwesomeIcon = typeof icon === 'object' && 'iconName' in icon;

  return (
    <Link to={to} className={`flex ${isMobile ? 'flex-col items-center' : 'items-center'} text-center px-4`}>
      {isMobile ? (
        <>
          {isFontAwesomeIcon ? (
            <FontAwesomeIcon icon={icon} className="menuiconmobile"  />
          ) : (
            <Image src={icon} alt={text} className="menuiconmobile"  />
          )}
          <span className="text-xs mt-1 mobile-menu-text">{text}</span>
        </>
      ) : (
        <span className="uppercase menuopt">{text}</span>
      )}
    </Link>
  );
}

// Layout Component for Persisting Menus
function Layout() {
  return (
    <div className="relative flex flex-col min-h-screen a100width">
      <ResponsiveMenu /> {/* The Menu stays persistent across pages */}
      <main className="maindivparent">
        <Outlet />
      </main>
    </div>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);

  // Combined useEffect for client-side rendering and PWA detection
  useEffect(() => {
    setIsClient(true);

    // Detect if the app is running in PWA mode
    function detectPWA() {
      if (typeof window !== 'undefined') {
        const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isPWA) {
          document.body.classList.add('pwa-mode');
        }
      }
    }

    detectPWA();
  }, []);

  if (!isClient) {
    // Render nothing on the server
    return null;
  }
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThirdwebProvider clientId={thirdwebClientId} supportedChains={[base]}>
          <OnchainKitProvider apiKey={onchainKitApiKey} chain={base}>
            <RainbowKitProvider chains={[base]}>
            	<UserStatusProvider>
	              <Router>
	              <Head>
	              	<link rel="manifest" href="/manifest.json" />
	              	<link rel="icon" href="/vp-favicon.png" type="image/png" />
	              	<meta name="theme-color" content="#111111" />
	              	<title>Patron</title>
	              	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
	              </Head>
	                <Routes>
	                  {/* Wrap all routes with the layout */}
	                  <Route path="/" element={<Layout />}>
	                  	<Route path="/" element={<Feed />} />
	                    <Route path="/patron" element={<PatronPage />} />
	                    <Route path="/profile" element={<UserProfile />} />
	                    <Route path="/profile/:walletAddress" element={<PublicProfilePage />} />
	                    <Route path="/communities" element={<CommunitiesPage />} />
	                    <Route path="/communities/:id" element={<CommunityDetail />} />
	                    <Route path="/communities/:id/edit" element={<EditCommunityPage />} />
	                    <Route path="/notifications" element={<NotificationsPage />} />
	                    <Route path="/communities/:ownerWallet/stream/:streamId" element={<StreamsPage />} />
	                    <Route path="/rollfragment" element={<RollFragment />} />
	                    <Route path="/claims" element={<ClaimsPage />} />
	                    <Route path="/status" element={<StatusPage />} />
	                    <Route path="/searchshard" element={<SearchFragmentPage />} />
	                    <Route path="/terms" element={<TermsPage />} />
	                    <Route path="/faq" element={<FAQPage />} />
	                  </Route>
	                </Routes>
	              </Router>
	              <FloatingMenu />
	            </UserStatusProvider>
            </RainbowKitProvider>
          </OnchainKitProvider>
        </ThirdwebProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
