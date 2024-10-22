import React from 'react';
import Image from 'next/image';
import step1 from '../assets/images/steps/step1.png';
import step2 from '../assets/images/steps/step2.png';
import step3 from '../assets/images/steps/step3.png';

const WhatIs = () => {
  return (
    <div className="whatis-container">
      <div className="whatis-step step1">
        <h2 className="step-title">1] Collect an NFT from anyone</h2>
        <Image src={step1} alt="Step 1" className="step-image" />
        <p className="step-text">
          Support anyone directly in their wallet address or basename. Thanks to the automatic token swap, you can patronize them with any Base token. In return, you'll receive an NFT shard from that community!
        </p>
      </div>
      <div className="whatis-step step2">
        <h2 className="step-title">2] Boost the Reputation</h2>
        <Image src={step2} alt="Step 2" className="step-image" />
        <p className="step-text">
          Each action in the system increases your reputation as well as the reputation of the community you interact with. The higher your reputation, and that of the community, the greater the rewards!
        </p>
      </div>
      <div className="whatis-step step3">
        <h2 className="step-title">3] Earn Exciting Rewards</h2>
        <Image src={step3} alt="Step 3" className="step-image" />
        <p className="step-text">
          Roll your NFT shard in the lottery for a chance to win up to 100x in prizes! Didn’t win? Don’t worry—there’s also the upcoming PvP Deck game mode. The more tokens pooled in the patron, the bigger the prizes. You can also trade your NFT shards freely on the 2nd market.
        </p>
      </div>
    </div>
  );
};

export default WhatIs;
