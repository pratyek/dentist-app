import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const DentistDashboard = () => {
  const [checkups, setCheckups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const { user } = useAuth();
  const { checkupUpdates, clearCheckupUpdate } = useSocket();

  // ... existing fetchCheckups useEffect ...

  // Update checkup status when receiving updates from socket
  useEffect(() => {
    if (Object.keys(checkupUpdates).length > 0) {
      setCheckups(prevCheckups => 
        prevCheckups.map(checkup => {
          const update = checkupUpdates[checkup._id];
          if (update) {
            clearCheckupUpdate(checkup._id);
            return {
              ...checkup,
              status: update.status,
              updatedAt: update.updatedAt
            };
          }
          return checkup;
        })
      );
    }
  }, [checkupUpdates, clearCheckupUpdate]);

  const handleViewResults = (checkup) => {
    setSelectedCheckup(checkup);
    setShowResultsModal(true);
  };

  const handleCloseResults = () => {
    setSelectedCheckup(null);
    setShowResultsModal(false);
  };

  // ... existing render code ...

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dentist Dashboard</h1>
      
      {/* ... existing checkup list rendering ... */}

      {/* Results Modal */}
      {showResultsModal && selectedCheckup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Checkup Results</h2>
              <button
                onClick={handleCloseResults}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Patient Information</h3>
                <p>Name: {selectedCheckup.patientName}</p>
                <p>Email: {selectedCheckup.patientEmail}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Checkup Details</h3>
                <p>Date: {new Date(selectedCheckup.date).toLocaleDateString()}</p>
                <p>Time: {selectedCheckup.time}</p>
                <p>Status: {selectedCheckup.status}</p>
              </div>

              {selectedCheckup.results && (
                <div>
                  <h3 className="font-semibold">Results</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedCheckup.results}</p>
                  </div>
                </div>
              )}

              {selectedCheckup.images && selectedCheckup.images.length > 0 && (
                <div>
                  <h3 className="font-semibold">Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCheckup.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Checkup image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DentistDashboard; 