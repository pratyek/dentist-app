// client/src/components/layout/Landing.js
import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Container, Typography, Button, Grid, Paper, makeStyles } from '@material-ui/core';
import { AuthContext } from '../../context/AuthContext';

const useStyles = makeStyles((theme) => ({
  heroContent: {
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    margin: theme.spacing(3, 0),
    textAlign: 'center',
  },
  icon: {
    fontSize: 60,
    marginBottom: theme.spacing(2),
  }
}));

const Landing = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  // Redirect if logged in
  if (user) {
    if (user.role === 'patient') {
      return <Navigate to="/patient/dashboard" />;
    } else if (user.role === 'dentist') {
      return <Navigate to="/dentist/dashboard" />;
    }
  }

  return (
    <div className={classes.heroContent}>
      <Container maxWidth="md">
        <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
          Dental Checkup System
        </Typography>
        <Typography variant="h5" align="center" color="textSecondary" paragraph>
          A simple and efficient way to manage dental checkups.
          Book appointments with dentists, receive diagnosis and export your dental records.
        </Typography>
        <div className={classes.heroButtons}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button variant="contained" color="primary" component={Link} to="/register">
                Register Now
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary" component={Link} to="/login">
                Login
              </Button>
            </Grid>
          </Grid>
        </div>

        <Grid container spacing={4} style={{ marginTop: '2rem' }}>
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper} elevation={3}>
              <Typography variant="h5" color="primary" gutterBottom>
                For Patients
              </Typography>
              <Typography paragraph>
                • Browse list of available dentists<br />
                • Request dental checkups<br />
                • View diagnosis and results<br />
                • Export dental records as PDF
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper className={classes.paper} elevation={3}>
              <Typography variant="h5" color="primary" gutterBottom>
                For Dentists
              </Typography>
              <Typography paragraph>
                • Manage patient checkup requests<br />
                • Upload dental images<br />
                • Provide diagnosis and recommendations<br />
                • Track patient history
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Landing;