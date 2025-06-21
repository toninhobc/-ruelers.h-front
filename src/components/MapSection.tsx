// src/components/MapSection.tsx
'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// --- INÍCIO DA CORREÇÃO DOS ÍCONES ---

// Essencial para corrigir o problema dos ícones padrão do Leaflet com pacotes como Webpack/Next.js
// Deve vir antes de qualquer criação de L.Icon.
if (typeof window !== 'undefined') { // Garante que só roda no navegador
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;

  // @ts-ignore
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/images/marker-icon-2x.png', // Verifique se você tem esta imagem ou use a mesma do iconUrl
    iconUrl: '/leaflet/images/marker-icon.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
  });
}

// Se você está criando ícones customizados, mantenha esta função
const createIcon = (iconUrl: string, shadowUrl: string = '/leaflet/images/marker-shadow.png') => {
    return new L.Icon({
        iconUrl,
        iconRetinaUrl: iconUrl, // Pode usar uma versão de alta resolução se tiver
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });
};

// Ícone do usuário - use o caminho corrigido
const userIcon = createIcon('/leaflet/images/marker-icon.png');
// Ícone padrão de alerta (fallback) - use o caminho corrigido
const defaultAlertIcon = createIcon('/leaflet/images/marker-icon-grey.png');


const alertIcons = {
    // Caminhos corrigidos para as imagens personalizadas
    critico: createIcon('/leaflet/images/marker-icon-red.png'),
    danger: createIcon('/leaflet/images/marker-icon-orange.png'),
    warning: createIcon('/leaflet/images/marker-icon-yellow.png'),
    low: createIcon('/leaflet/images/marker-icon-green.png'),
    info: createIcon('/leaflet/images/marker-icon-blue.png'),
};

const getAlertMarkerIcon = (type: MapAlert['type']) => {
    return alertIcons[type] || defaultAlertIcon;
};
// --- FIM DA CORREÇÃO DOS ÍCONES ---


// Interfaces
interface UserLocation {
  lat: number;
  lng: number;
}
// Remova 'let MapAlertCounter : MapAlert[] = []' daqui, não é o local correto para isso.
// Se você precisa de um contador de alertas, ele deve ser um estado React dentro do componente Home ou MapSection.

interface MapAlert {
  id: string;
  type: 'critico' | 'danger' | 'warning' | 'low' | 'info';
  message: string;
  locationName: string;
  lat: number;
  lng: number;
  time: string;
  backendId?: number;
  probability?: number; // Probabilidade de risco para este alerta específico do BD
}

interface MapSectionProps {
  isActive: boolean;
  mapAlerts: MapAlert[];
  userLocation: UserLocation | null;
  crimeProbability: number | null; // Probabilidade de crime na localização do usuário (da IA)
  probabilityLocation: UserLocation | null; // Localização para o círculo da IA
}

// Componente para centralizar o mapa
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom() || 13);
  }, [center, map]);
  return null;
}

const MapSection: React.FC<MapSectionProps> = ({ isActive, mapAlerts, userLocation, crimeProbability, probabilityLocation }) => {
  const initialBrasiliaCenter: [number, number] = [-15.7801, -47.9292];
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialBrasiliaCenter);

  useEffect(() => {
    // A centralização agora prioriza:
    // 1. Localização do usuário (se monitoramento ativo e usuário existir)
    // 2. Localização do círculo de probabilidade geral (da IA)
    // 3. Padrão de Brasília
    if (isActive && userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    } else if (probabilityLocation) {
      setMapCenter([probabilityLocation.lat, probabilityLocation.lng]);
    } else {
      setMapCenter(initialBrasiliaCenter);
    }
  }, [isActive, userLocation, probabilityLocation]); // Dependências ajustadas

  const getCircleColorForProbability = (probability: number | null): string => {
    if (probability === null || probability === undefined) return 'transparent';
    if (probability > 0.80) return '#ff4d4d'; // Crítico (Vermelho)
    if (probability > 0.60) return '#ffa500'; // Alto Risco (Laranja)
    if (probability > 0.40) return '#ffc107'; // Médio Risco (Amarelo)
    if (probability > 0.20) return '#28a745'; // Baixo Risco (Verde)
    return '#007bff'; // Informativo (Azul)
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3"><MapPin className="w-6 h-6 text-blue-400" /><h3 className="text-xl font-bold text-white">Mapa de Segurança</h3></div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-600/50 text-slate-400 border border-slate-600/30'}`}>{isActive ? 'Monitoramento Ativo' : 'Offline'}</div>
          </div>
      </div>

      <div className="relative h-96 md:h-[500px]">
        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full rounded-b-2xl">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterUpdater center={mapCenter} />
          
          {/* Círculo de probabilidade da IA para a localização do USUÁRIO */}
          {crimeProbability !== null && probabilityLocation && (
            <Circle
              center={[probabilityLocation.lat, probabilityLocation.lng]}
              radius={500} // Ajuste conforme a área de abrangência da IA
              pathOptions={{ color: getCircleColorForProbability(crimeProbability), fillColor: getCircleColorForProbability(crimeProbability), fillOpacity: 0.3 }}
            >
              <Popup>Risco na sua localização: {(crimeProbability * 100).toFixed(1)}%</Popup>
            </Circle>
          )}

          {/* Marcador da localização do USUÁRIO (aparece apenas se 'isActive') */}
          {isActive && userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>Você está aqui!</Popup>
            </Marker>
          )}

          {/* Mapeia os ALERTAS do banco de dados (cada um com seu próprio círculo de probabilidade) */}
          {mapAlerts.map(alert => (
            <Fragment key={alert.id}>
              <Marker position={[alert.lat, alert.lng]} icon={getAlertMarkerIcon(alert.type)}>
                <Popup>
                  <div className="font-semibold text-slate-800">{alert.type.toUpperCase()}</div>
                  <div className="text-sm text-slate-700">{alert.message}</div>
                  <div className="text-xs text-slate-500 mt-1">{alert.locationName} - {alert.time}</div>
                </Popup>
              </Marker>
              {/* O círculo para cada ALERTA INDIVIDUAL */}
              {alert.probability !== undefined && (
                <Circle
                  center={[alert.lat, alert.lng]}
                  radius={500} // Raio do círculo do alerta, pode ser diferente do raio da IA
                  pathOptions={{ color: getCircleColorForProbability(alert.probability), fillColor: getCircleColorForProbability(alert.probability), fillOpacity: 0.25, weight: 1.5 }}
                >
                  <Popup>Risco estimado neste alerta: {(alert.probability * 100).toFixed(1)}%</Popup>
                </Circle>
              )}
            </Fragment>
          ))}
          
          {/* Camada de "Monitoramento Offline" */}
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 text-slate-400 text-lg font-semibold z-10 rounded-b-2xl">
              Monitoramento Offline
            </div>
          )}
        </MapContainer>
      </div>
      <div className="p-4 bg-slate-900/50">
      </div>

      {/* Legend */}
      <div className="p-4 bg-slate-900/50">
        <div className="flex flex-wrap gap-4 justify-center text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-slate-300">Crítico</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
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
            <span className="text-slate-300">Informativo</span>
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