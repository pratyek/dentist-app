// client/src/components/patient/PatientDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  makeStyles 
} from '@material-ui/core';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext'; 

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  tableContainer: {
    marginTop: theme.spacing(3),
  },
  statusPending: {
    backgroundColor: theme.palette.warning.light,
  },
  statusCompleted: {
    backgroundColor: theme.palette.success.light,
  },
  noRequests: {
    textAlign: 'center',
    padding: theme.spacing(3),
  },
}));

const PatientDashboard = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [checkupRequests, setCheckupRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { checkupUpdates } = useSocket(); 

  const fetchCheckupRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const res = await api.get('/api/patients/checkup-requests', {
        headers: {
          'x-auth-token': token
        }
      });
      setCheckupRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching checkup requests:', err);
      if (err.response?.status === 401) { 
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(checkupUpdates).length > 0) {
      fetchCheckupRequests();
    }
  }, [checkupUpdates]);

  useEffect(() => {
    if (user) {
      fetchCheckupRequests();
    }
  }, [user]);

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h4" className={classes.title}>
          Patient Dashboard
        </Typography>
        <Typography variant="h6">
          Welcome, {user?.name}
        </Typography>
        <Grid container spacing={2} style={{ marginTop: '1rem', justifyContent: 'center' }}>
          <Grid item xs={12} md={6} style={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              to="/patient/dentists"
              fullWidth
            >
              Find a Dentist
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h5" className={classes.title}>
          Your Checkup Requests
        </Typography>
        
        {loading ? (
          <Typography>Loading...</Typography>
        ) : checkupRequests.length === 0 ? (
          <div className={classes.noRequests}>
            <Typography variant="body1">
              You haven't made any checkup requests yet.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              component={Link} 
              to="/patient/dentists"
              style={{ marginTop: '1rem' }}
            >
              Request a Checkup
            </Button>
          </div>
        ) : (
          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Dentist</TableCell>
                  <TableCell>Request Date</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checkupRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request.dentist?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(request.requestDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        className={
                          request.status === 'pending'
                            ? classes.statusPending
                            : classes.statusCompleted
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        component={Link}
                        to={`/patient/checkup/${request._id}`}
                      >
                        {request.status === 'completed' ? 'View Results' : 'View Details'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default PatientDashboard;
