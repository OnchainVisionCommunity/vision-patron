import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faPlus, faCrown, faTrophy, faArrowUp, faArrowDown, faMinus } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom'; // Assuming you use react-router-dom

// Function to format reputation with k and mil rounding
const formatReputation = (reputation) => {
  if (reputation >= 1000000) {
    return (reputation / 1000000).toFixed(1).replace(/\.0$/, '') + 'mil';
  } else if (reputation >= 1000) {
    return (reputation / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  } else {
    return reputation;
  }
};

// Function to get reputation change with icons and color
const getReputationChange = (change) => {
  if (change > 0) {
    return (
      <span className="positive-change">
        <FontAwesomeIcon icon={faArrowUp} /> +{formatReputation(change)} <FontAwesomeIcon icon={faArrowUp} />
      </span>
    );
  } else if (change < 0) {
    return (
      <span className="negative-change">
        <FontAwesomeIcon icon={faArrowDown} /> {formatReputation(change)} <FontAwesomeIcon icon={faArrowDown} />
      </span>
    );
  } else {
    return (
      <span className="neutral-change">
        <FontAwesomeIcon icon={faMinus} /> 0
      </span>
    );
  }
};

// Function to get the correct community name with priority
const getCommunityName = (community) => {
  if (community.details.customname) {
    return community.details.customname;
  } else if (community.details.basename) {
    return community.details.basename;
  } else {
    return `${community.wallet.slice(0, 6)}...${community.wallet.slice(-4)}`;
  }
};

const TrendingCommunities = () => {
  const [communitiesData, setCommunitiesData] = useState({ trending: [], top_7_days: [], recent: [] });
  const [loading, setLoading] = useState(true);

  // Fetch data from the API
  useEffect(() => {
    const fetchTrendingCommunities = async () => {
      try {
        const response = await fetch('https://api.visioncommunity.xyz/v02/communities/all/trend');
        const data = await response.json();

        if (data.success) {
          setCommunitiesData(data.data);
        }
      } catch (error) {
        console.error('Error fetching trending communities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingCommunities();
  }, []);

  // Limit the number of communities displayed
  const topCommunitiesCount = 3;

  return (
    <Box sx={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '8px' }} className="feedcustomparent">
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          {/* Trending Communities Title */}
          <Typography className="basestylefont marginbot title-with-icon" gutterBottom>
            <FontAwesomeIcon icon={faChartLine} className="title-icon" /> Trending Communities
          </Typography>

          <div className="trending-communities feedcustom">
            {communitiesData.trending.slice(0, topCommunitiesCount).map((community, index) => (
              <div className="community-item" key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Link to={`/communities/${community.wallet}`} className="community-link" style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={community.details.avatar || 'https://api.visioncommunity.xyz/img/placeholder/avatar.jpg'}
                    alt={getCommunityName(community)}
                    className="community-avatar"
                    style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '1rem' }} // Style to ensure avatar is aligned
                  />
                  <div>
                    <p className="community-name" style={{ margin: 0 }}>{getCommunityName(community)}</p>
                    <small className="community-reputation">
                      <FontAwesomeIcon icon={faTrophy} /> {formatReputation(community.reputation_sum_7days)} (
                      {getReputationChange(community.reputation_sum_1day)} last 7D)
                    </small>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* New Communities Title */}
          <hr className="sep marginbot" />
          <Typography className="basestylefont marginbot title-with-icon" gutterBottom>
            <FontAwesomeIcon icon={faPlus} className="title-icon" /> New Communities
          </Typography>

          <div className="new-communities feedcustom">
            {communitiesData.recent.slice(0, topCommunitiesCount).map((community, index) => (
              <div className="community-item" key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Link to={`/communities/${community.wallet}`} className="community-link" style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={community.details.avatar || 'https://api.visioncommunity.xyz/img/placeholder/avatar.jpg'}
                    alt={getCommunityName(community)}
                    className="community-avatar"
                    style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '1rem' }} // Style to ensure avatar is aligned
                  />
                  <div>
                    <p className="community-name" style={{ margin: 0 }}>{getCommunityName(community)}</p>
                    <small className="community-reputation">
                      <FontAwesomeIcon icon={faTrophy} /> {formatReputation(community.reputation_sum_1day)} (
                      {getReputationChange(community.reputation_sum_1hour)} last 24h)
                    </small>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Top Reputation Communities Title */}
          <hr className="sep marginbot" />
          <Typography className="basestylefont marginbot title-with-icon" gutterBottom>
            <FontAwesomeIcon icon={faCrown} className="title-icon" /> Top Reputation (Last 7D)
          </Typography>

          <div className="top-reputation-communities feedcustom">
            {communitiesData.top_7_days.slice(0, topCommunitiesCount).map((community, index) => (
              <div className="community-item" key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Link to={`/communities/${community.wallet}`} className="community-link" style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={community.details.avatar || 'https://api.visioncommunity.xyz/img/placeholder/avatar.jpg'}
                    alt={getCommunityName(community)}
                    className="community-avatar"
                    style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '1rem' }} // Style to ensure avatar is aligned
                  />
                  <div>
                    <p className="community-name" style={{ margin: 0 }}>{getCommunityName(community)}</p>
                    <small className="community-reputation">
                      <FontAwesomeIcon icon={faTrophy} /> {formatReputation(community.reputation_sum_7days)} (
                      {getReputationChange(community.reputation_sum_1day)})
                    </small>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </Box>
  );
};

export default TrendingCommunities;