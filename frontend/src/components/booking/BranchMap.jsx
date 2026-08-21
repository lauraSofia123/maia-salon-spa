import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IconMapPin, IconNavigation, IconX } from '@tabler/icons-react';
import Badge from '../ui/Badge';

const iconDefault = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const iconActive = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [32, 52],
  iconAnchor: [16, 52],
  popupAnchor: [1, -46],
  shadowSize: [41, 41],
  className: 'marker-active',
});

function MapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1 });
  }, [center, zoom, map]);
  return null;
}

export default function BranchMap({
  branches,
  selectedBranch,
  onSelectBranch,
  onClose,
  height = '400px',
}) {
  const [mapCenter, setMapCenter] = useState([4.711, -74.072]);
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    if (selectedBranch?.latitud && selectedBranch?.longitud) {
      setMapCenter([selectedBranch.latitud, selectedBranch.longitud]);
      setMapZoom(15);
    } else if (branches.length > 0) {
      const first = branches[0];
      setMapCenter([first.latitud, first.longitud]);
      setMapZoom(12);
    }
  }, [selectedBranch, branches]);

  const handleMarkerClick = (branch) => {
    onSelectBranch(branch);
    setMapCenter([branch.latitud, branch.longitud]);
    setMapZoom(16);
  };

  const getDirectionsUrl = (lat, lng) => {
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${lat},${lng}`;
  };

  if (!branches.length) {
    return (
      <div className="w-full h-[400px] rounded-xl bg-neutral-100 flex items-center justify-center">
        <div className="text-center p-6">
          <IconMapPin className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
          <p className="text-neutral-500">No hay sedes disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-neutral-200" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <MapView center={mapCenter} zoom={mapZoom} />
        {branches.map((branch) => (
          branch.latitud && branch.longitud && (
            <Marker
              key={branch.id}
              position={[branch.latitud, branch.longitud]}
              icon={selectedBranch?.id === branch.id ? iconActive : iconDefault}
              onClick={() => handleMarkerClick(branch)}
            >
              <Popup
                autoClose={false}
                closeOnClick={false}
                className="leaflet-popup-custom"
              >
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-neutral-900">
                        {branch.name}
                      </h4>
                      <p className="text-neutral-600 text-sm mt-1 flex items-center gap-1">
                        <IconMapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="line-clamp-1">{branch.address}</span>
                      </p>
                      {branch.phone && (
                        <p className="text-neutral-500 text-sm mt-1">
                          {branch.phone}
                        </p>
                      )}
                    </div>
                    {selectedBranch?.id === branch.id && onClose && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                        }}
                        className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                        aria-label="Cerrar"
                      >
                        <IconX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(getDirectionsUrl(branch.latitud, branch.longitud), '_blank', 'noopener');
                      }}
                      className="flex-1 btn-primary py-2 px-3 text-sm flex items-center justify-center gap-1"
                    >
                      <IconNavigation className="w-4 h-4" />
                      Cómo llegar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBranch(branch);
                      }}
                      className="flex-1 btn-secondary py-2 px-3 text-sm flex items-center justify-center gap-1"
                    >
                      Seleccionar
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {selectedBranch && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-72">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-neutral-200 animate-slide-up">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-semibold text-neutral-900">
                  {selectedBranch.name}
                </h4>
                <p className="text-neutral-600 text-sm mt-1 flex items-center gap-1">
                  <IconMapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="line-clamp-1">{selectedBranch.address}</span>
                </p>
                {selectedBranch.phone && (
                  <p className="text-neutral-500 text-sm mt-1">{selectedBranch.phone}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Cerrar"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <a
                href={getDirectionsUrl(selectedBranch.latitud, selectedBranch.longitud)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-primary py-2 px-3 text-sm flex items-center justify-center gap-1"
              >
                <IconNavigation className="w-4 h-4" />
                Cómo llegar
              </a>
              <button
                onClick={() => onSelectBranch(selectedBranch)}
                className="flex-1 btn-secondary py-2 px-3 text-sm flex items-center justify-center gap-1"
              >
                Confirmar sede
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}