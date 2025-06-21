// app/page.tsx (ou pages/index.tsx)
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '../../src/components/Header';
import SecurityButton from '../../src/components/SecurityButton';
import AlertPanel from '../../src/components/AlertPanel';
import FeatureCard from '../../src/components/FeatureCard';
import { Shield, MapPin, Bell, Users, Eye, Phone } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Importe a biblioteca uuid

// Definição das interfaces (ATUALIZADO: id agora é string)
interface Alert {
  id: string; // MUDADO PARA STRING
  type: 'critico' | 'danger' | 'warning' | 'low' | 'info';
  message: string;
  time: string;
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface MapAlert {
  id: string; // MUDADO PARA STRING
  type: 'critico' | 'danger' | 'warning' | 'low' | 'info';
  message: string;
  locationName: string;
  lat: number;
  lng: number;
  time: string;
  backendId?: number; // NOVO: Para guardar o ID original do banco de dados (number)
}

// Carrega o MapSection dinamicamente apenas no cliente
const DynamicMapSection = dynamic(() => import('../../src/components/MapSection'), {
  ssr: false,
  loading: () => <p className="text-white text-center py-8">Carregando mapa...</p>,
});

const FLASK_BACKEND_URL = 'http://localhost:5002';

export default function Home() {
  const [isSecurityActive, setIsSecurityActive] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [mapAlerts, setMapAlerts] = useState<MapAlert[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  // FUNÇÃO PARA BUSCAR ALERTAS DO BACKEND E POPULAR O MAPA E O PAINEL (ATUALIZADA PARA UUID)
  const fetchAlertsFromBackend = async () => {
    try {
      const response = await axios.get(`${FLASK_BACKEND_URL}/alertas`);
      if (response.status === 200) {
        const fetchedAlerts: MapAlert[] = await Promise.all(
          response.data.map(async (item: any) => {
            const messageContent = `Denúncia de ${item.Genero}: ${item.TipoOcorrencia || 'N/A'}. Detalhes: ${item.Descricao || 'N/A'}`;
            const timeFormatted = item.HoraOcorrencia ?
              new Date(item.HoraOcorrencia).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A';

            let lat = -15.7801; // Fallback para Brasília
            let lng = -47.9292; // Fallback para Brasília

            if (item.Localizacao && typeof item.Localizacao === 'string') {
              try {
                const encodedLocation = encodeURIComponent(`${item.Localizacao}, Brasília, DF, Brasil`);
                const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`;
                const geoResponse = await axios.get(nominatimUrl, {
                  headers: { 'User-Agent': 'SecurityApp/1.0 (seu_email@exemplo.com)' }
                });

                if (geoResponse.data && geoResponse.data.length > 0) {
                  lat = parseFloat(geoResponse.data[0].lat);
                  lng = parseFloat(geoResponse.data[0].lon);
                } else {
                  console.warn(`Geocodificação falhou para: ${item.Localizacao}. Usando coordenadas padrão.`);
                }
              } catch (geoError) {
                console.error(`Erro ao geocodificar ${item.Localizacao} para lista:`, geoError);
              }
            } else {
                 console.warn(`Localização inválida ou ausente para alerta ID ${item.id}. Usando coordenadas padrão.`);
            }

            return {
              id: uuidv4(), // AGORA USANDO UM UUID ÚNICO PARA O REACT KEY
              backendId: item.id, // Guarda o ID original do banco, se precisar dele
              type: item.ClassificacaoAlerta as MapAlert['type'],
              message: messageContent,
              locationName: item.Localizacao,
              lat: lat,
              lng: lng,
              time: timeFormatted,
            };
          })
        );
        setMapAlerts(fetchedAlerts);
      }
    } catch (error) {
      console.error('Erro ao buscar alertas do backend:', error);
    }
  };

  useEffect(() => {
    fetchAlertsFromBackend();

    const intervalId = setInterval(fetchAlertsFromBackend, 60000);

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
            console.error('Erro ao obter a localização do usuário:', error);
            setUserLocation({ lat: -15.7801, lng: -47.9292 });
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
      } else {
        setUserLocation({ lat: -15.7801, lng: -47.9292 });
      }
    } else {
      setUserLocation(null);
    }

    return () => clearInterval(intervalId);
  }, [isSecurityActive]);

  // Callback para AlertPanel (onAddAlertToMap) - AGORA ATUALIZADO PARA USAR UUID
  const handleNewAlertForMap = async (alertData: {
    id: number; // Este ID vem do Flask via resposta POST (agora backendId)
    type: MapAlert['type'];
    message: string;
    locationName: string;
    lat: number;
    lng: number;
    time: string;
  }) => {
    // Cria um novo objeto MapAlert com um ID único gerado no frontend
    const newMapAlertWithUniqueKey: MapAlert = {
      id: uuidv4(), // GERA UM UUID ÚNICO AQUI
      backendId: alertData.id, // Guarda o ID original do Flask
      type: alertData.type,
      message: alertData.message,
      locationName: alertData.locationName,
      lat: alertData.lat,
      lng: alertData.lng,
      time: alertData.time,
    };
    setMapAlerts(prevMapAlerts => [...prevMapAlerts, newMapAlertWithUniqueKey]);
  };


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
    <div className="min-h-screen">
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
                {/* O contador de alertas aqui agora refletirá o tamanho de `mapAlerts` */}
                <div className="text-3xl font-bold text-red-400 mb-2">{mapAlerts.length}</div>
                <div className="text-slate-400">Alertas Hoje</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 mb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* DynamicMapSection recebe os alertas do banco */}
            <DynamicMapSection
              isActive={isSecurityActive}
              userLocation={userLocation}
              mapAlerts={mapAlerts}
            />
          </div>

          <div className="space-y-6">
            <AlertPanel
              onAddAlert={() => {}}
              onAddAlertToMap={handleNewAlertForMap}
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
                key={index} // Se features é estático e não muda, index pode ser usado aqui. Se for dinâmico, use um ID único.
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
}