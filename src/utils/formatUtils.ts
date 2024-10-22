export const formatWalletAddress = (wallet: string): string => {
  return wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "";
};
