import { useState, useEffect } from "react";
import { ethers } from "ethers"; // for Ethereum address validation
import { useAddress, useContract, useContractWrite } from "@thirdweb-dev/react";
import { client } from "../client";
import { resolveL2Name, resolveAddress, BASENAME_RESOLVER_ADDRESS } from "thirdweb/extensions/ens"; // Import Basename resolver
import { base } from "thirdweb/chains"; // Import Base L2 chain
import Lottie from "lottie-react";
import confettiAnimation from "../assets/lootie/confetti.json";
import { useSearchParams } from "react-router-dom"; // Import to handle URL parameters

export default function TipComponent() {
  const [searchParams] = useSearchParams(); // Hook to get URL parameters
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [donationPercentage, setDonationPercentage] = useState(5); // Default donation percentage
  const [burnPercentage, setBurnPercentage] = useState(10); // Default burn percentage
  const [statusMessage, setStatusMessage] = useState(""); // State to store the notification message
  const [recipientType, setRecipientType] = useState("wallet"); // Track recipient type
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false); // Track advanced options visibility
  const [isInputValid, setIsInputValid] = useState(true); // Validate input
  const [basenameAddress, setBasenameAddress] = useState(""); // Store resolved Basename address
  const [userBasename, setUserBasename] = useState(""); // To store the basename for the connected wallet
  const userAddress = useAddress(); // Fetches the connected wallet address
  const [isImageLoading, setIsImageLoading] = useState(false); // For spinner
  const [nftImage, setNftImage] = useState(""); // Store NFT image URL
  const [tokenId, setTokenId] = useState<number | null>(null); // Store token ID for NFT
  const [resolvedRecipient, setResolvedRecipient] = useState("");
  const [showConfetti, setShowConfetti] = useState(false); // Control confetti

  const { contract: transferAndMintContract } = useContract("0xE8D2B6c63f74591dF9E91261E28a9292b7e91B8D");
  const { contract: erc20Contract } = useContract("0x07609D76e2E098766AD4e2b70B84f05b215d380a");
  const { mutate: sendTransaction, isLoading, error } = useContractWrite(transferAndMintContract, "transferAndMint");
  const { mutate: approveTokens, isLoading: isApproving } = useContractWrite(erc20Contract, "approve");

  // Fetch Basename of the connected wallet
  const fetchUserBasename = async () => {
    if (userAddress) {
      try {
        const basename = await resolveL2Name({
          client,
          address: userAddress,
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
    if (userAddress) {
      fetchUserBasename();
    }

    // Pre-fill recipient and recipientType based on URL parameters
    const urlRecipient = searchParams.get("recipient");
    const urlRecipientType = searchParams.get("type");

    if (urlRecipient) {
      setRecipient(urlRecipient);
    }
    if (urlRecipientType === "wallet" || urlRecipientType === "basename") {
      setRecipientType(urlRecipientType);
    }
  }, [userAddress, searchParams]);

  const validateInput = () => {
    if (recipientType === "wallet" || recipientType === "nftCollection") {
      if (ethers.utils.isAddress(recipient)) {
        setIsInputValid(true);
      } else {
        setIsInputValid(false);
        setStatusMessage("Invalid Ethereum address");
      }
    } else if (recipientType === "basename") {
      const basenameRegex = /^[a-zA-Z0-9.]+$/;
      if (basenameRegex.test(recipient)) {
        setIsInputValid(true);
      } else {
        setIsInputValid(false);
        setStatusMessage("Invalid Basename (only letters, numbers, and periods are allowed)");
      }
    }
  };

  const resolveBasename = async () => {
    setStatusMessage("Resolving Basename...");
    try {
      const address = await resolveAddress({
        client,
        name: recipient, // The Basename entered by the user
        resolverAddress: BASENAME_RESOLVER_ADDRESS,
        resolverChain: base,
      });

      // Check if the resolved address is the zero address
      if (address === "0x0000000000000000000000000000000000000000") {
        setIsInputValid(false); // Mark input as invalid
        setStatusMessage("Invalid Basename: Basename not minted or not available.");
      } else {
        setBasenameAddress(address); // Store the resolved address
        setIsInputValid(true); // Mark input as valid
        setStatusMessage(`Basename resolved! Address: ${address}`);
        setResolvedRecipient(address); // Set resolved recipient
      }
    } catch (error) {
      setIsInputValid(false); // Mark input as invalid in case of error
      setStatusMessage("Failed to resolve Basename. Please try again.");
      console.error("Error resolving Basename:", error);
    }
  };

  const handleApprovalAndTip = async () => {
    setStatusMessage(""); // Reset the message
    if (!recipient || !amount || !isInputValid) {
      setStatusMessage("Please enter valid recipient and amount.");
      return;
    }

    let finalResolvedRecipient = recipient; // Use a new variable to store the resolved recipient address
    let receiverBasename = ""; // For the backend, initialize empty

    if (recipientType === "basename") {
      setStatusMessage("Resolving Basename...");
      try {
        const address = await resolveAddress({
          client,
          name: recipient, // The Basename entered by the user
          resolverAddress: BASENAME_RESOLVER_ADDRESS,
          resolverChain: base,
        });

        // Check if the resolved address is the zero address (unresolved)
        if (address === "0x0000000000000000000000000000000000000000") {
          setIsInputValid(false); // Mark input as invalid
          setStatusMessage("Invalid Basename: Basename not minted or not available.");
          return; // Stop the process if the Basename is invalid
        } else {
          finalResolvedRecipient = address; // Use the resolved address for the transaction
          receiverBasename = recipient; // Set the Basename for the backend
          setIsInputValid(true); // Mark input as valid
          setStatusMessage(`Basename resolved! Address: ${address}`);
          setResolvedRecipient(address); // Update resolved recipient
        }
      } catch (error) {
        setIsInputValid(false); // Mark input as invalid in case of error
        setStatusMessage("Failed to resolve Basename. Please try again.");
        console.error("Error resolving Basename:", error);
        return; // Stop the process if resolution failed
      }
    }

    // Convert the amount to handle ERC20 decimals
    const amountInWei = BigInt(Number(amount) * 10 ** 18); // Convert to number before multiplying
    const amountInFloat = parseFloat(amount); // Convert to float for backend

    try {
      console.log("Approving tokens...");
      setStatusMessage("Approving tokens for transfer...");

      // Approve tokens for transfer
      if (transferAndMintContract) {
        await approveTokens(
          { args: [transferAndMintContract.getAddress(), amountInWei.toString()] }, // Approve VisionTransferAndNFT contract to spend the tokens
          {
            onSuccess: () => {
              console.log("Approval successful. Sending VISION...");
              setStatusMessage("Approval successful. Sending VISION...");

              // After approval, send the tip transaction
              sendTransaction(
                {
                  args: [
                    finalResolvedRecipient, // Use the resolved address
                    amountInWei.toString(),
                    burnPercentage,
                    donationPercentage,
                  ],
                },
                {
                  onSuccess: async (result) => {
                    const transactionHash = result.receipt.transactionHash;
                    const event = result.receipt?.logs?.find(
                      (log) =>
                        log.topics[0] ===
                        "0x4cc0a9c4a99ddc700de1af2c9f916a7cbfdb71f14801ccff94061ad1ef8a8040" // NFTMinted event
                    );

                    if (event) {
                      const tokenId = parseInt(event.topics[2], 16) - 1; // Adjust for zero-based index
                      setTokenId(tokenId); // Set the tokenId for future use
                      if (transferAndMintContract) {
                        const nftLink = `https://basescan.org/token/${transferAndMintContract.getAddress()}?a=${tokenId}`;
                      }
                      const transactionLink = `https://basescan.org/tx/${transactionHash}`;

                      const tipAmount = Number(amount) - (Number(amount) * (burnPercentage + donationPercentage)) / 100;
                      const tipInFloat = parseFloat(tipAmount.toFixed(18)); // For backend
                      const burnInFloat = parseFloat(((Number(amount) * burnPercentage) / 100).toFixed(18)); // For backend
                      const donatedInFloat = parseFloat(((Number(amount) * donationPercentage) / 100).toFixed(18)); // For backend

                      // Show the spinning loader while the image is loading
                      setIsImageLoading(true);

                      // Set a 2-second delay to simulate loading and show the NFT image
                      setTimeout(() => {
                        setNftImage(`https://api.visioncommunity.xyz/v02/nft/images/${tokenId}.jpg`);
                        setIsImageLoading(false);
                        setShowConfetti(true); // Trigger confetti when image loads
                        setTimeout(() => setShowConfetti(false), 4000); // Hide confetti after 4 seconds
                      }, 2000);

                      setStatusMessage(
                        `You successfully sent ${amountInFloat} $VISION to ${recipient} (${burnPercentage}% burnt${
                          donationPercentage > 0 ? ` + ${donationPercentage}% donated` : ""
                        }).<br/> 
                        <a href="${transactionLink}" target="_blank">See transaction on BaseScan</a>`
                      );

                      // Send POST request to the server
                      const response = await fetch(
                        "https://api.visioncommunity.xyz/testnet/nftpatron/mint",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            receiver_wallet: finalResolvedRecipient,
                            receiver_basename: recipientType === "basename" ? receiverBasename : "",
                            sender_wallet: userAddress,
                            sender_basename: userBasename || "", // Send the user's basename if available
                            nft_id: tokenId,
                            amount: amountInFloat, // Sending amount as float
                            tip: tipInFloat, // Sending tip as float
                            burn: burnInFloat, // Sending burn amount as float
                            donated: donatedInFloat, // Sending donation as float
                          }),
                        }
                      );

                      if (response.ok) {
                        console.log("Data successfully sent to the server.");
                      } else {
                        console.error("Failed to send data to the server.");
                      }
                    }
                  },

                  onError: (error) => {
                    console.error("Transaction error:", error);
                    setStatusMessage(
                      "Transaction failed. Check if you are connected to the correct network."
                    );
                  },
                }
              );
            },
            onError: (error) => {
              console.error("Approval error:", error);
              setStatusMessage("Token approval failed.");
            },
          }
        );
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setStatusMessage("Unexpected error occurred.");
    }
  };

  const calculateDistribution = (tipAmount: number) => {
    const donationAmount = (tipAmount * donationPercentage) / 100;
    const burnAmount = (tipAmount * burnPercentage) / 100;
    const finalTipAmount = tipAmount - donationAmount - burnAmount;
    return { donationAmount, burnAmount, finalTipAmount };
  };

  const distribution = calculateDistribution(Number(amount) || 0);

  return (
    <div className="flex-grow p-4 container max-w-screen-lg mx-auto mt-16">
    <div className="social">
    	<a href="https://t.me/onchainvisionbase" target="_blank"><img src="https://visioncommunity.xyz/wp-content/uploads/elementor/thumbs/telegram-white-quek8vsd5j6lacvah67hv6ug7r518xvpv2b7ux1ok0.png" /></a>
    	<a href="https://x.com/OCVCommunity" target="_blank"><img src="https://visioncommunity.xyz/wp-content/uploads/elementor/thumbs/x-white-quek98094u577czh74358uw3twjil0ivytcq9bkmww.png" /></a>
   	<a href="https://visioncommunity.xyz/" target="_blank"><img src="https://patron.visioncommunity.xyz/img/icons/www-white.png" /></a>
    </div>
      <div className="flex flex-col items-center space-y-4 patron">
        {userAddress && (
          <div className="welcomeuser">
            <hr className="sep" />
            <h3>Welcome, </h3>
            <h4>{userBasename ? userBasename : `${userAddress?.slice(0, 6)}...${userAddress?.slice(-4)}!`}</h4>
          </div>
        )}
        <hr className="sep" />
        <p className="label">Enter the basename or wallet of the person you would like to patronize:</p>
        <select
          className="p-2 border border-gray-400 rounded element"
          value={recipientType}
          onChange={(e) => {
            setRecipientType(e.target.value);
            setRecipient(""); // Reset recipient value when type changes
            setAmount(""); // Clear amount when switching types
            setIsInputValid(true); // Reset input validity
            setStatusMessage(""); // Clear status message
          }}
        >
          <option value="wallet">Wallet</option>
          <option value="basename">Basename</option>
        </select>

        <input
          type="text"
          placeholder={
            recipientType === "wallet"
              ? "Recipient Wallet Address"
              : recipientType === "nftCollection"
              ? "NFT Collection Address"
              : "Enter Basename"
          }
          className={`p-2 border ${isInputValid ? "border-gray-400" : "border-red-500"} rounded element`}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          onBlur={validateInput} // Validate when field is unfocused
        />

        <hr className="sep" />

        <p className="label">Insert the amount in $VISION to send:</p>
        <input
          type="number"
          step="0.000000000000000001"
          placeholder="Amount in VISION"
          className="p-2 border border-gray-400 rounded element"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button onClick={() => setShowAdvancedOptions(!showAdvancedOptions)} className="mt-4 p-4 adv">
          Advanced Options {showAdvancedOptions ? "▲" : "▼"}
        </button>

        {showAdvancedOptions && (
          <div className="mt-4 p-4 advdiv">
            <div className="">
              <label>Donation Percentage (Min 0%, Max 30%):</label>
              <input
                type="number"
                min={0}
                max={30}
                value={donationPercentage}
                step={1}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0 && value <= 30) {
                    setDonationPercentage(value);
                    setIsInputValid(true);
                  } else {
                    setIsInputValid(false);
                    setStatusMessage("Donation percentage must be between 0% and 30%");
                  }
                }}
                  onKeyDown={(e) => {
				    if (e.key === '.' || e.key === ',') {
				      e.preventDefault();
				    }
				  }}
                className={`p-2 border ${isInputValid ? "border-gray-400" : "border-red-500"} rounded txtblack`}
              />
            </div>
            <div>
              <label>Burn Percentage (Min 5%, Max 30%):</label>
              <input
                type="number"
                min={5}
                max={30}
                value={burnPercentage}
                step={1}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 5 && value <= 30) {
                    setBurnPercentage(value);
                    setIsInputValid(true);
                  } else {
                    setIsInputValid(false);
                    setStatusMessage("Burn percentage must be between 5% and 30%");
                  }
                }}
                  onKeyDown={(e) => {
				    if (e.key === '.' || e.key === ',') {
				      e.preventDefault();
				    }
				  }}
                className={`p-2 border ${isInputValid ? "border-gray-400" : "border-red-500"} rounded txtblack`}
              />
            </div>
          </div>
        )}

        <hr className="sep" />
        <button
          onClick={handleApprovalAndTip}
          className="p-3 btnsend text-white rounded element"
          disabled={isLoading || isApproving || !isInputValid || !amount || !userAddress}
        >
          {isApproving ? "Approving..." : isLoading ? "Processing..." : "Become a Patron"}
        </button>

{isImageLoading ? (
  <div className="spinner">...</div>
) : nftImage && tokenId ? (
  <div className="nft-image">
    {showConfetti && (
      <Lottie
        animationData={confettiAnimation}
        loop={false} // Play once
        className="confetti-animation"
      />
    )}
    <div className="nft-title">Check your Patron NFT</div>
    <img src={nftImage} alt="NFT" className="nft-image-display" />
    <div className="nft-buttons">
      <a
        href={`https://opensea.io/assets/base/${transferAndMintContract?.getAddress()}/${tokenId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-opensea"
      >
        View on OpenSea
      </a>
      <a
        href={
          recipientType === "wallet" && recipient
            ? `/communities/${recipient}`
            : resolvedRecipient
            ? `/communities/${resolvedRecipient}`
            : "#"
        }
        className="btn-community"
        onClick={(e) => {
          if (!recipient && !resolvedRecipient) {
            e.preventDefault();
            alert("Recipient is not resolved. Please try again.");
          }
        }}
      >
        See Community
      </a>
    </div>
    <p className="nft-description">*It may take a few seconds for your NFT's metadata to reflect on the OpenSea blockchain.<br/>If you do not see the image/metadata, please click "Update Metadata" on the OpenSea website.</p>
  </div>
) : null}




        <div className="mt-4 text-center status">
          <p dangerouslySetInnerHTML={{ __html: statusMessage }}></p>
        </div>
        
        
        {/* Transaction Summary */}
        <div className="transactionresume mt-4 p-4 text-left">
          <h3 className="font-bold">Transaction Summary:</h3>
          <p>Sender: {userAddress || "Not connected"}</p>
          <p>Receiver: {recipient || "Not entered"}</p>
          <p>Tip Amount: {amount ? `${amount} $VISION` : "Not entered"}</p>
          <p>Donation: {amount ? `${distribution.donationAmount.toFixed(2)} $VISION` : "0 $VISION"}</p>
          <p>Burn: {amount ? `${distribution.burnAmount.toFixed(2)} $VISION` : "0 $VISION"}</p>
          <p>Final Tip: {amount ? `${distribution.finalTipAmount.toFixed(2)} $VISION` : "0 $VISION"}</p>
        </div>
      </div>
    <div className="tokeninfo">
    $VISION (Token): <a href="https://basescan.org/address/0x71c7656ec7ab88b098defb751b7401b5f6d8976f" target="_blank">0x07609D76e2E098766AD4e2b70B84f05b215d380a</a><br />
    VISION (Patron): <a href="https://basescan.org/address/0xE8D2B6c63f74591dF9E91261E28a9292b7e91B8D" target="_blank">0xE8D2B6c63f74591dF9E91261E28a9292b7e91B8D</a>
    </div>
    </div>

  );
}
