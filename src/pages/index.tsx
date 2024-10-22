import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { Avatar } from '@coinbase/onchainkit/identity';
import { base } from 'wagmi/chains';
import { Name } from '@coinbase/onchainkit/identity';

const address = '0x95B4D8DE77bE9B2CD7848072d315770511373197';


const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
HELLO!
        
<Name address={address} /> 
      </main>
    </div>
  );
};

export default Home;
