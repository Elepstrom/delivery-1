import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SearchIcon, LocationMarkerIcon, RefreshIcon } from '@heroicons/react/outline';
import 'leaflet/dist/leaflet.css';

const vehicleIcons = {
  'en route': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  'en pause': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  'terminé': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
};

function LocationMarker() {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker 
      position={position}
      icon={new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })}
    >
      <Popup>Votre position actuelle</Popup>
    </Marker>
  );
}

function LiveTracking() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [routeHistory, setRouteHistory] = useState([]);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/vehicules');
        setVehicles(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        setIsLoading(false);
      }
    };

    const socket = io('http://localhost:8081', {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"]
      }
    });

    socket.on('locationUpdated', (data) => {
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === data.vehicleId 
          ? { ...vehicle, latitude: data.latitude, longitude: data.longitude, statut: data.statut }
          : vehicle
      ));
    });

    fetchInitialData();
    return () => socket.disconnect();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.statut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 animate-fade-in">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold gradient-text">Suivi en Temps Réel</h2>
            <div className="flex space-x-4">
              <div className="relative">
                <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un véhicule..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                  showUserLocation 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setShowUserLocation(!showUserLocation)}
              >
                <LocationMarkerIcon className="h-5 w-5 mr-2" />
                Ma Position
              </button>
            </div>
          </div>
          
          <div className="h-[600px] rounded-xl overflow-hidden shadow-inner">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center bg-gray-50">
                <RefreshIcon className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : (
              <MapContainer
                center={[46.603354, 1.888334]}
                zoom={6}
                className="h-full w-full"
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                {showUserLocation && <LocationMarker />}

                {filteredVehicles.map(vehicle => (
                  <Marker
                    key={vehicle.id}
                    position={[vehicle.latitude, vehicle.longitude]}
                    icon={vehicleIcons[vehicle.statut]}
                  >
                    <Popup className="rounded-lg overflow-hidden">
                      <div className="p-3">
                        <h3 className="font-bold text-lg mb-2">{vehicle.nom}</h3>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Conducteur:</span> {vehicle.conducteur}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Statut:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              vehicle.statut === 'en route' ? 'bg-green-100 text-green-800' :
                              vehicle.statut === 'en pause' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {vehicle.statut}
                            </span>
                          </p>
                        </div>
                        <button
                          className="mt-3 w-full px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                          onClick={() => {
                            setSelectedVehicle(vehicle.id);
                            axios.get(`http://localhost:3000/api/historique/${vehicle.id}`)
                              .then(response => setRouteHistory(response.data))
                              .catch(console.error);
                          }}
                        >
                          Voir l'historique
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {selectedVehicle && routeHistory.length > 0 && (
                  <Polyline
                    positions={routeHistory.map(point => [point.latitude, point.longitude])}
                    color="#3B82F6"
                    weight={3}
                    opacity={0.7}
                  />
                )}
              </MapContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveTracking;