// client/src/components/dentist/DentistDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api'
import { 
  Container, 
  Typography, 
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

const DentistDashboard = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [checkupRequests, setCheckupRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket, checkupUpdates } = useSocket();

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/dentists');
        if (response.ok) {
          console.log('Server is accessible');
        } else {
          console.error('Server returned error:', response.status);
        }
      } catch (error) {
        console.error('Cannot connect to server:', error);
      }
    };
    
    testConnection();
  }, []);

    const fetchCheckupRequests = async () => {
      try {
        const res = await api.get('/api/dentists/checkup-requests');
        setCheckupRequests(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching checkup requests:', err);
        setLoading(false);
      }
    };
  useEffect(() => {
    if (user) {
      fetchCheckupRequests();
    }
  }, [user]);
  useEffect(() => {
    if (socket) {
      console.log('Setting up socket listeners for new checkup requests');
      
      // Listen for new checkup requests
      socket.on('new_checkup_request', (data) => {
        console.log('New checkup request received:', data);
        fetchCheckupRequests(); // Refresh the list when a new request comes in
      });
      
      return () => {
        // Clean up listeners when component unmounts
        socket.off('new_checkup_request');
      };
    }
  }, [socket]);

  // Watch for checkup updates from context
  useEffect(() => {
    if (Object.keys(checkupUpdates).length > 0) {
      console.log('Checkup updates detected, refreshing data');
      fetchCheckupRequests();
    }
  }, [checkupUpdates]);


  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h4" className={classes.title}>
          Dentist Dashboard
        </Typography>
        <Typography variant="h6">
          Welcome, Dr. {user?.name}
        </Typography>
      </Paper>

      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h5" className={classes.title}>
          Patient Checkup Requests
        </Typography>
        
        {loading ? (
          <Typography>Loading...</Typography>
        ) : checkupRequests.length === 0 ? (
          <div className={classes.noRequests}>
            <Typography variant="body1">
              You don't have any checkup requests yet.
            </Typography>
          </div>
        ) : (
          <TableContainer component={Paper} className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Request Date</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checkupRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request.patient.name}</TableCell>
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
                      {request.status === 'pending' ? (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          component={Link}
                          to={`/dentist/submit-result/${request._id}`}
                        >
                          Submit Results
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          component={Link}
                          to={`/patient/checkup/${request._id}`}
                        >
                          View Results
                        </Button>
                      )}
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

export default DentistDashboard;