import { useState, useEffect } from "react";
import { getContract, prepareContractCall, sendTransaction } from 'thirdweb';
import { useSendTransaction } from "thirdweb/react"
import { useActiveAccount } from "thirdweb/react";
import { resolveL2Name, resolveAddress, BASENAME_RESOLVER_ADDRESS } from "thirdweb/extensions/ens";
import Lottie from "lottie-react";
import confettiAnimation from "../assets/lootie/confetti.json";
import { useSearchParams } from "react-router-dom";
import { BigNumber, ethers } from "ethers";
import { createThirdwebClient, waitForReceipt } from "thirdweb";
import { approve } from "thirdweb/extensions/erc20";
import { Modal, Box, Button } from "@mui/material";
import { getTokens } from '@coinbase/onchainkit/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faTrophy, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useUserStatus } from '../context/UserStatusContext';
import { faChevronUp, faGear } from '@fortawesome/free-solid-svg-icons';
import { getBuyWithFiatQuote, getBuyWithFiatStatus, isSwapRequiredPostOnramp } from "thirdweb/pay";

import { 
  Swap, 
  SwapAmountInput, 
  SwapToggleButton, 
  SwapButton, 
  SwapMessage, 
  SwapToast, 
} from '@coinbase/onchainkit/swap'; 
import type { Token } from '@coinbase/onchainkit/token';
import { TokenImage } from '@coinbase/onchainkit/token';


//MAINET
import erc20ABI from '../abis/erc20ABI.json';
import patronABI from '../abis/patron.json';
import { base } from "thirdweb/chains";

//TESTNET
//import erc20ABI from '../abis/erc20_testnet.json';
//import patronABI from '../abis/patron_testnet.json';
//import { baseSepolia as base } from "thirdweb/chains";


import logoswap from '../assets/images/logo-onbase-v02.png';

import Select from 'react-select';





const fetchReputation = async (userWallet, communityWallet = null) => {
  let apiUrl = `https://api.visioncommunity.xyz/v02/reputation/get?user=${userWallet}`;

  // Add community wallet if available
  if (communityWallet) {
    apiUrl += `&community=${communityWallet}`;
  }

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    } else {
      console.error("Error fetching reputation:", data.error);
    }
  } catch (error) {
    console.error("API Fetch Error:", error);
  }
};






// Function to normalize reputation
const normalizeReputation = (reputation, maxReputation = 100) => {
  return (reputation / maxReputation) * 100;
};

// Function to calculate tier based on normalized reputation
const calculateTier = (normalizedReputation) => {
  if (normalizedReputation >= 75) return 5;
  if (normalizedReputation >= 60) return 4;
  if (normalizedReputation >= 45) return 3;
  if (normalizedReputation >= 30) return 2;
  return 1;
};

// Function to calculate energy based on community tier
const calculateEnergy = (pooledAmount, communityTier) => {
  const multiplier = {
    5: 2.0,
    4: 1.75,
    3: 1.5,
    2: 1.25,
    1: 1.0,
  }[communityTier];
  
  
  return pooledAmount * multiplier;
};

const calculateReputation = (pooledAmount, userTier) => {
  const multiplier = {
    5: 1.0,
    4: 0.75,
    3: 0.5,
    2: 0.25,
    1: 0.1,
  }[userTier];
  
  
  return pooledAmount * multiplier;
};



  
export default function TipComponent() {
	const [currency, setCurrency] = useState("VISION");
  const [searchParams] = useSearchParams();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [donationPercentage, setDonationPercentage] = useState(10);
  const [burnPercentage, setBurnPercentage] = useState(2);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusMessageInput, setStatusMessageInput] = useState("");
  const [recipientType, setRecipientType] = useState("wallet");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isInputValid, setIsInputValid] = useState(true);
  const [basenameAddress, setBasenameAddress] = useState("");
  const [userBasename, setUserBasename] = useState("");
  const account = useActiveAccount();
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [nftImage, setNftImage] = useState("");
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [resolvedRecipient, setResolvedRecipient] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [swappedAmount, setSwappedAmount] = useState(0);
  const [isSwapComplete, setIsSwapComplete] = useState(false);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
const [isRecipientEmpty, setIsRecipientEmpty] = useState(true);
const [customToken, setCustomToken] = useState<Token | null>(null);
const [inputCustomCurrencyValue, setInputCustomCurrencyValue] = useState("");
const [serviceFeePercentage, setServiceFeePercentage] = useState(2);
const [showReputation, setShowReputation] = useState(true);
  const [energy, setEnergy] = useState(0.0);
  const [reputation, setReputation] = useState(0.0);
  const [userReputation, setUserReputation] = useState(0);          // State for user's normalized reputation
const [communityReputation, setCommunityReputation] = useState(0); // State for community's normalized reputation
const { updateEnergy, updateReputation } = useUserStatus(); 
const [paymentMethod, setPaymentMethod] = useState("crypto");
const [fiatAmount, setFiatAmount] = useState("");


const transferAndMintContractAddress = process.env.NEXT_PUBLIC_TRANSFER_AND_MINT_CONTRACT!;
const erc20ContractAddress = process.env.NEXT_PUBLIC_VISION_TOKEN_CONTRACT!;

const currencyOptions = [
  { value: 'VISION', label: 'VISION', icon: 'https://patron.visioncommunity.xyz/img/cur/vision.png' },
  { value: 'ETH', label: 'Ethereum', icon: 'https://patron.visioncommunity.xyz/img/cur/ethereum.png' },
  { value: 'USDC', label: 'USDC', icon: 'https://patron.visioncommunity.xyz/img/cur/usdc.png' },
  { value: 'cbBTC', label: 'cbBTC', icon: 'https://patron.visioncommunity.xyz/img/cur/cbbtc.png' },
  { value: 'custom', label: 'Custom Token', icon: 'https://patron.visioncommunity.xyz/img/cur/other.png' }, 
];

  // Token list for Coinbase swap
  const visionToken: Token = {
    address: erc20ContractAddress,
    chainId: 8453,
    decimals: 18,
    name: "VISION",
    symbol: "VISION",
    image: "https://patron.visioncommunity.xyz/img/cur/vision.png",
  };

  const ethToken: Token = {
    address: "",
    chainId: 8453,
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
    image: "https://patron.visioncommunity.xyz/img/cur/ethereum.png",
  };

  const usdcToken: Token = {
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    chainId: 8453,
    decimals: 6,
    name: "USDC",
    symbol: "USDC",
    image: "https://patron.visioncommunity.xyz/img/cur/usdc.png",
  };
  
  const btcToken: Token = {
    address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    chainId: 8453,
    decimals: 18,
    name: "cbBTC",
    symbol: "cbBTC",
    image: "https://patron.visioncommunity.xyz/img/cur/cbbtc.png",
  };
  
  const swappableTokens: Token[] = [visionToken, ethToken, usdcToken, btcToken];

  
// Token search handler
const handleTokenSearch = async (searchValue) => {
  if (!searchValue) return;

  try {
    const tokens = await getTokens({
      limit: '1',
      search: searchValue, // You can search by name, symbol, or address
    });

    if (tokens.length > 0) {
      const foundToken = tokens[0];
      setCustomToken(foundToken); // Update state to store the found token
    } else {
      console.log('No token found');
    }
  } catch (error) {
    console.error('Error fetching tokens:', error);
  }
};


// Function to display custom icons
const formatOptionLabel = ({ value, label, icon }) => (
  <div className="flex items-center">
    {icon && (
      <img
        src={icon}
        alt={label}
        style={{
          width: 30,
          height: 30,
          borderRadius: '.375rem', // Makes the icon a circle
          marginRight: 10,
        }}
      />
    )}
    <span>{label}</span>
  </div>
);
  // Initialize the thirdweb client
  const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  });
  
// Initialize contracts ABI
const transferAndMintContract = getContract({
  client,
  chain: base, // Use the correct chain (Base in this case)
  address: transferAndMintContractAddress,
  abi: patronABI,
});

const erc20Contract = getContract({
  client,
  chain: base,
  address: erc20ContractAddress,
  abi: erc20ABI,
});

  // Fetch Basename of the connected wallet
  const fetchUserBasename = async () => {
    if (account?.address) { // Use account.address from SDK v5
      try {
        const basename = await resolveL2Name({
          client,
          address: account.address, // Use account.address here
          resolverAddress: BASENAME_RESOLVER_ADDRESS,
          resolverChain: base,
        });

        // If the wallet has a basename, set it
        if (basename && basename !== "") {
          setUserBasename(basename);
        } else {
          setUserBasename(""); // No basename found
        }
      } catch (error) {
        console.error("Error fetching Basename:", error);
        setUserBasename(""); // In case of an error, fallback to empty basename
      }
    }
  };

  useEffect(() => {
    if (account?.address) {
      fetchUserBasename();
    }

    const urlRecipient = searchParams.get("recipient");
    const urlRecipientType = searchParams.get("type");

    if (urlRecipient) {
      setRecipient(urlRecipient);
    }
    if (urlRecipientType === "wallet" || urlRecipientType === "basename") {
      setRecipientType(urlRecipientType);
    }
  }, [account, searchParams]);

const validateInput = () => {
  if (recipientType === "wallet") {
    if (ethers.utils.isAddress(recipient)) {
      setIsInputValid(true); // Mark input as valid
      setStatusMessageInput(""); // Clear the error message
    } else {
      setIsInputValid(false); // Mark input as invalid
      setStatusMessageInput("Invalid Ethereum address");
    }
  } else if (recipientType === "basename") {
    const basenameRegex = /^[a-zA-Z0-9.]+$/;
    if (basenameRegex.test(recipient)) {
      setIsInputValid(true); // Mark input as valid
      setStatusMessageInput(""); // Clear the error message
    } else {
      setIsInputValid(false); // Mark input as invalid
      setStatusMessageInput("Invalid Basename");
    }
  }
};

  const resolveBasename = async () => {
    setStatusMessageInput("Resolving Basename...");
    try {
      const address = await resolveAddress({
        client, // Initialized thirdweb client
        name: recipient,
        resolverAddress: BASENAME_RESOLVER_ADDRESS,
        resolverChain: base,
      });

      if (address === "0x0000000000000000000000000000000000000000") {
        setIsInputValid(false);
        setStatusMessageInput("Invalid Basename: Not available.");
      } else {
        setBasenameAddress(address);
        setIsInputValid(true);
        setStatusMessageInput(``);
        setResolvedRecipient(address);
      }
    } catch (error) {
      setIsInputValid(false);
      setStatusMessageInput("Failed to resolve Basename.");
      console.error("Error resolving Basename:", error);
    }
  };













const handleSwapAndTip = async (sellToken, swappedVisionAmount) => {
  try {
    setStatusMessage(`Swapping ${sellToken.symbol} for VISION...`);

    const amountInFloat = parseFloat(swappedVisionAmount); // Convert to float for easier calculations

    // Call handleApprovalAndTip with the swapped amount
    await handleApprovalAndTip(amountInFloat, recipient); // Use swapped amount

    setStatusMessage(`You successfully swapped ${sellToken.symbol} and sent ${swappedVisionAmount} VISION.`);
  } catch (error) {
    console.error("Error in handleSwapAndTip:", error);
    setStatusMessage("An error occurred during the swap and tip process.");
  }
};






const handleFiatPayment = async () => {
  try {
    setStatusMessage("Getting fiat payment quote...");

    // Ensure wallet is connected
    if (!account || !account.address) {
      setStatusMessage("Please connect your wallet.");
      return;
    }

    // Check if fiatAmount is provided and meets minimum requirement
    if (!fiatAmount || parseFloat(fiatAmount) < 1.00) {
      setStatusMessage("Please enter an amount of at least $1.00.");
      return;
    }

    // Create a Thirdweb client
    const client = createThirdwebClient({
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    });

    // Get a quote for buying VISION with a specified USD amount
    const quote = await getBuyWithFiatQuote({
      client,
      fromCurrencySymbol: "USD", // Specify the fiat currency (e.g., USD)
      fromAmount: fiatAmount, // Amount of fiat currency to spend (in USD)
      toChainId: base.id, // Base chain ID
      toTokenAddress: process.env.NEXT_PUBLIC_VISION_TOKEN_CONTRACT, // Destination token address
      toAddress: account.address, // User's wallet address
    });

    if (!quote) {
      setStatusMessage("Failed to get a fiat payment quote.");
      return;
    }

    // Open the onramp experience in a new window
    window.open(quote.onRampLink, "_blank");

    setStatusMessage("Fiat payment process started. Please complete the payment in the new window.");

    // Poll for transaction status
    pollFiatTransactionStatus(client, quote.intentId);
  } catch (error) {
    console.error("Error in handleFiatPayment:", error);
    if (error?.data?.minimumAmountUSDCents) {
      setStatusMessage(`Minimum Amount (USD): $${error.data.minimumAmountUSDCents / 100}`);
    } else {
      setStatusMessage("An error occurred while processing the fiat payment.");
    }
  }
};




const pollFiatTransactionStatus = async (client, intentId) => {
  try {
    setStatusMessage("Checking transaction status...");

    const interval = setInterval(async () => {
      const fiatStatus = await getBuyWithFiatStatus({
        client: client,
        intentId: intentId,
      });

      if (fiatStatus.status === "ON_RAMP_TRANSFER_COMPLETED") {
        clearInterval(interval);
        setStatusMessage("Fiat payment completed successfully!");
      } else if (fiatStatus.status === "ON_RAMP_TRANSFER_FAILED") {
        clearInterval(interval);
        setStatusMessage("Fiat payment failed. Please try again.");
      } else {
        setStatusMessage("Fiat payment is in progress. Please wait...");
      }
    }, 5000); // Poll every 5 seconds
  } catch (error) {
    console.error("Error in pollFiatTransactionStatus:", error);
    setStatusMessage("An error occurred while checking the fiat payment status.");
  }
};












const handleApprovalAndTip = async (amountInFloat, recipientAddress) => {
  // Helper to introduce a delay (used for retry mechanism)
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const maxRetries = 3; // Max retries for transaction in case of 429 errors

  // Retry logic for transactions with exponential backoff
  const sendTransactionWithRetry = async (transactionFunc, retryCount = maxRetries) => {
    try {
      return await transactionFunc();
    } catch (err) {
      // Handle 429 error and retry with delay
      if (retryCount > 0 && err.message.includes("Non-200 status code: '429'")) {
        const attemptNumber = maxRetries - retryCount + 1;
        console.warn(`Rate limit hit, retrying... (${attemptNumber}/${maxRetries})`);
        await delay(2000 * attemptNumber); // Exponential backoff
        return sendTransactionWithRetry(transactionFunc, retryCount - 1);
      }
      throw err; // If not 429 or retries are exhausted, throw error
    }
  };

  try {
    setStatusMessage(""); // Reset status message

    // Ensure wallet is connected
    if (!account || !account.address) {
      setStatusMessage("Please connect your wallet.");
      return;
    }

    const userAddress = account.address;

    // Validate recipient and amount input
    if (!recipientAddress || !amountInFloat || !isInputValid) {
      setStatusMessage("Please enter a valid recipient and amount.");
      return;
    }

    let finalResolvedRecipient = recipientAddress;

    // If recipient type is "basename," resolve the basename to an address
    if (recipientType === "basename") {
      setStatusMessage("Resolving Basename...");
      try {
        const resolvedAddress = await resolveAddress({
          client,
          name: recipientAddress,
          resolverAddress: BASENAME_RESOLVER_ADDRESS,
          resolverChain: base,
        });

        if (resolvedAddress === "0x0000000000000000000000000000000000000000") {
          setIsInputValid(false);
          setStatusMessage("Invalid Basename: Not available.");
          return;
        }

        finalResolvedRecipient = resolvedAddress;
        setResolvedRecipient(resolvedAddress); // Set globally
        setStatusMessage(``);
      } catch (error) {
        setStatusMessage("Failed to resolve Basename.");
        return;
      }
    } else {
      // Set resolved recipient as the original recipient address
      setResolvedRecipient(finalResolvedRecipient); // Set globally
    }

    // Convert the amount to Wei correctly (no rounding, using full amount as intended)
    const amountInWei = ethers.utils.parseUnits(amountInFloat.toString(), 18); // Use full precision for ERC20 amounts

    // Step 1: Approve tokens (ERC20)
    const erc20Contract = getContract({
      client,
      chain: base,
      address: erc20ContractAddress,
      abi: erc20ABI,
    });

    setStatusMessage("Approving tokens for transfer...");

    // Using the retry logic for the approval transaction
    const approvalTransaction = await sendTransactionWithRetry(async () => {
      const approvalTx = await prepareContractCall({
        contract: erc20Contract,
        method: "approve",
        params: [transferAndMintContractAddress, amountInWei.toString()],
      });
      return await sendTransaction({
        account,
        transaction: approvalTx,
      });
    });

    // Explicitly wait for the transaction receipt to ensure state has been updated
    const approvalReceipt = await waitForReceipt({
      client,
      chain: base,
      transactionHash: approvalTransaction.transactionHash,
    });

    if (approvalReceipt.status === "success") {
      setStatusMessage("Approval successful. Patronizing community...");
    } else {
      throw new Error("Approval transaction failed.");
    }

    // Step 2: Prepare and send tip transaction with retry logic
    const transferAndMintContract = getContract({
      client,
      chain: base,
      address: transferAndMintContractAddress,
      abi: patronABI, // Your TransferAndMint contract ABI
    });

    const tipTransaction = await sendTransactionWithRetry(async () => {
      const tipTx = await prepareContractCall({
        contract: transferAndMintContract,
        method: "transferAndMint",
        params: [finalResolvedRecipient, amountInWei.toString(), burnPercentage, donationPercentage],
      });
      return await sendTransaction({
        account,
        transaction: tipTx,
      });
    });

    // Step 3: Wait for transaction receipt to get logs
    const receipt = await waitForReceipt({
      client,
      chain: base,
      transactionHash: tipTransaction.transactionHash,
    });

// Look for logs involving your smart contract's address or a specific event
const relevantLog = receipt.logs.find(
  (log) => log.address.toLowerCase() === transferAndMintContract.address.toLowerCase() &&
           log.topics[0] === "0x4cc0a9c4a99ddc700de1af2c9f916a7cbfdb71f14801ccff94061ad1ef8a8040" // NFTMinted event hash
);

// Use the transaction hash from the relevant log if found
const correctTransactionHash = relevantLog ? relevantLog.transactionHash : tipTransaction.transactionHash;

// Generate the link using the correct hash
const transactionLink = `https://basescan.org/tx/${correctTransactionHash}`;

    // Step 4: Extract NFTMinted event from logs and subtract 1 from token ID
    const nftMintedEvent = receipt.logs.find(
      (log) => log.topics[0] === "0x4cc0a9c4a99ddc700de1af2c9f916a7cbfdb71f14801ccff94061ad1ef8a8040" // NFTMinted event hash
    );

    if (nftMintedEvent) {
      const tokenId = parseInt(nftMintedEvent.topics[2], 16);

      const nftLink = `https://basescan.org/token/${transferAndMintContract.address}?a=${tokenId}`;

      const tipAmount = Number(amountInFloat) - (Number(amountInFloat) * (burnPercentage + donationPercentage)) / 100;
      const tipInFloat = parseFloat(tipAmount.toFixed(18)); // Float values for backend
      const burnInFloat = parseFloat(((Number(amountInFloat) * burnPercentage) / 100).toFixed(18));
      const donatedInFloat = parseFloat(((Number(amountInFloat) * donationPercentage) / 100).toFixed(18));

      setStatusMessage(
        `You successfully patron ${amountInFloat} $VISION to ${recipientAddress} (${burnPercentage}% burnt${
          donationPercentage > 0 ? ` + ${donationPercentage}% donated` : ""
        })`
      );

      // Step 5: Send POST request to backend
      const response = await fetch(
        "https://api.visioncommunity.xyz/testnet/nftpatron/mint",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiver_wallet: finalResolvedRecipient,
            receiver_basename: recipientType === "basename" ? recipient : "",
            sender_wallet: userAddress, // Use userAddress here
            sender_basename: userBasename || "",
            nft_id: tokenId,
            amount: amountInFloat,
            tip: tipInFloat,
            burn: burnInFloat,
            donated: donatedInFloat,
          }),
        }
      );
      const responseData = await response.json(); // Parse the response

      // After receiving the response from the backend
      if (response.ok && responseData.success) {
        const { energy_awarded } = responseData; // Only energy for the user

        // Update the floating menu's energy (no need to update reputation for user)
        updateEnergy(energy_awarded);
      }

      // Step 6: Load the NFT Image
      setIsImageLoading(true);

      setTimeout(() => {
        const imageUrl = `https://api.visioncommunity.xyz/v02/v02/nft/images/${tokenId}.jpg`;

        // Attempt to load the image
        fetch(imageUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Image not found or server error: ${response.status}`);
            }
            return response.blob(); // Image successfully fetched
          })
          .then(() => {
            // If image loads successfully
            setNftImage(imageUrl);
            setTokenId(tokenId);
            setIsImageLoading(false);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
            setOpen(true);
          })
          .catch((error) => {
            // Log any errors that occur during image loading
            console.error(`Failed to load image for tokenId: ${tokenId}. Error: ${error.message}`);
            setIsImageLoading(false); // Stop loader if image fails to load
          });
      }, 1000);
      setIsTransactionInProgress(false);

      if (response.ok) {
        
      } else {
        console.error("Failed to send data to the server.");
      }
    } else {
      console.error("NFTMinted event not found in logs.");
    }
  } catch (err) {
    // Catch popup blocker error or any other transaction errors
  if (err.message.includes("user denied transaction") || err.message.includes("popup blocked")) {
    setStatusMessage(
      "Transaction failed. It looks like a popup blocker prevented the transaction. Please disable your popup blocker and try again."
    );
  } else if (err.message.includes("popup blocked") || err.message.includes("Pop up window failed to open")) {
    // Handle the specific "Pop up window failed to open" error
    setStatusMessage(
      "Transaction failed because the popup window could not open. Please ensure that pop-ups are allowed in your browser settings and try again. No tokens have been moved from your wallet."
    );
  } else {
    // Log other errors and notify the user
    console.error("Error in handleApprovalAndTip:", err);
    setStatusMessage(
      "An error occurred during the process. No tokens were moved from your wallet. Please try again later."
    );
  }
  }
};







  























const calculateDistribution = (tipAmount: number) => {
    const serviceFeeAmount = (tipAmount * serviceFeePercentage) / 100;
    const remainingAmount = tipAmount - serviceFeeAmount;

    const donationAmount = (remainingAmount * donationPercentage) / 100;
    const burnAmount = (remainingAmount * burnPercentage) / 100;
    const finalTipAmount = remainingAmount - donationAmount - burnAmount;

    return { serviceFeeAmount, donationAmount, burnAmount, finalTipAmount };
};


  const distribution = calculateDistribution(Number(amount) || 0);



const [visionValue, setVisionValue] = useState("");
const [isNonVision, setIsNonVision] = useState(false);

useEffect(() => {
  const interval = setInterval(() => {
    const inputElements = document.querySelectorAll('input[data-testid="ockTextInput_Input"]');
    
    if (inputElements && inputElements.length > 1) {
      const correctInputElement = inputElements[1]; // Selects the second input element
      setVisionValue(correctInputElement.value); // Update the state with the second input's value
    }
  }, 500); // Check every 500ms

  return () => clearInterval(interval); // Clean up on unmount
}, []);



const [sellAmount, setSellAmount] = useState("");
const [buyAmount, setBuyAmount] = useState("");

// Function to reset the swap inputs when the currency changes
const handleCurrencyChange = (selectedOption) => {
  setCurrency(selectedOption.value);

  // Query the DOM for input fields within the Swap component
  const inputElements = document.querySelectorAll('input[data-testid="ockTextInput_Input"]');
  
  if (inputElements.length > 0) {
    inputElements.forEach((input) => {
      input.value = ""; // Reset the input fields
    });
  }

  // Optionally reset your state tracking the values
  setSellAmount(""); 
  setBuyAmount(""); 
};











  const [swapMessage, setSwapMessage] = useState('');
  const [receivedAmount, setReceivedAmount] = useState(null);
  const [swappedVisionAmount, setSwappedVisionAmount] = useState(0);
  const [isSwapProcessing, setIsSwapProcessing] = useState(false);

  // Define your token ABI to decode Transfer event
  const tokenABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ];

// Function to handle approval and tipping with the swapped amount of VISION
const handleApprovalAndTipWithSwappedAmount = async (visionAmount, finalResolvedRecipient) => {
  if (visionAmount > 0 && finalResolvedRecipient) {
    
    await handleApprovalAndTip(visionAmount, finalResolvedRecipient); // Call the original function with the correct values
  } else {
    console.error("No VISION amount or recipient found.");
    setStatusMessage("Please enter a valid recipient and amount.");
  }
};


// Swap success handler
const handleSwapSuccess = (transactionReceipt) => {
  // Check if swap process is already running
  if (isSwapProcessing) return;

  setStatusMessage("Swap process started...");


  if (!account?.address) {
    setSwapMessage('Wallet not connected');
    setStatusMessage("Wallet not connected. Please connect your wallet.");
    return;
  }

  // Extract logs and decode relevant information
  const logs = transactionReceipt?.logs;

  // Use connected wallet's address dynamically (account?.address)
  const transferLog = logs.find(log => 
    log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' &&
    log.topics[2].toLowerCase() === '0x000000000000000000000000' + account.address.slice(2).toLowerCase() // Connected wallet address
  );

  if (transferLog) {
    const iface = new ethers.utils.Interface(tokenABI);

    // Decode the log using the token ABI
    const parsedLog = iface.parseLog(transferLog);

    // Extract the amount received (in raw units)
    const rawAmount = parsedLog.args.value;

    // Convert the raw amount (assumes 18 decimals for VISION)
    let amountReceived = ethers.utils.formatUnits(rawAmount, 18); // 18 decimals

    // **Round down to nearest integer**
    const roundedAmountReceived = Math.floor(parseFloat(amountReceived));

    // Calculate donation and burn amounts as in the direct VISION transfer
    const burnAmount = (roundedAmountReceived * burnPercentage) / 100;
    const donationAmount = (roundedAmountReceived * donationPercentage) / 100;
    const finalTipAmount = roundedAmountReceived - burnAmount - donationAmount;

    // Set success message and received amount
    setSwapMessage('Swap successful!');
    setReceivedAmount(roundedAmountReceived.toString()); // Use rounded integer value

    // Call the handleApprovalAndTip function with the swapped amount and the recipient
    if (recipient && roundedAmountReceived) {

      // Prevent double trigger by setting a swap processing flag
      setIsSwapProcessing(true);

      // **Skip Approval by passing true for skipApproval parameter**
handleApprovalAndTip(roundedAmountReceived, recipient)
  .then(() => {
    setStatusMessage(
      `You successfully sent ${roundedAmountReceived} $VISION to ${recipient} (${burnPercentage}% burnt + ${donationPercentage}% donated).`
    );
  })
  .catch((error) => {
    console.error("Error in handleApprovalAndTip after swap:", error);
    setStatusMessage("An error occurred while sending the tip.");
  })
  .finally(() => setIsSwapProcessing(false));
    } else {
      console.error('No VISION amount or recipient found.');
      setSwapMessage('No VISION amount or recipient found.');
      setStatusMessage('No VISION amount or recipient found.');
    }
  } else {
    setSwapMessage('Transfer event not found for this wallet.');
    setStatusMessage('Transfer event not found for this wallet.');
  }
};















// Function to calculate tier based on normalized reputation
const calculateTier = (normalizedReputation) => {
  if (normalizedReputation >= 75) return 5;
  if (normalizedReputation >= 60) return 4;
  if (normalizedReputation >= 45) return 3;
  if (normalizedReputation >= 30) return 2;
  return 1;
};

// Function to get multiplier based on tier
const getTierMultiplier = (tier) => {
  switch (tier) {
    case 5:
      return 2.0;
    case 4:
      return 1.75;
    case 3:
      return 1.5;
    case 2:
      return 1.25;
    default:
      return 1.0;
  }
};

// Function to calculate energy based on community's normalized reputation and tier
const calculateEnergy = (pooledAmount, communityMultiplier) => {
  return pooledAmount * communityMultiplier;
};

// Function to calculate reputation based on user tier multiplier
const calculateReputation = (pooledAmount, userMultiplier) => {
  return pooledAmount * userMultiplier;
};

 // OnBlur handler to trigger API call based on recipientType (wallet or basename)
const handleBlur = async () => {
  if (recipientType === "wallet") {
    if (ethers.utils.isAddress(recipient)) {
      setIsInputValid(true);

      // Fetch reputation for connected wallet (user) and recipient wallet (community)
      const reputationData = await fetchReputation(account?.address, recipient); 

      if (reputationData) {
        // Use the normalized reputation directly from the API response
        setUserReputation(reputationData.user.normalized_reputation);
        setCommunityReputation(reputationData.community.normalized_reputation);
      }
    } else {
      setIsInputValid(false);
      setStatusMessageInput("Invalid Ethereum address");
    }
  } else if (recipientType === "basename") {
    try {
      setStatusMessageInput("Resolving Basename...");
      const resolvedAddress = await resolveAddress({
        client: createThirdwebClient({ clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID }),
        name: recipient,
        resolverAddress: BASENAME_RESOLVER_ADDRESS,
        resolverChain: base,
      });

      if (resolvedAddress === "0x0000000000000000000000000000000000000000") {
        setIsInputValid(false);
        setStatusMessageInput("Basename could not be resolved.");
      } else {
        setBasenameAddress(resolvedAddress);
        setIsInputValid(true);
        setStatusMessageInput(``);
        setResolvedRecipient(resolvedAddress);

        // Fetch reputation for connected wallet (user) and resolved address (community)
        const reputationData = await fetchReputation(account?.address, resolvedAddress);

        if (reputationData) {
          // Use the normalized reputation directly from the API response
          setUserReputation(reputationData.user.normalized_reputation);
          setCommunityReputation(reputationData.community.normalized_reputation);
        }
      }
    } catch (error) {
      setIsInputValid(false);
      setStatusMessageInput("Failed to resolve Basename.");
      console.error("Error resolving Basename:", error);
    }
  }
};


const communityTier = calculateTier(communityReputation); // Based on community reputation
const userTier = calculateTier(userReputation); // Based on user reputation

// Calculate the multipliers based on tiers
const communityMultiplier = getTierMultiplier(communityTier);
const userMultiplier = getTierMultiplier(userTier);



return (
  <div className="flex-grow p-4 container max-w-screen-lg mx-auto mt-16 flex justify-center tipcomponent">
    <div className="flex flex-col items-center space-y-4 patron">
     
      <div className="label spaceextra">
        Community basename or wallet
      </div>
<div className="flex items-center w-full" style={{ margin: 0 }}>
  <select
    className="p-2 border border-gray-400 rounded element tipcompinputlong custom-select mr-2 selectwalletbasename"
    style={{ flex: '0 0 30%', paddingRight: '0rem' }}
    value={recipientType}
    onChange={(e) => {
      setRecipientType(e.target.value);
      setRecipient("");
      setAmount("");
      setIsInputValid(true);
      setStatusMessage("");
    }}
  >
    <option value="wallet">Wallet</option>
    <option value="basename">Basename</option>
  </select>

  <input
    type="text"
    placeholder={recipientType === "wallet" ? "Recipient Wallet Address" : "Enter Basename"}
    className={`p-2 border ${isInputValid ? "border-gray-400" : "border-red-500"} rounded element tipcompinputlong flex-1 inputwalletbasename`}
    value={recipient}
    onChange={(e) => {
      setRecipient(e.target.value);
      setIsRecipientEmpty(e.target.value.trim() === "");
      validateInput();
    }}
    onBlur={() => {
      handleBlur();
      validateInput();
    }}
  />
</div>





<div className="label spaceextra">Choose Payment Method:</div>
<select
  className="p-2 border border-gray-400 rounded element tipcompinputlong custom-select mr-2 selectpaymentmethod"
  value={paymentMethod}
  onChange={(e) => setPaymentMethod(e.target.value)}
>
  <option value="crypto">Crypto</option>
  <option value="fiat">Fiat</option>
</select>





{statusMessageInput && <p className="smallmsginput">{statusMessageInput}</p>}

      <hr className="sep marginhrtopbottom" />


{paymentMethod === "crypto" ? (
  <div>
    {/* Currency Selection Dropdown */}
    <div className="label spaceextra">Select the currency/token:</div>
    <Select
      value={currencyOptions.find(option => option.value === currency)}
      options={currencyOptions}
      onChange={(selectedOption) => setCurrency(selectedOption.value)}
      formatOptionLabel={formatOptionLabel} // To display custom icons
      className="custom-select-dropdown tipcompinputlong selectcurrencyselect"
      classNamePrefix="react-select"
    />

    {currency === 'custom' && (
      <div className="relative w-full">
        {/* Input field with padding for the icon */}
        <input
          type="text"
          value={inputCustomCurrencyValue}
          placeholder="Enter Token Contract Address"
          className="p-2 pl-10 border border-gray-400 rounded element tipcompinputlongcust customtokeninput"
          onChange={(e) => {
            setInputCustomCurrencyValue(e.target.value);
            handleTokenSearch(e.target.value);
          }}
        />

        {/* Icon or Token Image inside the input */}
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 imagecust">
          {customToken ? (
            <TokenImage
              token={{
                image: customToken.image,
                name: customToken.name,
                symbol: customToken.symbol,
                address: customToken.address,
                decimals: customToken.decimals,
                chainId: customToken.chainId,
              }}
              size={28}
            />
          ) : (
            <img
              src="https://patron.visioncommunity.xyz/img/cur/other.png"
              alt="Default Icon"
            />
          )}
        </div>
      </div>
    )}

    {/* Show Swap Component if not VISION */}
    {currency !== "VISION" ? (
      <div>
        {account?.address ? (
          currency === 'custom' && customToken ? (
            <Swap
              className="containerswap"
              onSuccess={handleSwapSuccess}
              isSponsored
            >
              <SwapAmountInput
                label="Sell"
                swappableTokens={[customToken]} // Use the custom token here
                token={customToken} // Pass the custom token
                type="from"
                className="tokenswap"
              />
              <SwapAmountInput
                label="Buy"
                swappableTokens={[visionToken]}
                token={visionToken} // Always buying VISION
                type="to"
                className="visionswap"
              />
              <SwapButton className="element tipcompinputlong btnswap" />
              <SwapMessage />
              <SwapToast />
            </Swap>
          ) : (
            <Swap
              className="containerswap"
              onSuccess={handleSwapSuccess}
              isSponsored
            >
              <SwapAmountInput
                label="Sell"
                swappableTokens={swappableTokens}
                token={swappableTokens.find(t => t.symbol === currency)} // Handle predefined tokens like VISION, ETH, etc.
                type="from"
                className="tokenswap"
              />
              <SwapAmountInput
                label="Buy"
                swappableTokens={[visionToken]}
                token={visionToken} // Always buying VISION
                type="to"
                className="visionswap"
              />
              <SwapButton className="element tipcompinputlong btnswap" />
              <SwapMessage />
              <SwapToast />
            </Swap>
          )
        ) : (
          <div className="connwallcomp">Please connect your wallet<br/>To see swap the quotes</div>
        )}

        {!isTransactionInProgress && visionValue > 0 && (
          <div className="divswapinfo">
            <p>
              You will swap and patron<br />
              <span className="visionvalueswap">
                {currency !== "VISION"
                  ? `${visionValue ? Math.floor(parseFloat(visionValue)) : "0"} $VISION`
                  : `${Math.floor(amount || 0)} $VISION`}
              </span>
            </p>
          </div>
        )}

        {/* Advanced Options for Swap */}
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="mt-4 p-4 adv flex items-center justify-between w-full advoptswap"
        >
          <span className="advopttitle">Patron Advanced Options</span>
          <FontAwesomeIcon
            icon={showAdvancedOptions ? faChevronUp : faGear}
            className="ml-2"
            style={{ marginLeft: 'auto', fontSize: '20px' }}
          />
        </button>
        {showAdvancedOptions && (
          <div className="mt-4 p-4 advdiv">
            <div>
              <label>Pool (Min 0%, Max 45%):</label>
              <input
                type="number"
                min={0}
                max={45}
                value={donationPercentage}
                step={1}
                onChange={(e) => setDonationPercentage(Number(e.target.value))}
                className="p-2 border border-gray-400 rounded txtblack"
              />
            </div>
            <div>
              <label>Burn (Min 1%, Max 5%):</label>
              <input
                type="number"
                min={1}
                max={5}
                value={burnPercentage}
                step={1}
                onChange={(e) => setBurnPercentage(Number(e.target.value))}
                className="p-2 border border-gray-400 rounded txtblack"
              />
            </div>
            <div className="smalltextadvtip">The number of tokens added to the pool determines both the amount of energy you gain and the reputation earned by the community. Also is a key factor in determining max prizes in lotteries and games.</div>
          </div>
        )}
      </div>
    ) : (
      <div className="visiocomp">
        {/* Input in case of VISION is selected */}
        <input
          type="number"
          step="0.000000000000000001"
          placeholder="0.0"
          className="p-2 border border-gray-400 rounded element tipcompinputlong visioninput"
          value={amount}
          onChange={(e) => {
            const newAmount = e.target.value;
            setAmount(newAmount);
            const pooledAmount = (Number(newAmount) * donationPercentage) / 100;
            const communityTier = calculateTier(communityReputation);
            const userTier = calculateTier(userReputation);
            const communityMultiplier = getTierMultiplier(communityTier);
            const userMultiplier = getTierMultiplier(userTier);
            const newEnergy = calculateEnergy(pooledAmount, communityMultiplier);
            const newReputation = calculateReputation(pooledAmount, userMultiplier);
            setEnergy(newEnergy);
            setReputation(newReputation);
          }}
        />
        <button
          onClick={async () => {
            setIsTransactionInProgress(true); // Disable the button when the transaction starts
            try {
              await handleApprovalAndTip(amount, recipient); // Call the function for the transaction
            } finally {
              setIsTransactionInProgress(false); // Re-enable the button after the transaction is done
            }
          }}
          className="p-3 btnsend text-white rounded element tipcompinputlong noborderbtn"
          disabled={!account?.address || !amount || !recipient || isTransactionInProgress}
        >
          Patron Onchain
        </button>
      </div>
    )}
  </div>
) : (
  // New Pay with Fiat component for fiat payments
  <div className="fiat-payment-container">
    <div className="label spaceextra">Enter Amount:</div>
    <input
      type="number"
      step="0.01"
      placeholder="0.0"
      className="p-2 border border-gray-400 rounded element tipcompinputlong fiatinput"
      value={fiatAmount}
      onChange={(e) => setFiatAmount(e.target.value)}
    />
    <button
      className="p-3 btnsend text-white rounded element tipcompinputlong"
      onClick={handleFiatPayment}
      disabled={!fiatAmount || isTransactionInProgress} // Disable if no amount entered
    >
      Pay with Fiat
    </button>
  </div>
)}

{statusMessage && (
  <div className="mt-4 text-center status">
    <p dangerouslySetInnerHTML={{ __html: statusMessage }}></p>
  </div>
)}



      {showConfetti && (
        <Lottie animationData={confettiAnimation} loop={false} className="confetti-animation" />
      )}



<Modal
  open={open}
  onClose={handleClose}
  aria-labelledby="nft-modal-title"
  aria-describedby="nft-modal-description"
  sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
  BackdropProps={{
    style: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
  }}
>
  <Box
    sx={{
      position: 'relative',
      backgroundColor: '#fff',
      borderRadius: { xs: '0px', md: '10px' }, // No border-radius on mobile, 10px on desktop
      padding: '20px',
      outline: 'none',
      textAlign: 'center',
      maxWidth: { xs: '100%', md: '500px' }, // Full width on mobile, max 500px on desktop
      width: '100%',
      height: { xs: '100vh', md: 'auto' }, // Full height on mobile
      overflowY: 'auto', // Allow content to scroll if it exceeds viewport height
      zIndex: 999,
      top: { xs: 0, md: 'auto' }, // Content starts from the top on mobile
    }}
  >
  
        {/* NFT Image Display and Buttons */}
        <div className="modatitle">
        	<div className="modalmaintitle">You are a patron!</div>
        	<div className="modalmainsubtitle">Here is your NFT Shard! Start to engage with the community to increase your reputations to improve the power of your NFT 👀</div>
        </div>
        {nftImage ? (
<div className="nft-image">
  <img className="nft-image-display" src={nftImage} alt="NFT Image" />
  {showConfetti && (
    <Lottie animationData={confettiAnimation} loop={false} className="confetti-animation" />
  )}
  <div className="nft-buttons">
    {/* Replace contract address with environment variable */}
    <a
      href={`https://opensea.io/assets/base/${process.env.NEXT_PUBLIC_TRANSFER_AND_MINT_CONTRACT}/${tokenId}`}
      className="btn-opensea"
      target="_blank"
      rel="noopener noreferrer"
    >
      View on OpenSea
    </a>
    
    {/* Conditionally render the community link only if resolvedRecipient is available */}
    {resolvedRecipient && (
      <a
        href={`/communities/${resolvedRecipient}`}
        className="btn-community"
        target="_blank"
        rel="noopener noreferrer"
      >
        View Community
      </a>
    )}
  </div>
</div>
        ) : isImageLoading ? (
          <div className="spinner">Loading Image...</div>
        ) : (
          <div>No image to display</div>
        )}

        {/* Close Button */}
        <div className="modaclosenft">
        <Button
          className="btnpatronmecancel w100w"
          onClick={handleClose}
        >
          Close
        </Button>
        </div>
      </Box>
    </Modal>



<div style={{ width: '100%', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  {/* Energy Container - uses COMMUNITY reputation for tier */}
  <Box
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    sx={{
      backgroundColor: 'rgba(255, 99, 71, 0.1)', // Light red/orange background
      padding: '20px',
      borderRadius: '10px',
      color: '#ff6347', // Red/orange color
      textAlign: 'center',
      marginRight: showReputation ? '20px' : '0', // Add space if reputation is shown
      minWidth: '40%'
    }}
  >
    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
      You will win<br/>+ENERGY
    </div>
    <Box display="flex" alignItems="center">
      <FontAwesomeIcon icon={faFire} style={{ color: '#ff6347', fontSize: '24px' }} />
      <span style={{ marginLeft: '10px', fontSize: '20px' }}>
        {/* Dynamically update energy based on pooled amount */}
        {currency !== "VISION"
          ? ((visionValue * donationPercentage) / 100 * communityMultiplier).toFixed(1)
          : ((amount * donationPercentage) / 100 * communityMultiplier).toFixed(1)}
      </span>
    </Box>
  </Box>

  {/* Reputation Container - uses USER reputation for tier */}
  {showReputation && (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundColor: 'rgba(30, 144, 255, 0.1)', // Light blue background
        padding: '20px',
        borderRadius: '10px',
        color: '#1e90ff', // Blue color
        textAlign: 'center',
        minWidth: '40%',
      }}
    >
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
        Community will win<br/>+REPUTATION
      </div>
      <Box display="flex" alignItems="center">
        <FontAwesomeIcon icon={faTrophy} style={{ color: '#1e90ff', fontSize: '24px' }} />
        <span style={{ marginLeft: '10px', fontSize: '20px' }}>
          {/* Dynamically update reputation based on pooled amount */}
          {currency !== "VISION"
            ? ((visionValue * donationPercentage) / 100 * userMultiplier).toFixed(1)
            : ((amount * donationPercentage) / 100 * userMultiplier).toFixed(1)}
        </span>
      </Box>
    </Box>
  )}
</div>



<div className="transactionresume mt-4 p-4 text-left">
  
 
  {/* Use visionValue for non-VISION currency, or amount for VISION */}
  <p>
    Patron Amount: {currency !== "VISION" ? `${visionValue ? Math.floor(parseFloat(visionValue)) : "0"} $VISION` : `${Math.floor(amount || 0)} $VISION`}
  </p>
  <p>
    Service Fee (2%): {((amount * serviceFeePercentage) / 100).toFixed(2)} $VISION
  </p>
  {/* Donation and burn calculations */}
  <p>
    Pooled: {currency !== "VISION" 
      ? `${((visionValue * donationPercentage) / 100).toFixed(2)} $VISION` 
      : `${((amount * donationPercentage) / 100).toFixed(2)} $VISION`}
  </p>

  <p>
    Burn: {currency !== "VISION" 
      ? `${((visionValue * burnPercentage) / 100).toFixed(2)} $VISION` 
      : `${((amount * burnPercentage) / 100).toFixed(2)} $VISION`}
  </p>

  <p>
    Receiver: {currency !== "VISION" 
      ? `${(visionValue - (visionValue * donationPercentage) / 100 - (visionValue * burnPercentage) / 100).toFixed(2)} $VISION` 
      : `${(amount - (amount * donationPercentage) / 100 - (amount * burnPercentage) / 100).toFixed(2)} $VISION`}
  </p>
</div>



    </div>
  </div>
);



}