import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { SearchIcon, RefreshIcon } from '@heroicons/react/outline';

function VehicleStatusBadge({ status }) {
  const statusStyles = {
    'en route': 'bg-green-100 text-green-800',
    'en pause': 'bg-yellow-100 text-yellow-800',
    'terminé': 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

function VehicleCard({ vehicle }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 card-hover animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold">
                {vehicle.nom.charAt(0)}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{vehicle.nom}</h3>
              <p className="text-sm text-gray-500">Conducteur: {vehicle.conducteur}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <VehicleStatusBadge status={vehicle.statut} />
          {vehicle.latitude && vehicle.longitude && (
            <div className="text-xs text-gray-500">
              <p>Lat: {vehicle.latitude.toFixed(4)}</p>
              <p>Long: {vehicle.longitude.toFixed(4)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/vehicules');
        setVehicles(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des véhicules');
        setIsLoading(false);
      }
    };

    const socket = io('http://localhost:8081');

    socket.on('locationUpdated', (data) => {
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === data.vehicleId 
          ? { ...vehicle, latitude: data.latitude, longitude: data.longitude, statut: data.statut }
          : vehicle
      ));
    });

    fetchVehicles();
    return () => socket.disconnect();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.conducteur.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vehicle.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
            <h2 className="text-2xl font-bold gradient-text">Liste des Véhicules</h2>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="relative">
                <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all w-full sm:w-auto"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="en route">En route</option>
                <option value="en pause">En pause</option>
                <option value="terminé">Terminé</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshIcon className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredVehicles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Aucun véhicule trouvé
                </div>
              ) : (
                filteredVehicles.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VehicleList;