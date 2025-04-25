import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api'
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button,
  Card,
  CardContent,
  IconButton,
  makeStyles 
} from '@material-ui/core';
import { Add as AddIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';
import { AuthContext } from '../../context/AuthContext';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(2),
    textAlign: 'center',
  },
  formControl: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  imagePreview: {
    width: '100%',
    height: 'auto',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    maxHeight: '200px',
    objectFit: 'cover',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  imageCard: {
    marginBottom: theme.spacing(2),
    position: 'relative',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  deleteButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: theme.palette.error.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
  imageUploadSection: {
    textAlign: 'center',
    marginTop: theme.spacing(3),
  },
  addImageButton: {
    marginTop: theme.spacing(2),
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
}));

const SubmitCheckupResult = () => {
  const classes = useStyles();
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { emitEvent } = useSocket();
  const { user } = useContext(AuthContext);
  
  const [checkupRequest, setCheckupRequest] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [images, setImages] = useState([{ file: null, preview: null, description: '' }]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCheckupRequest = async () => {
      try {
        const res = await api.get('/api/dentists/checkup-requests');
        const foundRequest = res.data.find(req => req._id === requestId);
        
        if (!foundRequest) {
          toast.error('Checkup request not found');
          navigate('/dentist/dashboard');
          return;
        }
        
        if (foundRequest.status === 'completed') {
          toast.info('This checkup has already been completed');
          navigate('/dentist/dashboard');
          return;
        }
        
        setCheckupRequest(foundRequest);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching checkup request:', err);
        toast.error('Error fetching checkup request details');
        navigate('/dentist/dashboard');
      }
    };

    fetchCheckupRequest();
  }, [requestId, navigate]);

  const handleImageChange = (index, e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }
    
    const newImages = [...images];
    
    newImages[index] = {
      ...newImages[index],
      file,
      preview: URL.createObjectURL(file)
    };
    
    setImages(newImages);
  };

  const handleDescriptionChange = (index, e) => {
    const newImages = [...images];
    newImages[index].description = e.target.value;
    setImages(newImages);
  };

  const addImageField = () => {
    setImages([...images, { file: null, preview: null, description: '' }]);
  };

  const removeImageField = (index) => {
    if (images.length <= 1) {
      toast.error('You need at least one image');
      return;
    }
    
    const newImages = [...images];
    
    // Release object URL to prevent memory leaks
    if (newImages[index].preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!diagnosis.trim()) {
      toast.error('Please provide a diagnosis');
      return;
    }
    
    if (!recommendations.trim()) {
      toast.error('Please provide recommendations');
      return;
    }
    
    const hasValidImage = images.some(img => img.file);
    if (!hasValidImage) {
      toast.error('Please upload at least one image');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('checkupRequestId', requestId);
      formData.append('diagnosis', diagnosis);
      formData.append('recommendations', recommendations);
      
      // Add images and descriptions
      images.forEach((image, index) => {
        if (image.file) {
          formData.append('images', image.file);
          formData.append(`descriptions[${index}]`, image.description);
        }
      });
      
      await api.post('/api/checkup-results', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Emit socket event for checkup result submission
      emitEvent('checkup_result_submitted', {
        requestId,
        dentistId: user.id,
        dentistName: user.name,
        patientId: checkupRequest.patient._id,
        patientName: checkupRequest.patient.name,
        results: {
          diagnosis,
          recommendations,
          images: images.map(img => ({
            url: img.preview,
            description: img.description
          }))
        }
      });
      
      toast.success('Checkup results submitted successfully');
      navigate('/dentist/dashboard');
    } catch (err) {
      console.error('Error submitting checkup results:', err);
      toast.error('Failed to submit checkup results');
      setSubmitting(false);
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
        <Typography variant="h4" className={classes.title}>
          Submit Checkup Results
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>Patient:</strong> {checkupRequest.patient.name}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {checkupRequest.patient.email}
            </Typography>
            <Typography variant="body1">
              <strong>Request Date:</strong> {new Date(checkupRequest.requestDate).toLocaleDateString()}
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
        
        <form onSubmit={handleSubmit}>
          <TextField
            className={classes.formControl}
            variant="outlined"
            fullWidth
            label="Diagnosis"
            multiline
            minRows={4}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
          />
          
          <TextField
            className={classes.formControl}
            variant="outlined"
            fullWidth
            label="Recommendations"
            multiline
            minRows={4}
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            required
          />
          
          <Typography variant="h6" className={classes.imageUploadSection}>
            Upload Images:
          </Typography>
          
          {images.map((image, index) => (
            <Card key={index} className={classes.imageCard} elevation={2}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id={`image-upload-${index}`}
                      type="file"
                      onChange={(e) => handleImageChange(index, e)}
                    />
                    <label htmlFor={`image-upload-${index}`}>
                      <Button
                        variant="contained"
                        color="primary"
                        component="span"
                        fullWidth
                      >
                        {image.preview ? 'Change Image' : 'Upload Image'}
                      </Button>
                    </label>
                  </Grid>
                  
                  {image.preview && (
                    <Grid item xs={12}>
                      <img
                        src={image.preview}
                        alt={`Preview ${index}`}
                        className={classes.imagePreview}
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      label="Image Description"
                      value={image.description}
                      onChange={(e) => handleDescriptionChange(index, e)}
                    />
                  </Grid>
                </Grid>
                
                <IconButton
                  className={classes.deleteButton}
                  size="small"
                  onClick={() => removeImageField(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          ))}
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={addImageField}
            className={classes.addImageButton}
          >
            Add Another Image
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className={classes.submitButton}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Checkup Results'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default SubmitCheckupResult;