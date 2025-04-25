
// client/src/components/patient/CheckupDetails.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button,
  Card,
  CardMedia,
  CardContent,
  Divider,
  makeStyles 
} from '@material-ui/core';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  imageCard: {
    marginBottom: theme.spacing(2),
  },
  cardMedia: {
    height: 0,
    paddingTop: '75%', // 4:3 aspect ratio
  },
  exportButton: {
    marginTop: theme.spacing(2),
  },
  pending: {
    marginTop: theme.spacing(3),
    textAlign: 'center',
    padding: theme.spacing(3),
  },
}));

const CheckupDetails = () => {
  const classes = useStyles();
  const { requestId } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  
  const [checkupRequest, setCheckupRequest] = useState(null);
  const [checkupResult, setCheckupResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch checkup request and result
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, get the checkup request
        const requestRes = await api.get(`/api/patients/checkup-requests`);
        const foundRequest = requestRes.data.find(req => req._id === requestId);
        
        if (!foundRequest) {
          toast.error('Checkup request not found');
          navigate('/patient/dashboard');
          return;
        }
        
        setCheckupRequest(foundRequest);
        
        // If the request is completed, fetch the result
        if (foundRequest.status === 'completed') {
          try {
            const resultRes = await api.get(`/api/checkup-results/${requestId}`);
            setCheckupResult(resultRes.data);
          } catch (err) {
            console.error('Error fetching checkup result:', err);
            toast.error('Error fetching checkup result');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching checkup request:', err);
        toast.error('Error fetching checkup details');
        navigate('/patient/dashboard');
      }
    };

    fetchData();
  }, [requestId, navigate]);

  // Function to export as PDF
  const exportToPDF = () => {
    if (!contentRef.current) return;
    
    toast.info('Generating PDF, please wait...');
    
    const input = contentRef.current;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`dental-checkup-${requestId}.pdf`);
      
      toast.success('PDF generated successfully');
    });
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
      <div ref={contentRef}>
        <Paper className={classes.paper} elevation={3}>
          <Typography variant="h4" className={classes.title}>
            Checkup Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                <strong>Dentist:</strong> Dr. {checkupRequest.dentist.name}
              </Typography>
              <Typography variant="body1">
                <strong>Request Date:</strong> {new Date(checkupRequest.requestDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong> {checkupRequest.status}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                <strong>Reason for Checkup:</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                {checkupRequest.reason}
              </Typography>
            </Grid>
          </Grid>
          
          {checkupRequest.status === 'pending' ? (
            <div className={classes.pending}>
              <Typography variant="h6">
                Your checkup request is still pending.
              </Typography>
              <Typography variant="body1">
                You'll be able to view the results once the dentist completes your checkup.
              </Typography>
            </div>
          ) : checkupResult ? (
            <>
              <Divider style={{ margin: '2rem 0 1rem' }} />
              
              <Typography variant="h5" className={classes.sectionTitle}>
                Checkup Results
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Diagnosis:
              </Typography>
              <Typography variant="body1" paragraph>
                {checkupResult.diagnosis}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Recommendations:
              </Typography>
              <Typography variant="body1" paragraph>
                {checkupResult.recommendations}
              </Typography>
              
              {checkupResult.images && checkupResult.images.length > 0 && (
                <>
                  <Typography variant="h6" className={classes.sectionTitle}>
                    Dental Images:
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {checkupResult.images.map((image, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card className={classes.imageCard} elevation={2}>
                          <CardMedia
                            className={classes.cardMedia}
                            image={`/${image.path}`}
                            title={`Dental image ${index + 1}`}
                          />
                          <CardContent>
                            <Typography variant="body2" color="textSecondary">
                              {image.description || 'No description provided'}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}
            </>
          ) : (
            <div className={classes.pending}>
              <Typography variant="body1">
                Result data not available.
              </Typography>
            </div>
          )}
        </Paper>
      </div>
      
      {checkupRequest.status === 'completed' && checkupResult && (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          className={classes.exportButton}
          onClick={exportToPDF}
        >
          Export as PDF
        </Button>
      )}
    </Container>
  );
};

export default CheckupDetails;