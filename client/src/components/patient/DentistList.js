// client/src/components/patient/DentistList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  makeStyles 
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
  },
  loading: {
    textAlign: 'center',
    padding: theme.spacing(3),
  },
}));

const DentistList = () => {
  const classes = useStyles();
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const res = await axios.get('/api/dentists');
        setDentists(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dentists:', err);
        setLoading(false);
      }
    };

    fetchDentists();
  }, []);

  return (
    <Container className={classes.container} maxWidth="md">
      <Typography variant="h4" className={classes.title}>
        Available Dentists
      </Typography>
      
      {loading ? (
        <div className={classes.loading}>
          <Typography>Loading...</Typography>
        </div>
      ) : dentists.length === 0 ? (
        <Paper style={{ padding: '1rem', textAlign: 'center' }}>
          <Typography variant="body1">
            No dentists available at the moment.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {dentists.map((dentist) => (
            <Grid item key={dentist._id} xs={12} sm={6} md={4}>
              <Card className={classes.card} elevation={3}>
                <CardContent className={classes.cardContent}>
                  <Typography gutterBottom variant="h5" component="h2">
                    Dr. {dentist.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Email: {dentist.email}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    component={Link}
                    to={`/patient/request-checkup/${dentist._id}`}
                  >
                    Request Checkup
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default DentistList;

