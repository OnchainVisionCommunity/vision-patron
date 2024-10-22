import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  Button,
  Box,
  Typography,
  Avatar,
  InputAdornment,
  TextField,
  Card,
  CardMedia,
  CardContent,
  Pagination, useMediaQuery, Collapse
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClaimCommunity from "./ClaimCommunity";
import FilterListIcon from '@mui/icons-material/FilterList';

// Define the type for a Community object
interface Community {
  id: number;
  owner: string;
  wallet?: string;
  basename?: string;
  customname?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  status: number;
  total_tips_all_time: number;
  total_tips_last_30_days: number;
  category?: string; // Added category field
}

// Define the type for Highlighted or Sponsored Communities
interface HighlightedCommunity extends Community {}

// Helper function to shorten wallet address
const shortenAddress = (address: string): string => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Community[]>([]);
  const [noResultsMessage, setNoResultsMessage] = useState<string>("");
  const [highlightedCommunity, setHighlightedCommunity] = useState<HighlightedCommunity | null>(null);
  const [sponsoredCommunities, setSponsoredCommunities] = useState<Community[]>([]);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [orderBy, setOrderBy] = useState<string>("newest");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const communitiesPerPage = 10; // Communities per page

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  useEffect(() => {
    // Fetch data from API on load for highlight and sponsor communities
    fetch("https://api.visioncommunity.xyz/v02/community/home")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Check for highlight community
          if (data.highlight?.wallet !== "0x0") {
            setHighlightedCommunity(data.highlight);
          }
          // Filter and set sponsor communities
          const sponsors = [data.sponsor1, data.sponsor2, data.sponsor3, data.sponsor4].filter(
            (sponsor) => sponsor?.wallet !== "0x0"
          );
          setSponsoredCommunities(sponsors || []); // Ensure sponsored communities is always an array
        }
      });

    // Fetch all communities (for initial load or when orderBy or selectedCategory changes)
    fetchAllCommunities(orderBy, selectedCategory);
  }, [orderBy, selectedCategory]);

  // Fetch all communities based on the selected sort option and category
  const fetchAllCommunities = (sortOption: string, category: string) => {
    let categoryParam = category !== "all" ? `&category=${category}` : "";
    fetch(`https://api.visioncommunity.xyz/v02/community/all?orderBy=${sortOption}${categoryParam}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAllCommunities(data.data); // Correctly accessing `data.data`
          if (data.data.length === 0) {
            setNoResultsMessage("No communities found.");
          } else {
            setNoResultsMessage("");
          }
        } else {
          setAllCommunities([]);
          setNoResultsMessage("No communities found.");
        }
      })
      .catch(() => {
        setAllCommunities([]);
        setNoResultsMessage("Error fetching communities. Please try again.");
      });
  };

  // Helper function to sanitize search input (allow only periods and alphanumeric characters)
  const sanitizeQuery = (query: string): string => {
    return query.replace(/[^a-zA-Z0-9.]/g, "");
  };

const handleSearch = () => {
  const sanitizedQuery = searchQuery.replace(/[^a-zA-Z0-9.-]/g, ""); // Allowing periods and hyphens

  if (sanitizedQuery) {
    setNoResultsMessage(""); // Reset no results message before making the search

    // Make API call to search for communities
    fetch(`https://api.visioncommunity.xyz/v02/community/search?search=${sanitizedQuery}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.results > 0) {
          // Convert results from object to an array, ensuring wallet/owner is mapped properly
          const communitiesArray: Community[] = Object.values(data.communities).map((community, index) => ({
            ...community,
            id: index + 1, // Adding an index as an ID for mapping
          }));

          setSearchResults(communitiesArray); // Set the search results array
          setNoResultsMessage(""); // Clear the "no results" message
        } else {
          // If the search failed or no results, show "no results found" message
          setSearchResults([]);
          setNoResultsMessage(`No results found for "${searchQuery}"`);
        }
      })
      .catch((error) => {
        console.error("Error searching communities:", error);
        setSearchResults([]);
        setNoResultsMessage("An error occurred during the search. Please try again.");
      });
  }
};


// Function to truncate the description
const truncateDescription = (description, maxLength = 45) => {
  if (description.length > maxLength) {
    return description.slice(0, maxLength) + ' [...]';
  }
  return description;
};

  // Pagination logic: slice communities to show only those for the current page
  const indexOfLastCommunity = currentPage * communitiesPerPage;
  const indexOfFirstCommunity = indexOfLastCommunity - communitiesPerPage;
  const currentCommunities = allCommunities.slice(indexOfFirstCommunity, indexOfLastCommunity);
  const totalPages = Math.ceil(allCommunities.length / communitiesPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", mt: 2 }} className="containercomm">
      <section className="my-12">
      
        {/* Search Bar and Search Results Section */}
        <Box mb={6}>
          {/* Search Bar */}
<Box
  display="flex"
  justifyContent="space-between"
  alignItems="center"
  flexDirection={{ xs: "column", sm: "row" }}
  mb={4}
>
  <TextField
    label="Search for Communities"
    variant="outlined"
    fullWidth
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <SearchIcon />
        </InputAdornment>
      ),
      style: {
        backgroundColor: "#fff",
        color: "#000",
        height: '50px',
      },
    }}
    InputLabelProps={{
      style: { color: "#000" },
    }}
  sx={{
    mb: { xs: 2, sm: 0 },
    height: '50px',
    mr: { sm: 2 },
    '& .MuiOutlinedInput-root': {
      borderRadius: {
        xs: '5px 5px 0 0',
        sm: '5px 0 0 5px',
      },
    },
  }}
    className="searchcominput"
  />
  <Button
    variant="contained"
    color="primary"
    onClick={handleSearch}
    className="btnpatronme searchbtncomm"
    sx={{
      width: { xs: '100%', sm: 'auto' },  // Full width on mobile, auto width on desktop
      ml: { xs: 0, sm: 2 },               // No margin on mobile, margin left on desktop
      mt: { xs: 2, sm: 0 },               // Add margin top on mobile to push button below input
    }}
  >
    Search
  </Button>
</Box>


          {/* No Results Message */}
          {noResultsMessage && (
            <Typography className="erronofoundmsg" gutterBottom>
              {noResultsMessage}
            </Typography>
          )}

          {/* Search Results */}
          {searchResults && searchResults.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom className="communityanounce">
                Search Results:
              </Typography>
              <Grid container spacing={3}>
                {searchResults.map((community, index) => (
                  <Grid item xs={12} sm={6} md={4} key={community.id || index}>
                    <Card sx={{ position: "relative", padding: 2 }}>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column", // Ensure category wraps below the title
                            alignItems: "flex-start",
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ wordBreak: "break-word" }} // Ensure long names break to the next line
                          >
                            /{community.customname || community.basename || shortenAddress(community.owner)}
                          </Typography>
                          {community.category && (
                            <Typography variant="caption" className="tagcathigh" sx={{ marginTop: 1 }}>
                              {community.category}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {truncateDescription(community.description || "")}
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          component={Link}
                          to={`/communities/${encodeURIComponent(community.wallet)}`}
                          sx={{ mt: 2 }}
                          className="btnpatronme"
                        >
                          View
                        </Button>
                      </CardContent>

                      {/* Avatar aligned with other components */}
                      <Avatar
                        alt={community.basename}
                        src={community.avatar || "https://via.placeholder.com/72"}
                        sx={{
                          width: 56,
                          height: 56,
                          position: "absolute",
                          top: "16px",
                          right: "16px",
                          border: "2px solid white",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      
        {/* Highlighted Community */}
        {highlightedCommunity && (
          <Box mb={8} sx={{ position: "relative" }}>
            <Card sx={{ maxWidth: "100%", overflow: "hidden" }}>
              <CardMedia
                component="img"
                image={highlightedCommunity.banner || "https://via.placeholder.com/1200x400?text=No+Banner+Available"}
                alt={highlightedCommunity.basename || "Highlighted Community"}
                sx={{
                  height: "250px",
                  width: "100%",
                  objectFit: "cover",
                }}
              />
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="h5" gutterBottom className="alltitle" sx={{ wordBreak: 'break-word' }}>
                    Discover the vibrant art of /{highlightedCommunity.customname || highlightedCommunity.basename || shortenAddress(highlightedCommunity.owner || highlightedCommunity.wallet || '')}
                  </Typography>
                  {highlightedCommunity.category && (
                    <Typography variant="caption" className="tagcathigh" sx={{ marginTop: 1 }}>
                      {highlightedCommunity.category}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body1" color="textSecondary">
                  {truncateDescription(highlightedCommunity.description || "")}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/communities/${encodeURIComponent(highlightedCommunity.owner || highlightedCommunity.wallet || '')}`}
                  sx={{ mt: 2 }}
                  className="btnpatronme"
                >
                  View
                </Button>
              </CardContent>
              <Avatar
                alt={highlightedCommunity.basename}
                src={highlightedCommunity.avatar || "https://via.placeholder.com/72"}
                sx={{
                  width: 72,
                  height: 72,
                  position: "absolute",
                  bottom: 16,
                  right: 16,
                  border: "2px solid white",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                }}
              />
            </Card>
          </Box>
        )}

        {/* "You Must Patron" Section */}
        {sponsoredCommunities && sponsoredCommunities.length > 0 && (
  <Box mb={8}>
    <Typography variant="h5" gutterBottom className="communityanounce communitiespagetitlescont">
      Highlighted Communities:
    </Typography>
    <Grid
      container
      spacing={3}
      justifyContent={sponsoredCommunities.length < 4 ? 'center' : 'flex-start'}
      sx={{
        display: 'flex', // Keep items in a single line
        overflowX: { xs: 'auto', md: 'unset' }, // Enable horizontal scrolling on mobile
        flexWrap: 'nowrap', // Prevent wrapping for both mobile and desktop
        gap: { xs: 2, md: 3 },
        paddingBottom: { xs: 2, md: 0 },
		marginTop: '0px',
		paddingLeft: '20px;'
      }}
    >
      {sponsoredCommunities.map((community, index) => (
        <Box
          key={community.id || index}
          sx={{
            flex: { xs: '0 0 80%', md: '0 0 23%' }, // Width: 80% on mobile and around 23% on desktop to fit four cards
            maxWidth: { xs: '80%', md: '23%' }, // Make sure the max width corresponds to the flex value
            marginLeft: { xs: 1, md: 0 },
			height: 'auto'
          }}
        >
          <Card>
            <CardMedia
              component="img"
              image={community.banner || "https://via.placeholder.com/400x300?text=No+Banner+Available"}
              alt={community.basename || shortenAddress(community.owner || community.wallet || '')}
              sx={{
                height: "200px",
                width: "100%",
                objectFit: "cover",
              }}
            />
            <CardContent>
              <Avatar
                alt={community.basename}
                src={community.avatar || "https://via.placeholder.com/100"}
                sx={{ width: 56, height: 56, mx: "auto", mb: 2 }}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Typography className="alltitle youmustpatrontitle" align="center" sx={{ wordBreak: 'break-word' }}>
                  /{community.customname || community.basename || shortenAddress(community.owner || community.wallet || '')}
                </Typography>
                {community.category && (
                  <Typography variant="caption" className="tagcathigh catyoumustpat" sx={{ marginTop: 1 }}>
                    {community.category}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" color="textSecondary" align="center" className="youmustpatrondesc">
                {truncateDescription(community.description || "")}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                component={Link}
                to={`/communities/${encodeURIComponent(community.owner || community.wallet || '')}`}
                sx={{ mt: 2 }}
                className="btnpatronme"
              >
                View Community
              </Button>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Grid>
  </Box>
        )}



        {/* "All Communities" Section with Filter */}
        <Box>
      <Typography variant="h5" gutterBottom className="communityanounce" className="communitiespagetitlescont">
        Communities
      </Typography>
          <Grid container spacing={4} direction={isMobile ? 'column-reverse' : 'row'}>

            {/* All Communities List */}
            <Grid item xs={12} md={9}>
<Box
  sx={{
    backgroundColor: "white",
    padding: 2,
    borderRadius: 2,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    width: '100%'
  }}
>
  {currentCommunities && currentCommunities.length > 0 ? (
    currentCommunities.map((community, index) => (
      <Box
        key={community.id || index}
        sx={{
          display: "flex",
          flexDirection: { xs: "row", md: "row" }, // Keep row for both, handle children differently
          borderBottom: "1px solid #e0e0e0",
          padding: 2,
          "&:last-child": { borderBottom: "none" },
        }}
      >
        {/* Desktop Layout */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" }, // Hidden in mobile, visible in desktop
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Avatar
            alt={community.basename}
            src={community.avatar || "https://via.placeholder.com/64"}
            sx={{ width: 64, height: 64, marginRight: 2 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography className="alltitle">
              /{community.customname || community.basename || shortenAddress(community.owner || community.wallet || '')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {truncateDescription(community.description || "")}
            </Typography>
            {community.category && (
              <Typography variant="caption" className="tagcathigh" sx={{ marginTop: 1 }}>
                {community.category}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`/communities/${encodeURIComponent(community.owner)}`}
            className="btnpatronme"
            sx={{ mx: 2 }}
          >
            View Community
          </Button>
        </Box>

        {/* Mobile Layout */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" }, // Visible in mobile, hidden in desktop
            flexDirection: "row",
            width: "100%",
          }}
        >
          {/* Left side: Avatar and Category */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "30%",
            }}
          >
            <Avatar
              alt={community.basename}
              src={community.avatar || "https://via.placeholder.com/64"}
              sx={{ width: 64, height: 64 }}
            />
            {community.category && (
              <Typography
                variant="caption"
                className="tagcathigh"
                sx={{ marginTop: 1, textAlign: "center" }}
              >
                {community.category}
              </Typography>
            )}
          </Box>

          {/* Right side: Name, Description, and Button */}
          <Box sx={{ flex: 1, width: "70%", marginLeft: 2 }}>
            <Typography className="alltitle" sx={{ textAlign: "left" }}>
              /{community.customname || community.basename || shortenAddress(community.owner || community.wallet || '')}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: "left" }}>
              {truncateDescription(community.description || "")}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to={`/communities/${encodeURIComponent(community.owner)}`}
              className="btnpatronme"
              sx={{
                mt: 1,
                width: "auto",
                textAlign: "left",
              }}
            >
              View Community
            </Button>
          </Box>
        </Box>
      </Box>
    ))
  ) : (
    <Typography variant="h6" color="textSecondary" align="center">
      No communities found.
    </Typography>
  )}
</Box>


              {/* Pagination */}
              <Box mt={4} display="flex" justifyContent="center">
                <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
              </Box>
            </Grid>
            
            {/* Sidebar Filter */}
   <Grid item xs={12} md={3}>
      <Box sx={{ border: '1px solid #333', borderRadius: 2, p: 2 }}>
        <Typography
          variant="h6"
          gutterBottom
          className="communityanounce"
          onClick={isMobile ? handleMobileToggle : null}
          sx={{ cursor: isMobile ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
        >
          <FilterListIcon sx={{ mr: 1 }} />
          <span className="communitiespagetitlesfiltr">Filters</span>
        </Typography>
        

        <Collapse in={!isMobile || mobileOpen}>
          <Typography variant="h6" gutterBottom className="communityanounce communitiespagesfiltr">
            Order By
          </Typography>
          <Box mb={2}>
            <Button
              variant={orderBy === 'newest' ? 'contained' : 'outlined'}
              fullWidth
              sx={{ mb: 2 }}
              onClick={() => setOrderBy('newest')}
              style={{ backgroundColor: orderBy === 'newest' ? '#3873f5' : 'inherit', color: orderBy === 'newest' ? '#fff' : 'inherit' }}
              className="btnfilter"
            >
              Newest
            </Button>
            <Button
              variant={orderBy === 'oldest' ? 'contained' : 'outlined'}
              fullWidth
              sx={{ mb: 2 }}
              onClick={() => setOrderBy('oldest')}
              style={{ backgroundColor: orderBy === 'oldest' ? '#3873f5' : 'inherit', color: orderBy === 'oldest' ? '#fff' : 'inherit' }}
              className="btnfilter"
            >
              Oldest
            </Button>
            <Button
              variant={orderBy === 'most_patrons_last30' ? 'contained' : 'outlined'}
              fullWidth
              sx={{ mb: 2 }}
              onClick={() => setOrderBy('most_patrons_last30')}
              style={{ backgroundColor: orderBy === 'most_patrons_last30' ? '#3873f5' : 'inherit', color: orderBy === 'most_patrons_last30' ? '#fff' : 'inherit' }}
              className="btnfilter"
            >
              Reputation (24h)
            </Button>
            <Button
              variant={orderBy === 'most_patrons_alltime' ? 'contained' : 'outlined'}
              fullWidth
              onClick={() => setOrderBy('most_patrons_alltime')}
              style={{ backgroundColor: orderBy === 'most_patrons_alltime' ? '#3873f5' : 'inherit', color: orderBy === 'most_patrons_alltime' ? '#fff' : 'inherit' }}
              className="btnfilter"
            >
              Reputation (30d)
            </Button>
          </Box>

          {/* Category Filters */}
          <Typography variant="h6" gutterBottom className="communityanounce communitiespagesfiltr">
            Categories
          </Typography>
          <Button
            variant={selectedCategory === 'all' ? 'contained' : 'outlined'}
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => setSelectedCategory('all')}
            style={{ backgroundColor: selectedCategory === 'all' ? '#3873f5' : 'inherit', color: selectedCategory === 'all' ? '#fff' : 'inherit' }}
            className="btnfilter"
          >
            All
          </Button>
          <Button
            variant={selectedCategory === 'artists' ? 'contained' : 'outlined'}
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => setSelectedCategory('artists')}
            style={{ backgroundColor: selectedCategory === 'artists' ? '#3873f5' : 'inherit', color: selectedCategory === 'artists' ? '#fff' : 'inherit' }}
            className="btnfilter"
          >
            Artists
          </Button>
          <Button
            variant={selectedCategory === 'builders' ? 'contained' : 'outlined'}
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => setSelectedCategory('builders')}
            style={{ backgroundColor: selectedCategory === 'builders' ? '#3873f5' : 'inherit', color: selectedCategory === 'builders' ? '#fff' : 'inherit' }}
            className="btnfilter"
          >
            Builders
          </Button>
          <Button
            variant={selectedCategory === 'tokens' ? 'contained' : 'outlined'}
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => setSelectedCategory('tokens')}
            style={{ backgroundColor: selectedCategory === 'tokens' ? '#3873f5' : 'inherit', color: selectedCategory === 'tokens' ? '#fff' : 'inherit' }}
            className="btnfilter"
          >
            Tokens
          </Button>
          <Button
            variant={selectedCategory === 'kol' ? 'contained' : 'outlined'}
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => setSelectedCategory('kol')}
            style={{ backgroundColor: selectedCategory === 'kol' ? '#3873f5' : 'inherit', color: selectedCategory === 'kol' ? '#fff' : 'inherit' }}
            className="btnfilter"
          >
            KOL
          </Button>
          <Button
            variant={selectedCategory === 'content-creator' ? 'contained' : 'outlined'}
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => setSelectedCategory('content-creator')}
            style={{ backgroundColor: selectedCategory === 'content-creator' ? '#3873f5' : 'inherit', color: selectedCategory === 'content-creator' ? '#fff' : 'inherit' }}
            className="btnfilter"
          >
            Content Creator
          </Button>
          <Button
            variant={selectedCategory === 'personal' ? 'contained' : 'outlined'}
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => setSelectedCategory('personal')}
            style={{ backgroundColor: selectedCategory === 'personal' ? '#3873f5' : 'inherit', color: selectedCategory === 'personal' ? '#fff' : 'inherit' }}
            className="btnfilter"
          >
            Personal
          </Button>
          <Button
            variant={selectedCategory === 'others' ? 'contained' : 'outlined'}
            fullWidth
            sx={{ mb: 2 }}
            onClick={() => setSelectedCategory('others')}
            style={{ backgroundColor: selectedCategory === 'others' ? '#3873f5' : 'inherit', color: selectedCategory === 'others' ? '#fff' : 'inherit' }}
            className="btnfilter"
          >
            Others
          </Button>
        </Collapse>
      </Box>
    </Grid>
            
          </Grid>
        </Box>

        {/* "Claim Your Community!" Section */}
        <ClaimCommunity />
      </section>
    </Box>
  );
}
