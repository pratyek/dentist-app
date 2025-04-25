// client/src/components/patient/NewCheckupRequest.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  makeStyles 
} from '@material-ui/core';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';
import { AuthContext } from '../../context/AuthContext';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(4),
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const NewCheckupRequest = () => {
  const classes = useStyles();
  const { dentistId } = useParams();
  const navigate = useNavigate();
  const { emitEvent } = useSocket();
  const { user } = useContext(AuthContext);
  
  const [dentist, setDentist] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDentist = async () => {
      try {
        const res = await axios.get(`/api/dentists`);
        const foundDentist = res.data.find(d => d._id === dentistId);
        
        if (foundDentist) {
          setDentist(foundDentist);
        } else {
          toast.error('Dentist not found');
          navigate('/patient/dentists');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dentist:', err);
        toast.error('Error fetching dentist details');
        navigate('/patient/dentists');
      }
    };

    fetchDentist();
  }, [dentistId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for the checkup');
      return;
    }
    
    try {
      const res = await axios.post('/api/checkup-requests', {
        dentistId,
        reason
      });
      
      // Emit socket event for new checkup request
      emitEvent('new_checkup_request', {
        dentistId,
        patientId: user.id,
        patientName: user.name,
        requestId: res.data._id,
        reason,
        status: 'pending',
        date: new Date().toISOString()
      });
      
      toast.success('Checkup request submitted successfully');
      navigate('/patient/dashboard');
    } catch (err) {
      console.error('Error submitting checkup request:', err);
      toast.error('Failed to submit checkup request');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h4" gutterBottom>
          Request a Checkup
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          Dentist: Dr. {dentist.name}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Email: {dentist.email}
        </Typography>
        
        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="reason"
            label="Reason for Checkup"
            name="reason"
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Submit Request
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default NewCheckupRequest;
