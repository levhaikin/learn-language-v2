import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ py: 1, textAlign: 'left', fontSize: 8, opacity: 0.8, position: 'fixed', bottom: 0, left: 10, right: 0, backgroundColor: '#fafafa', zIndex: 1101 }}>
      <Typography variant="body2">
        <Link
          href="https://www.flaticon.com/free-icons/wizard"
          title="wizard icons"
          target="_blank"
          rel="noopener noreferrer"
        >
          Icons created by Freepik - Flaticon
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
