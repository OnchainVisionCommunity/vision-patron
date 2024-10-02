// src/FaqSection.tsx
import React from 'react';

// @ts-ignore
import Faq from 'react-faq-component';

const FaqSection: React.FC = () => {
  const data = {
    rows: [
      {
        title: "What is $VISION?",
        content: `$VISION is a community-driven and CTO (Community Takeover) token derived from Coinbase Vision. Please note that $VISION is not yet affiliated with Coinbase. As a community token, all projects, utilities, and plans are organized by the community itself.`,
      },
      {
        title: "What is Onchain Patron?",
        content: `Onchain Patron is a utility for $VISION designed to bring communities onchain. Any user can create a community and start receiving $VISION donations from patrons. When someone becomes a patron of a community, they gain access to it. Community owners can set a minimum donation amount for patron access and have full control over their announcements, utilities, and benefits.`,
      },
      {
        title: "How can I donate $VISION to become a patron?",
        content: `The system allows any user to send any amount of $VISION to any wallet or basename. Once the transaction is completed, it will be registered onchain, and you will officially become a patron. You can explore communities created on Patron by accessing the "Communities" menu.`,
      },
      {
        title: "Why should I become a patron?",
        content: `Community owners can offer various benefits to their patrons, including exclusive access to their communities. However, the benefits are determined by the community owners, not the Vision Community Team. Most importantly, becoming a patron is a way to show support and appreciation for artists, content creators, builders, or anyone you'd like to support onchain.`,
      },
      {
        title: "What is the NFT Patron?",
        content: `The NFT Patron is awarded to individuals who become patrons of a community. The community may already exist on the Patron platform or may not yet be created.`,
      },
      {
        title: "How can I find someone to support as a patron?",
        content: `You can view your most recent patrons by accessing your profile. Additionally, all your patronage activities and the NFTs you’ve received are visible on your profile via OpenSea.`,
      },
      {
        title: "How do I create my own community?",
        content: `You can create your community by navigating to the "Communities" section, scrolling down, and clicking the "Create My Community" button.`,
      },
      {
        title: "Is there a fee to create a community?",
        content: `No, for now, creating a community is completely free. One community can be created per wallet, and all communities will share the same profile.`,
      },
      {
        title: "Can I change the name of my community?",
        content: `Our system is aligned with the BASE ONCHAIN IDENTITY. Therefore, you can choose to set the name using your wallet address or your basename. Custom names are not supported.`,
      },
      {
        title: "Is it safe to patron a community?",
        content: `Any wallet can create a community on Patron. If you believe a community is not genuine, please contact us on Telegram or via email at contact@visioncommunity.xyz`,
      },
      {
        title: "What is the donation?",
        content: `Donation is a percentage of the token that will be donated to the CTO of $VISION. The donation is completely optional and can be set to 0% in <Advanced Options>`,
      },
      {
        title: "Will there be more features in the future?",
        content: `Yes! Our long-term roadmap includes the addition of new features over time. The main steps can be checked in the roadmap section.`,
      },
    ],
  };

  // FAQ component custom styling
  const styles = {
    bgColor: 'transparent', // No background
    titleTextColor: '#fff',
    rowTitleColor: '#fff', // White text for rows
    rowContentColor: '#fff', // White text for content
    arrowColor: "#fff", // White arrow color
  };

  const config = {
    rowTitleClassName: 'titleroad', 
  };

  return (
    <section className="my-12">
      <hr className="sep2" />
      <h2 className="text-3xl font-bold text-center mb-8">FAQ</h2>
      <Faq data={data} styles={styles} config={config}/>
    </section>
  );
};

export default FaqSection;
