import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { client } from "./client";
import TipComponent from "./components/TipComponent";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ConnectWallet } from "@thirdweb-dev/react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ConnectButton } from "thirdweb/react";
import { Base } from "@thirdweb-dev/chains";

// Import assets
import logo from './assets/images/logo-rec.png';
import logoswap from './assets/images/logo-onbase-v02.png';

// Import Font Awesome icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUser, faGlobe, faStar } from "@fortawesome/free-solid-svg-icons";

// Import components
import HowItWorks from './components/HowItWorks';
import Roadmap from './components/Roadmap';
import FaqSection from './components/FaqSection';
import CommunitiesPage from './components/Communities';
import CommunityDetail from './components/CommunityDetail';
import EditCommunity from './components/EditCommunity';
import UserProfile from './components/userprofile';  // Import user profile component
import PublicProfile from './components/PublicProfile';  // Import public profile component

const queryClient = new QueryClient();

// Define the custom chains for Base
const baseMainnet = {
  chainId: 8453,
  name: "Base Mainnet",
  chain: "base-mainnet",
  shortName: "Base",
  rpc: ["https://8453.rpc.thirdweb.com"],
  nativeCurrency: { name: "Base ETH", symbol: "ETH", decimals: 18 },
  blockExplorers: [{ name: "BaseScan", url: "https://basescan.org" }],
  slug: "base",
  testnet: false, // Mark it as mainnet
};

const baseSepolia = {
  chainId: 84532,
  name: "Base Sepolia",
  chain: "base-sepolia",
  shortName: "Base Sepolia",
  rpc: ["https://84532.rpc.thirdweb.com"],
  nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
  blockExplorers: [{ name: "Base Sepolia Explorer", url: "https://base-sepolia.blockscout.com" }],
  slug: "base-sepolia",
  testnet: true, // Mark it as testnet
};

const supportedTokens = {
  [Base.chainId]: [
    {
      address: "0x07609D76e2E098766AD4e2b70B84f05b215d380a",
      name: "Vision",
      symbol: "VISION",
      icon: "https://visioncommunity.xyz/img/logo-128.png",
    },
  ],
};

const clientId = "366e48f6dbd1b1874ee2ccad727607a2";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider clientId={clientId} supportedChains={[Base]}>
        <Router>
          <div className="relative flex flex-col min-h-screen">
            <ResponsiveMenu />
            <main className="maindivparent">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<UserProfile />} /> {/* User connected profile */}
                <Route path="/profile/:walletAddress" element={<PublicProfile />} /> {/* Public profile by wallet address */}
                <Route path="/communities" element={<CommunitiesPage />} />
                <Route path="/communities/:id" element={<CommunityDetail />} />
                <Route path="/communities/:id/edit" element={<EditCommunity />} />
                <Route path="/rank" element={<Rank />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}

// Responsive Menu Component
function ResponsiveMenu() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className={`w-full ${isMobile ? 'fixed bottom-0' : 'fixed top-0'} z-50 menuopt`}>
      <div className={`container mx-auto flex ${isMobile ? 'justify-around' : 'justify-between'} items-center p-4`}>
        
        {/* Logo for desktop only */}
        {!isMobile && (
          <div className="mr-auto">
            <Link to="/">
              <img src={logo} alt="Logo" className="h-8" />
            </Link>
          </div>
        )}

        {/* Menu items */}
        <div className={`flex ${isMobile ? 'justify-around' : 'justify-center'} items-center`}>
          <NavItem to="/" text="Home" icon={faHome} isMobile={isMobile} />
          <NavItem to="/profile" text="Profile" icon={faUser} isMobile={isMobile} />
          <NavItem to="/communities" text="Communities" icon={faGlobe} isMobile={isMobile} />
          <div className="socialicons"></div>
          <div className="connwallet">
          	<ConnectWallet
          		modalSize="compact"
          		switchToActiveChain={true}
          		supportedTokens={supportedTokens}
          	 />
          </div>

        </div>
      </div>
    </nav>
  );
}

// Explicitly define the types for NavItem props
interface NavItemProps {
  to: string;
  text: string;
  icon: any; // FontAwesomeIcon accepts any valid icon
  isMobile: boolean;
}

// Individual Navigation Item
function NavItem({ to, text, icon, isMobile }: NavItemProps) {
  return (
    <Link to={to} className={`flex ${isMobile ? 'flex-col' : ''} items-center text-center px-4`}>
      {isMobile ? (
        <FontAwesomeIcon icon={icon} size="2x" /> // Show icons only on mobile
      ) : (
        <span className="text-sm font-bold uppercase font-prompt text-18px menudesk">{text}</span> // Show text only on desktop
      )}
    </Link>
  );
}

// Home Page
function Home() {
  return (
    <>
      {/* Logo with animation */}
      <div className="flex justify-center items-center h-full header">
        <img src={logoswap} alt="Logo" className="logo-animation" />
      </div>
      
      {/* Subtitle with slight delay in animation */}
      <div className="flex justify-center items-center h-full header subtitle subtitle-animation">
        Unlock a new world of onchain communities.<br />Become an onchain patron.
      </div>

      <TipComponent />
      <HowItWorks />
      <Roadmap />
      <FaqSection />
    </>
  );
}

// Rank Page (Placeholder for Rank Page)
function Rank() {
  return (
    <section className="my-12">
      <h2 className="text-3xl font-bold text-center mb-8">Rank</h2>
      <p>Check the top ranks of contributors here.</p>
    </section>
  );
}

// Profile Page (Example of additional route)
function Profile() {
  return (
    <section className="my-12">
      <h2 className="text-3xl font-bold text-center mb-8">Feature will be available on mainnet</h2>
    </section>
  );
}

// 4. Footer
function Footer() {
  return (
    <footer className="text-white text-center footer">
      <p>© 2024 Onchain Vision Community | $VISION is a Community Take Over (CTO) token on Base and it's affiliate with Coinbase<br/>$VISION PATRON v01.00 - Proudly ❤ build on <a href="https://www.base.org/" target="_blank">Base</a> by <a href="https://warpcast.com/pongl" target="_blank">Chris Pongl</a></p>
    </footer>

  );
}
