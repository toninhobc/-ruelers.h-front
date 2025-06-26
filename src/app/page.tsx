// app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react'; // Importar useRef
import dynamic from 'next/dynamic';
import Header from '../../src/components/Header';
import SecurityButton from '../../src/components/SecurityButton';
import AlertPanel from '../../src/components/AlertPanel';
import FeatureCard from '../../src/components/FeatureCard';
import RiskPopup from '../../src/components/RiskPopup';
import { Shield, MapPin, Bell, Users, Eye, Phone } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Definição das interfaces
interface Alert {
  id: string;
  type: 'critico' | 'danger' | 'warning' | 'low' | 'info';
  message: string;
  time: string;
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface MapAlert {
  id: string;
  type: 'critico' | 'danger' | 'warning' | 'low' | 'info';
  message: string;
  locationName: string;
  lat: number;
  lng: number;
  time: string;
  backendId?: number;
  probability?: number;
}

// Carrega o MapSection dinamicamente apenas no cliente
const DynamicMapSection = dynamic(() => import('../../src/components/MapSection'), {
  ssr: false,
  loading: () => <p className="text-white text-center py-8">Carregando mapa...</p>,
});

const FLASK_BACKEND_URL = 'http://localhost:5002';
const FLASK_AI_URL = 'http://localhost:1801';

export default function Home() {
  const [isSecurityActive, setIsSecurityActive] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [mapAlerts, setMapAlerts] = useState<MapAlert[]>([]);// Use este para os alertas do banco de dados
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const [crimeProbability, setCrimeProbability] = useState<number | null>(null);
  const [probabilityCircleLocation, setProbabilityCircleLocation] = useState<UserLocation | null>(null);

  // Ref para controlar se a probabilidade da IA já foi buscada para a sessão atual
  const hasFetchedCrimeProbabilityOnce = useRef(false);

  // Estado para controlar a visibilidade do pop-up
  const [isPopupVisible, setIsPopupVisible] = useState(true); // TODO: ALTERAR ISSO !!!!!!!!!!!!!!!!!!!!!!!!


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
              id: uuidv4(),
              backendId: item.id,
              type: item.ClassificacaoAlerta as MapAlert['type'],
              message: messageContent,
              locationName: item.Localizacao,
              lat: lat,
              lng: lng,
              time: timeFormatted,
              // *** PONTO CRÍTICO: Garanta que 'ProbabilidadeRisco' venha do seu backend para cada alerta! ***
              // Se o Flask não enviar isso, o círculo não aparecerá para o alerta.
              probability: item.ProbabilidadeRisco !== undefined && item.ProbabilidadeRisco !== null
                           ? parseFloat(item.ProbabilidadeRisco) : undefined,
            };
          })
        );
        setMapAlerts(fetchedAlerts);
      }
    } catch (error) {
      console.error('Erro ao buscar alertas do backend:', error);
    }
  };

  const fetchCrimeProbabilityForUserLocation = async (lat: number, lng: number) => {
    // Se a probabilidade já foi buscada UMA VEZ para esta sessão de ativação, não faça novamente
    if (hasFetchedCrimeProbabilityOnce.current) {
        console.log('Probabilidade da IA já foi buscada. Ignorando nova requisição.');
        return;
    }

    let regiao_administrativa = 'Arniqueiras';
    try {
      const nominatimReverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const geoResponse = await axios.get(nominatimReverseUrl, {
        headers: { 'User-Agent': 'SecurityApp/1.0 (seu_email@exemplo.com)' }
      });

      if (geoResponse.data && geoResponse.data.address) {
          regiao_administrativa = geoResponse.data.address.town ||
          geoResponse.data.address.city ||
          geoResponse.data.address.village ||
          geoResponse.data.address.suburb ||
          geoResponse.data.address.county ||
          'Região Desconhecida';
      }
      console.log("REGIAO ADM DO geoResponse: " + regiao_administrativa);
    } catch (geoError) {
      console.error('Erro ao geocodificar reversamente para probabilidade:', geoError);
    }

    const hora_ocorrencia = format(new Date(), 'HH:mm');

    try {
      console.log('Realizando requisição para /risco-bairro...');
      const response = await axios.get(`${FLASK_AI_URL}/risco-bairro`, {
        params: {
          regiao_administrativa,
          hora_ocorrencia
        }
      });
      console.log(response)


      if (response.data && typeof response.data.risco === 'number') {
        const probability = parseFloat(response.data.risco);
        if (!isNaN(probability)) {
          setCrimeProbability(probability);
          setProbabilityCircleLocation({ lat, lng });
          hasFetchedCrimeProbabilityOnce.current = true; // Marca como buscado
          setIsPopupVisible(true); 
          console.log('Probabilidade da IA obtida e definida:', probability);
        } else {
          console.warn('Probabilidade da IA retornada não é um número:', response.data.risco);
          // Opcional: Você pode definir um fallback ou um valor padrão para crimeProbability aqui
          // setCrimeProbability(0.2); // Exemplo de fallback
          // setProbabilityCircleLocation({ lat, lng}); // Usar a localização atual para o fallback
        }
      } else if (typeof response.data === 'string' && !isNaN(parseFloat(response.data))) {
        const probability = parseFloat(response.data);
        setCrimeProbability(probability);
        setProbabilityCircleLocation({ lat, lng });
        hasFetchedCrimeProbabilityOnce.current = true; // Marca como buscado
        console.log('Probabilidade da IA obtida e definida (formato string):', probability);
      } else {
        console.warn('Formato de probabilidade da IA inesperado:', response.data);
      }

    } catch (error) {
      console.error('Erro ao buscar probabilidade de crime do backend (IA):', error);
    }
  };


  useEffect(() => {
    // 1. Atualiza os alertas do banco de dados a cada minuto (sempre)
    fetchAlertsFromBackend();
    const alertsIntervalId = setInterval(fetchAlertsFromBackend, 60000);

    // 2. Lógica para localização do usuário e probabilidade da IA
    let watchId: number | undefined;

    if (navigator.geolocation) {
      if (isSecurityActive) {
        // Obter localização inicial imediatamente APENAS ao ativar ou recarregar
        // E somente se a probabilidade da IA não foi buscada nesta sessão
        if (!hasFetchedCrimeProbabilityOnce.current) {
          navigator.geolocation.getCurrentPosition(
            (initialPosition) => {
              const currentLat = initialPosition.coords.latitude;
              const currentLng = initialPosition.coords.longitude;
              setUserLocation({ lat: currentLat, lng: currentLng });
              fetchCrimeProbabilityForUserLocation(currentLat, currentLng); // Dispara a busca única da probabilidade
            },
            (error) => {
              console.error('Erro ao obter a localização inicial do usuário:', error);
              const defaultLat = -15.7801;
              const defaultLng = -47.9292;
              setUserLocation({ lat: defaultLat, lng: defaultLng });
              fetchCrimeProbabilityForUserLocation(defaultLat, defaultLng); // Dispara a busca única com fallback
            },
            { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }
          );
        }

        // Observar mudanças de localização para ATUALIZAR APENAS O MARCADOR DO USUÁRIO
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            // NÃO CHAME fetchCrimeProbabilityForUserLocation AQUI! Isso evitará múltiplas requisições.
          },
          (error) => {
            console.error('Erro ao observar a localização do usuário:', error);
            // Fallback para localização padrão se a observação falhar
            setUserLocation({ lat: -15.7801, lng: -47.9292 });
          },
          { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }
        );
      } else {
        // Se o monitoramento for desativado, reseta o flag da probabilidade da IA para que possa ser buscado na próxima ativação
        hasFetchedCrimeProbabilityOnce.current = false;
        // Opcional: Se você quer que o círculo da IA SUMA ao desativar o monitoramento, descomente as linhas abaixo.
        // setCrimeProbability(null);
        // setProbabilityCircleLocation(null);
        // Opcional: Limpar userLocation ao desativar o monitoramento
        setUserLocation(null);
        setIsPopupVisible(false);
      }
    } else {
      console.warn('Seu navegador não suporta geolocalização.');
      // Se não houver geolocalização, ainda tenta buscar a probabilidade com fallback uma vez
      if (!hasFetchedCrimeProbabilityOnce.current) {
        const defaultLat = -15.7801;
        const defaultLng = -47.9292;
        setUserLocation({ lat: defaultLat, lng: defaultLng });
        fetchCrimeProbabilityForUserLocation(defaultLat, defaultLng);
      }
    }

    // Função de limpeza do useEffect
    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearInterval(alertsIntervalId);
    };
  }, [isSecurityActive]); // Dependência em isSecurityActive para (re)ativar/desativar o monitoramento e busca da IA

  const handleNewAlertForMap = async (alertData: {
    id: number;
    type: MapAlert['type'];
    message: string;
    locationName: string;
    lat: number;
    lng: number;
    time: string;
    probability?: number;
  }) => {
    const newMapAlertWithUniqueKey: MapAlert = {
      id: uuidv4(),
      backendId: alertData.id,
      type: alertData.type,
      message: alertData.message,
      locationName: alertData.locationName,
      lat: alertData.lat,
      lng: alertData.lng,
      time: alertData.time,
      probability: alertData.probability,
    };
    setMapAlerts(prevMapAlerts => [...prevMapAlerts, newMapAlertWithUniqueKey]);
  };

  const features = [
    { icon: Shield, title: 'Monitoramento 24/7', description: 'Acompanhamento contínuo da sua localização e áreas de risco em tempo real.' },
    { icon: MapPin, title: 'Mapeamento Inteligente', description: 'Visualize pontos críticos, rotas seguras e áreas com maior incidência.'},
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
            <DynamicMapSection
              isActive={isSecurityActive}
              userLocation={isSecurityActive ? userLocation : null}
              mapAlerts={mapAlerts}
              crimeProbability={crimeProbability}
              probabilityLocation={probabilityCircleLocation}
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

      {crimeProbability !== null && (
        <RiskPopup
          isVisible={isPopupVisible}
          // IMPORTANTE: Seu backend retorna uma probabilidade (ex: 0.75), 
          // mas o componente espera uma porcentagem (ex: 75).
          percentage={crimeProbability * 100}
          onClose={() => setIsPopupVisible(false)} // Permite que o usuário feche o pop-up
        />
      )}
      

        
    </div>
  );
}