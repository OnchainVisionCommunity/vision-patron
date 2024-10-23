// src/components/FAQ.tsx
import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

const FAQComp: React.FC = () => {
  // Sample FAQ data for three different categories
const faqSections = [
  {
    title: 'User FAQs',
    icon: <PersonIcon />,
    questions: [
      {
        question: 'How do I patron a community?',
        answer:
          'To patron a community, go to the "Patron" section and enter the wallet or basename of the community owner you want to patron. If you are searching for a community, explore the "Communities" section and click the "Patron me" button.',
      },
      {
        question: 'Can I become a patron of any wallet/basename?',
        answer:
          'Yes, the patron system is permissionless, and any EVM wallet can be patroned. However, note that if you patron a community that has not been created yet, the NFT artwork will be generic, and you will not have access to the community since it has not been established.',
      },
      {
        question: 'If I patron a community that is not yet created and it is created in the future, will I have access to it?',
        answer:
          'Yes, your patrons are recorded on-chain and are permanent. Therefore, if a wallet creates a community in the future and you have already been a patron of the community before it was created, you will automatically gain access. However, past patrons before the community was established will still have the NFT with the generic artwork, but they will use the system normally.',
      },
      {
        question: 'Why did I earn more energy than expected?',
        answer:
          'Communities and users are placed in "Tiers" (see the FAQ on Games/Lotteries for more information). The displayed value is the minimum amount and can be multiplied up to 2x depending on the tier of the community you are patronizing.',
      },
    ],
  },
  {
    title: 'Community FAQs',
    icon: <PeopleIcon />,
    questions: [
      {
        question: 'How do I create my community? Can anyone create a community?',
        answer:
          'To create a community, go to "Communities," scroll down, and click on the "Claim Community" button. You will sign with your wallet, and your community will be created. The community creation system is permissionless, and anyone can create communities. However, if a community violates the terms of use, it may be deactivated.',
      },
      {
        question: 'Can I use different social media for my community profile?',
        answer:
          'Yes, communities and profiles are separate, and you can have a different avatar, category, description, and social media for your community compared to your personal profile.',
      },
      {
        question: 'How can I make my community appear in "Trending" or "Highlighted"?',
        answer:
          'Trending is determined by an internal algorithm. However, we can say that trending communities are those with the most activity in the last few days and hours. Highlighted communities are selected to appear as featured, and you can contact the Patron team on the OCV Community Instagram if you want to have your community featured in the Highlighted section.',
      },
    ],
  },
  {
    title: 'Games and Lotteries FAQs',
    icon: <SportsEsportsIcon />,
    questions: [
      {
        question: 'How does the Energy and Reputation system work?',
        answer:
          'Reputations are earned through interactions on the site with the community where you are a patron. Energy is the amount required for you to perform an action that generates reputation. Reputations are distributed among users involved in an action and the community where that action took place.',
      },
      {
        question: 'What is the energy cost and reputation gain for each action?',
        answer:
          'To check the energy cost and reputation gain for each action, please refer to the updated table on the "System Status" page.',
      },
      {
        question: 'What is "Normalized Reputation"?',
        answer:
          'Patrons and communities have "infinite reputation": the amount is earned indefinitely for each action in the system. For patronizing and defining the level of reputation of a user or community, the normalized reputation system is used, where the reputation is placed in a range of 0 to 100, considering the highest reputation as the benchmark.',
      },
      {
        question: 'How is the reputation of an NFT calculated?',
        answer:
          'The reputation of an NFT is calculated using normalized reputation: ((user + community) / 2).',
      },
      {
        question: 'What are reputation tiers?',
        answer:
          'The system classifies normalized reputation into tiers. Tiers are assigned as follows:\n0 to 20 = Tier 1\n21 to 40 = Tier 2\n41 to 60 = Tier 3\n61 to 80 = Tier 4\nAbove 80 = Tier 5.',
      },
      {
        question: 'Why are my community and I losing reputation?',
        answer:
          'To create a more balanced system, users and communities lose a percentage of their reputation every 5 minutes. Each reputation tier loses a different amount of reputation. Check "System Status" for the updated table of energy loss over time for each tier.',
      },
      {
        question: 'If I sell my NFT Shard on the secondary market, will I still have access to the community?',
        answer:
          'Yes, even if you sell your NFT Shard, you will still have access to the community as usual.',
      },
      {
        question: 'If I buy an NFT Shard on the secondary market, do I gain access to the community?',
        answer:
          'No, NFT Shards have metadata tied to the person who became a patron of a community. If the NFT is not rolled, you can roll it in the lottery; however, it will not grant access to the community.',
      },
      {
        question: 'If I buy an NFT Shard on the secondary market, will the reputation of the NFT change?',
        answer:
          'No, the reputation of an NFT is defined by the patron and the community. Therefore, regardless of the owner of an NFT Shard, its status will always be linked to the reputation status of the community and the patron.',
      },
    ],
  },
];


  return (
    <Box className="faqcontainer" sx={{ padding: 2 }}>
      {faqSections.map((section, sectionIndex) => (
        <Box key={sectionIndex} sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center">
            <Box sx={{ mr: 1 }}>{section.icon}</Box>
            <Typography variant="h5" sx={{ color: 'white' }}>{section.title}</Typography>
          </Box>
          {section.questions.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid #666',
                borderRadius: '0px',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                aria-controls={`panel${sectionIndex}-${index}-content`}
                id={`panel${sectionIndex}-${index}-header`}
              >
                <Typography variant="body1">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default FAQComp;
