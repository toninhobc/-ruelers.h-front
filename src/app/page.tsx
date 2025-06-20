// app/page.tsx (ou pages/index.tsx)
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'; // Importe o dynamic
import Header from '../components/Header';
import SecurityButton from '../components/SecurityButton';
// REMOVA ESTA LINHA: import MapSection from '../components/MapSection'; // Não importe diretamente aqui
import AlertPanel from '../components/AlertPanel';
import FeatureCard from '../components/FeatureCard';
import { Shield, MapPin, Bell, Users, Eye, Phone } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

// Definição das interfaces (melhor manter em um arquivo separado como types/index.ts)
interface Alert {
  id: number;
  type: 'critico' | 'danger' | 'warning' | 'low' | 'info';
  message: string;
  time: string;
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface MapAlert {
  id: number;
  type: 'critico' | 'danger' | 'warning' | 'low' | 'info';
  message: string;
  locationName: string;
  lat: number;
  lng: number;
  time: string;
}

// Carrega o MapSection dinamicamente apenas no cliente
const DynamicMapSection = dynamic(() => import('../components/MapSection'), {
  ssr: false, // Desabilita a renderização no lado do servidor
  loading: () => <p className="text-white text-center py-8">Carregando mapa...</p>, // Opcional: um fallback de carregamento
});


export default function Home(){
  const [isSecurityActive, setIsSecurityActive] = useState(false);
  
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 1, type: 'warning', message: 'Área de risco detectada - Rua das Flores', time: '2 min atrás' },
    { id: 2, type: 'info', message: 'Patrulhamento ativo na região central', time: '5 min atrás' },
  ]);

  const [mapAlerts, setMapAlerts] = useState<MapAlert[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const addAlert = (newAlertData: { type: Alert['type'], message: string }) => {
    const now = new Date();
    const formattedTime = format(now, 'HH:mm - dd/MM');

    const newAlert: Alert = {
      id: alerts.length > 0 ? Math.max(...alerts.map(a => a.id)) + 1 : 1,
      type: newAlertData.type,
      message: newAlertData.message,
      time: formattedTime,
    };
    setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
  };

  const addAlertToMap = async (alertData: {
    type: MapAlert['type'];
    message: string;
    locationName: string;
    time: string;
  }) => {
    try {
      const encodedLocation = encodeURIComponent(`${alertData.locationName}, Brasília, DF, Brasil`);
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`;
      
      const response = await axios.get(nominatimUrl, {
        headers: {
          'User-Agent': 'SecurityApp/1.0 (seu_email@exemplo.com)' // Lembre-se de substituir
        }
      });

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const newMapAlert: MapAlert = {
          id: mapAlerts.length > 0 ? Math.max(...mapAlerts.map(a => a.id)) + 1 : 1,
          type: alertData.type,
          message: alertData.message,
          locationName: alertData.locationName,
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          time: alertData.time,
        };
        setMapAlerts(prevMapAlerts => [...prevMapAlerts, newMapAlert]);
      } else {
        console.warn('Localização não encontrada para o alerta:', alertData.locationName);
      }
    } catch (error) {
      console.error('Erro ao geocodificar a localização:', error);
    }
  };

  useEffect(() => {
    if (isSecurityActive) {
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.error('Erro ao obter a localização:', error);
            alert('Não foi possível obter sua localização. Verifique as permissões do navegador ou o GPS.');
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
      } else {
        alert('Seu navegador não suporta geolocalização.');
      }
    } else {
      setUserLocation(null);
    }
  }, [isSecurityActive]);

  const features = [
    { icon: Shield, title: 'Monitoramento 24/7', description: 'Acompanhamento contínuo da sua localização e áreas de risco em tempo real.' },
    { icon: MapPin, title: 'Mapeamento Inteligente', description: 'Visualize pontos críticos, rotas seguras e áreas com maior incidência.'
},
    { icon: Bell, title: 'Alertas Instantâneos', description: 'Receba notificações imediatas sobre perigos próximos à sua localização.' },
    { icon: Users, title: 'Rede Colaborativa', description: 'Conecte-se com outros usuários e autoridades para maior segurança.' },
    { icon: Eye, title: 'Vigilância Ativa', description: 'Sistema de câmeras e sensores integrados para monitoramento completo.' },
    { icon: Phone, title: 'Emergência Rápida', description: 'Acesso direto aos serviços de emergência com um toque.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Header />
      
      <section className="relative pt-20 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-red-600/20 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30 mb-8">
            <Shield className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-300 text-sm font-medium">Tecnologia de Segurança Avançada</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Sua
            <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent"> Segurança</span>
            <br />em Tempo Real
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Monitore, proteja e navegue pela cidade com confiança. 
            Nossa tecnologia GPS avançada mantém você seguro 24 horas por dia.
          </p>
          
          <SecurityButton 
            isActive={isSecurityActive} 
            onToggle={() => setIsSecurityActive(!isSecurityActive)} 
          />
        </div>
      </section>

      <section className="px-4 mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">1,247</div>
                <div className="text-slate-400">Usuários Protegidos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">98.7%</div>
                <div className="text-slate-400">Taxa de Segurança</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">15</div>
                <div className="text-slate-400">Alertas Hoje</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 mb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* AGORA USANDO DynamicMapSection AQUI */}
            <DynamicMapSection 
              isActive={isSecurityActive} 
              userLocation={userLocation} 
              mapAlerts={mapAlerts} 
            />
          </div>
          
          <div className="space-y-6">
            <AlertPanel 
              alerts={alerts} 
              onAddAlert={addAlert} 
              onAddAlertToMap={addAlertToMap} 
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Recursos Avançados de <span className="text-blue-400">Proteção</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Tecnologia de ponta para manter você e sua família seguros em qualquer lugar da cidade.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                icon={feature.icon} 
                title={feature.title} 
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 border-t border-slate-700/50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Pronto para uma cidade mais segura?
          </h3>
          <p className="text-xl text-slate-300 mb-8">
            Junte-se a milhares de usuários que já confiam na nossa tecnologia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-xl">
              Baixar App
            </button>
            <button className="px-8 py-4 bg-slate-800/50 text-white font-semibold rounded-xl border border-slate-600 hover:bg-slate-700/50 transition-all duration-300">
              Saiba Mais
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};