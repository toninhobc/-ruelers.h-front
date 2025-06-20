// components/MapSection.tsx
'use client'; // Necessário porque vamos usar hooks e APIs do navegador

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Importe o CSS do Leaflet
import L from 'leaflet'; // Importe o objeto Leaflet para ícones customizados
import { MapPin } from 'lucide-react';

// Fix para os ícones padrão do Leaflet que quebram com Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
  iconUrl: 'leaflet/images/marker-icon.png',
  shadowUrl: 'leaflet/images/marker-shadow.png',
});


// Interface para a localização do usuário
interface UserLocation {
  lat: number;
  lng: number;
}

// Interface para um Alerta (adaptada do AlertPanel)
interface MapAlert {
  id: number;
  type: 'warning' | 'danger' | 'info' | 'default';
  message: string;
  locationName: string; // O nome do local digitado no formulário
  lat: number; // Latitude do alerta no mapa
  lng: number; // Longitude do alerta no mapa
  time: string; // Hora do alerta
}

interface MapSectionProps {
  isActive: boolean;
  // Nova prop: alertas a serem exibidos no mapa
  mapAlerts: MapAlert[]; // Lista de alertas com coordenadas
  userLocation: UserLocation | null; // Localização atual do usuário
}

// Componente auxiliar para centralizar o mapa
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

const MapSection: React.FC<MapSectionProps> = ({ isActive, mapAlerts, userLocation }) => {
  // Coordenadas iniciais de Brasília (Centro)
  const initialBrasiliaCenter: [number, number] = [-15.7801, -47.9292];
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialBrasiliaCenter);

  // Efeito para atualizar o centro do mapa se a localização do usuário mudar
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);


  // Função para determinar o ícone do alerta
  const getAlertMarkerIcon = (type: MapAlert['type']) => {
    let iconUrl = '';
    let iconSize: [number, number] = [25, 41]; // Tamanho padrão de marcador Leaflet
    let iconAnchor: [number, number] = [12, 41]; // Ponto de ancoragem do ícone

    switch (type) {
      case 'danger':
        iconUrl = '/leaflet/images/marker-icon-red.png'; // Crie seu próprio marcador vermelho
        break;
      case 'warning':
        iconUrl = '/leaflet/images/marker-icon-yellow.png'; // Crie seu próprio marcador amarelo
        break;
      case 'info':
        iconUrl = '/leaflet/images/marker-icon-blue.png'; // Marcador azul (padrão)
        break;
      default:
        iconUrl = 'leaflet/images/marker-icon.png'; // Marcador padrão
        break;
    }

    return L.icon({
      iconUrl: iconUrl,
      iconRetinaUrl: iconUrl, // Use a mesma URL para retina se não tiver uma separada
      shadowUrl: 'leaflet/images/marker-shadow.png',
      iconSize: iconSize,
      iconAnchor: iconAnchor,
      popupAnchor: [1, -34], // Ajuste o popup para aparecer acima do ícone
    });
  };

  // Ícone customizado para a localização do usuário (se necessário, ou use o padrão azul)
  const userIcon = L.icon({
    iconUrl: 'leaflet/images/marker-icon-blue.png', // Ou crie um ícone especial para o usuário
    iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
    shadowUrl: 'leaflet/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });


  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Mapa de Segurança</h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-slate-600/50 text-slate-400 border border-slate-600/30'
          }`}>
            {isActive ? 'Monitoramento Ativo' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-96"> {/* Removido bg-gradient-to-br e grid pattern, pois o Leaflet cuidará disso */}
        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full rounded-b-2xl">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Componente para atualizar o centro do mapa dinamicamente */}
          <MapCenterUpdater center={mapCenter} />

          {/* Marcador para a localização do usuário */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>Você está aqui!</Popup>
            </Marker>
          )}

          {/* Marcadores para os alertas */}
          {mapAlerts.map(alert => (
            <Marker key={alert.id} position={[alert.lat, alert.lng]} icon={getAlertMarkerIcon(alert.type)}>
              <Popup>
                <div className="font-semibold text-slate-800">{alert.type === 'danger' ? 'ALERTA DE PERIGO!' : alert.type === 'warning' ? 'ATENÇÃO!' : 'Novo Alerta'}</div>
                <div className="text-sm text-slate-700">{alert.message}</div>
                <div className="text-xs text-slate-500 mt-1">{alert.locationName} - {alert.time}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="p-4 bg-slate-900/50">
        <div className="flex flex-wrap gap-4 justify-center text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-slate-300">Alto Risco</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-slate-300">Médio Risco</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-slate-300">Baixo Risco</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-slate-300">Sua Localização</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSection;