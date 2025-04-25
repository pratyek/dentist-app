import { useSocket } from '../context/SocketContext';

const PatientDashboard = () => {
  const [checkups, setCheckups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { checkupUpdates, clearCheckupUpdate } = useSocket();

  useEffect(() => {
    const fetchCheckups = async () => {
      try {
        const response = await axios.get('/api/checkups/patient');
        setCheckups(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch checkup requests');
        setLoading(false);
      }
    };

    fetchCheckups();
  }, []);

  // Update checkup status when receiving updates from socket
  useEffect(() => {
    if (Object.keys(checkupUpdates).length > 0) {
      console.log('Received checkup updates:', checkupUpdates);
      setCheckups(prevCheckups => 
        prevCheckups.map(checkup => {
          const update = checkupUpdates[checkup._id];
          if (update) {
            // Clear the update after applying it
            clearCheckupUpdate(checkup._id);
            return {
              ...checkup,
              status: update.status,
              updatedAt: update.updatedAt,
              results: update.results,
              dentistName: update.dentistName
            };
          }
          return checkup;
        })
      );
    }
  }, [checkupUpdates, clearCheckupUpdate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Checkups</h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid gap-6">
          {checkups.map(checkup => (
            <div key={checkup._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">Checkup Request</h2>
                  <p className="text-gray-600">Status: {checkup.status}</p>
                  <p className="text-gray-600">Dentist: {checkup.dentistName}</p>
                  <p className="text-gray-600">
                    Date: {new Date(checkup.date).toLocaleDateString()}
                  </p>
                </div>
                {checkup.status === 'completed' && (
                  <button
                    onClick={() => handleViewResults(checkup)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    View Results
                  </button>
                )}
              </div>
              
              {checkup.results && (
                <div className="mt-4">
                  <h3 className="font-semibold">Diagnosis:</h3>
                  <p className="whitespace-pre-wrap">{checkup.results.diagnosis}</p>
                  
                  <h3 className="font-semibold mt-4">Recommendations:</h3>
                  <p className="whitespace-pre-wrap">{checkup.results.recommendations}</p>
                  
                  {checkup.results.images && checkup.results.images.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold">Images:</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {checkup.results.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image.url}
                              alt={`Checkup image ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            {image.description && (
                              <p className="text-sm text-gray-600 mt-1">{image.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard; 