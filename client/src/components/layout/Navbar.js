// client/src/components/layout/Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, makeStyles } from '@material-ui/core';
import { AuthContext } from '../../context/AuthContext';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
    textDecoration: 'none',
    color: 'white'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    marginLeft: theme.spacing(2)
  }
}));

const Navbar = () => {
  const classes = useStyles();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const authLinks = (
    <>
      {user && user.role === 'patient' && (
        <>
          <Button color="inherit" component={Link} to="/patient/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/patient/dentists">
            Find Dentist
          </Button>
        </>
      )}
      
      {user && user.role === 'dentist' && (
        <>
          <Button color="inherit" component={Link} to="/dentist/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/dentist/patients">
            Patients
          </Button>
        </>
      )}
      
      <Button color="inherit" onClick={handleLogout}>
        Logout
      </Button>
    </>
  );

  const guestLinks = (
    <>
      <Button color="inherit" component={Link} to="/register">
        Register
      </Button>
      <Button color="inherit" component={Link} to="/login">
        Login
      </Button>
    </>
  );

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title} component={Link} to="/">
            Dental Checkup System
          </Typography>
          {user ? authLinks : guestLinks}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Navbar;