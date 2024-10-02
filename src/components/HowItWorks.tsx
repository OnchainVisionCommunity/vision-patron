import React, { useEffect } from 'react';
import swapIcon from '../assets/images/swapicon.png';
import walletIcon from '../assets/images/walleticon.png';
import artIcon from '../assets/images/articon.png';

const HowItWorks: React.FC = () => {
  // Add a useEffect hook to handle scroll animation
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.step-container');
      elements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          el.classList.add('fade-in');
          // Assert that el is an HTMLElement to access its style property
          (el as HTMLElement).style.animationDelay = `${idx * 0.3}s`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="my-12">
      <hr className="sep2" />
      <h2 className="text-3xl font-bold text-center mb-8">How it Works?</h2>

      <div className="flex flex-wrap justify-around">
        <div className="w-full md:w-1/3 p-4 text-center step-container">
          <h3 className="font-bold text-xl steps">Step 1</h3>
          <div className="flex justify-center">
            <img src={swapIcon} alt="Swap Icon" className="swap-icon imghow" />
          </div>
          <p className="exp">Connect on Base and <a href="https://dexscreener.com/base/0xe659020edd96ff279bfb9680e664e4ed44198c7d" target="_blank">swap some $VISION</a></p>
        </div>
        <div className="w-full md:w-1/3 p-4 text-center step-container">
          <h3 className="font-bold text-xl steps">Step 2</h3>
          <div className="flex justify-center">
            <img src={walletIcon} alt="Wallet Icon" className="swap-icon imghow" />
          </div>
          <p className="exp">
            Send $VISION to any basename or wallet of your favorite creator and
            receive an NFT as onchain proof that you are a patron of that
            community
          </p>
        </div>
        <div className="w-full md:w-1/3 p-4 text-center step-container">
          <h3 className="font-bold text-xl steps">Step 3</h3>
          <div className="flex justify-center">
            <img src={artIcon} alt="Art Icon" className="swap-icon imghow" />
          </div>
          <p className="exp">
            Join the community of Patrons and support your favorite creators
            while unlocking exclusive benefits just for their patrons!
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
