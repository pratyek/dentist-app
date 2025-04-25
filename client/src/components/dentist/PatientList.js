// client/src/components/dentist/PatientList.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api'
import { 
  Container, 
  Typography, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  makeStyles 
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  tableContainer: {
    marginTop: theme.spacing(2),
  },
  noPatients: {
    textAlign: 'center',
    padding: theme.spacing(3),
  },
}));

const PatientList = () => {
  const classes = useStyles();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/api/dentists/checkup-requests');
        
        // Extract unique patients from all requests
        const uniquePatients = [];
        const patientIds = new Set();
        
        res.data.forEach((request) => {
          if (!patientIds.has(request.patient._id)) {
            patientIds.add(request.patient._id);
            uniquePatients.push({
              _id: request.patient._id,
              name: request.patient.name,
              email: request.patient.email,
              lastCheckup: request.requestDate
            });
          }
        });
        
        setPatients(uniquePatients);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <Container className={classes.container} maxWidth="md">
      <Paper className={classes.paper} elevation={3}>
        <Typography variant="h4" className={classes.title}>
          Your Patients
        </Typography>
        
        {loading ? (
          <Typography>Loading...</Typography>
        ) : patients.length === 0 ? (
          <div className={classes.noPatients}>
            <Typography variant="body1">
              You don't have any patients yet.
            </Typography>
          </div>
        ) : (
          <TableContainer className={classes.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Last Checkup Request</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient._id}>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>
                      {new Date(patient.lastCheckup).toLocaleDateString()}
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

export default PatientList;