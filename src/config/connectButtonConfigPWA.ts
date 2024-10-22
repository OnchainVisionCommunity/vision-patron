import { createThirdwebClient } from "thirdweb";
import { base, baseSepolia } from "thirdweb/chains";
import { createWallet, inAppWallet } from "thirdweb/wallets";

// Create the Thirdweb client with API Key
const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});

// Define the supported tokens for the Base chain (VISION token added)
const supportedTokens = {
  ["8453"]: [
    {
      address: "0x07609D76e2E098766AD4e2b70B84f05b215d380a",
      name: "VISION",
      symbol: "VISION",
      icon: "https://patron.visioncommunity.xyz/img/cur/vision.png",
    },
    // You can add other tokens here if needed
  ],
};

// ConnectButton configuration
export const connectButtonConfig = {
  client: thirdwebClient,
  chain: base,
  autoConnect: { timeout: 10000 }, // Auto-connect configuration
  theme: "dark" as "dark",
  appMetadata: {
    name: "Vision Patron",
    url: "https://patron.visioncommunity.xyz",
    description: "Be onchain",
    logoUrl: "https://patron.visioncommunity.xyz/img/cur/vision.png",
  },
  connectModal: {
    size: "compact" as "compact",
  },
  switchButton: {
    label: "Wrong Network",
    style: { backgroundColor: "red" },
  },
  detailsButton: {
    style: { borderRadius: "10px" }, // Style customization for the details button
  },
  walletConnect: {
    //projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  },
  smartWallet: {
    factoryAddress: process.env.NEXT_PUBLIC_SMART_WALLET_FACTORY_ADDRESS || "", // Smart Wallet factory address from env
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "", // Client ID from env for smart wallets
  },
  wallets: [
    inAppWallet(),
    createWallet("com.coinbase.wallet"),
  ],
  supportedTokens: supportedTokens,
};
