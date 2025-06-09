import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function AuthPage() {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, onSignIn } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: theme.spacing(3),
            width: '100%',
            [theme.breakpoints.up('sm')]: {
              padding: theme.spacing(4),
            },
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            align="center"
            sx={{ mb: 3 }}
          >
            Welcome to English Learning
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? 'fullWidth' : 'standard'}
              centered={!isMobile}
            >
              <Tab label="Sign In" />
              <Tab label="Sign Up" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <SignInForm onSuccess={onSignIn} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <SignUpForm onSuccess={onSignIn} />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
} 