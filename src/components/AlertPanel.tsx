// components/AlertPanel.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, Clock, CheckCircle } from 'lucide-react';
import Modal from './Modal';
import axios from 'axios';
import PanicButton from './PanicButton';

// Interface Alert (Mantida)
interface Alert {
  id: number;
  type: 'critico' | 'danger' | 'warning' | 'low' | 'info';
  message: string;
  time: string;
  locationName?: string;
  lat?: number;
  lng?: number;
}

interface AlertPanelProps {
  onAddAlert: (newAlertData: { type: Alert['type'], message: string }) => void;
  onAddAlertToMap: (alertData: {
    id: number;
    type: Alert['type'];
    message: string;
    locationName: string;
    lat: number;
    lng: number;
    time: string;
  }) => Promise<void>;
}

const FLASK_BACKEND_URL = 'http://localhost:5002';

const AlertPanel: React.FC<AlertPanelProps> = ({ onAddAlert, onAddAlertToMap }) => {
  const [displayedAlerts, setDisplayedAlerts] = useState<Alert[]>([]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critico': return AlertTriangle;
      case 'danger': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'low': return CheckCircle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critico': return 'border-red-600/50 bg-red-600/10 text-red-500';
      case 'danger': return 'border-orange-500/50 bg-orange-500/10 text-orange-400';
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
      case 'low': return 'border-green-500/50 bg-green-500/10 text-green-400';
      case 'info': return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
      default: return 'border-slate-500/50 bg-slate-500/10 text-slate-400';
    }
  };

  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isPanicModalOpen, setIsPanicModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    occurrenceType: '',
    description: '',
    location: '', // Esta localização contém o endereço em texto
    eventDateTime: '',
    gender: 'Não desejo informar',
    selectedOccurrenceType: 'info' as Alert['type'],
  });

  const openReportModal = (preselectedType?: Alert['type']) => {
    setFormData(prev => ({
      ...prev,
      selectedOccurrenceType: preselectedType || 'info',
      occurrenceType: ''
    }));
    setIsReportModalOpen(true);
  };
  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setFormData({
      occurrenceType: '',
      description: '',
      location: '',
      eventDateTime: '',
      gender: 'Não desejo informar',
      selectedOccurrenceType: 'info',
    });
  };

  const openPanicModal = () => {
    setIsPanicModalOpen(true);
    console.log('Abrindo modal de pânico. isPanicModalOpen:', true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'selectedOccurrenceType') {
      setFormData(prevData => ({ ...prevData, [name]: value as Alert['type'] }));
    } else {
      setFormData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${FLASK_BACKEND_URL}/alertas`);
      if (response.status === 200) {
        const fetchedData: Alert[] = await Promise.all( // Use Promise.all para esperar as geocodificações
            response.data.map(async (item: any) => {
            const messageContent = `${item.TipoOcorrencia || 'N/A'}: ${item.Descricao || 'N/A'}`;
            const timeFormatted = item.HoraOcorrencia ?
              new Date(item.HoraOcorrencia).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A';

            let lat = -15.7801; // Fallback para Brasília
            let lng = -47.9292; // Fallback para Brasília

            // Tentar geocodificar a localização se ela for uma string de endereço
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
              id: item.id,
              type: item.ClassificacaoAlerta as Alert['type'],
              message: messageContent,
              time: timeFormatted,
              locationName: item.Localizacao,
              lat: lat,
              lng: lng,
            };
          })
        );
        setDisplayedAlerts(fetchedData);
      }
    } catch (error) {
      console.error('Erro ao buscar alertas do backend:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // FUNÇÃO DE SUBMISSÃO DO FORMULÁRIO (AGORA COM GEOCODIFICAÇÃO PARA O NOVO ALERTA)
  const handleSubmitForm = async () => {
    const alertType = formData.selectedOccurrenceType;
    const alertMessage = `Denúncia - Tipo: ${formData.occurrenceType || 'Não informado'} - Local: ${formData.location || 'local desconhecido'}`;

    const formattedEventDateTime = formData.eventDateTime ?
      `${formData.eventDateTime.replace('T', ' ')}:00` :
      new Date().toISOString().slice(0, 19).replace('T', ' ');

    let finalLat: number = -15.7801; // Fallback para Brasília
    let finalLng: number = -47.9292; // Fallback para Brasília

    // --- FAZER A GEOCODIFICAÇÃO DA LOCALIZAÇÃO DIGITADA PELO USUÁRIO AQUI ---
    if (formData.location.trim()) {
        try {
            const encodedLocation = encodeURIComponent(`${formData.location}, Brasília, DF, Brasil`); // Adiciona contexto
            const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`;
            const geoResponse = await axios.get(nominatimUrl, {
                headers: {
                    'User-Agent': 'SecurityApp/1.0 (seu_email@exemplo.com)' // Mantenha seu User-Agent
                },
            });

            if (geoResponse.data && geoResponse.data.length > 0) {
                finalLat = parseFloat(geoResponse.data[0].lat);
                finalLng = parseFloat(geoResponse.data[0].lon);
                console.log(`Geocodificado para novo alerta: "${formData.location}" -> Lat: ${finalLat}, Lng: ${finalLng}`);
            } else {
                console.warn(`Geocodificação falhou para o novo alerta: "${formData.location}". Usando coordenadas padrão.`);
            }
        } catch (geoError) {
            console.error('Erro na geocodificação da localização do novo alerta:', geoError);
            // Poderia exibir um erro para o usuário aqui
        }
    } else {
        console.warn('Localização vazia para novo alerta. Usando coordenadas padrão.');
    }
    // --- FIM DA GEOCODIFICAÇÃO ---


    const alertDataForFlask = {
      Genero: formData.gender,
      ClassificacaoAlerta: formData.selectedOccurrenceType,
      TipoOcorrencia: formData.occurrenceType,
      HoraOcorrencia: formattedEventDateTime,
      Descricao: formData.description,
      Localizacao: formData.location,
    };

    try {
      const response = await axios.post(`${FLASK_BACKEND_URL}/alertas`, alertDataForFlask);

      if (response.status === 201) {
        console.log('Alerta enviado ao Flask com sucesso:', response.data);
        alert('Denúncia enviada com sucesso para o backend!');

        // Depois de enviar um novo alerta, recarregue toda a lista para garantir que o mapa e o painel estejam atualizados
        await fetchAlerts();

        // Chamar onAddAlert e onAddAlertToMap se o componente pai ainda precisar desses callbacks
        const newIdFromFlask = response.data.id;
        const timeOfSubmission = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        onAddAlert({ type: alertType, message: alertMessage });
        await onAddAlertToMap({
          id: newIdFromFlask,
          type: alertType,
          message: alertMessage,
          locationName: formData.location,
          lat: finalLat, // USANDO AGORA A LATITUDE GEOCODIFICADA!
          lng: finalLng, // USANDO AGORA A LONGITUDE GEOCODIFICADA!
          time: timeOfSubmission,
        });

      } else {
        console.error('Resposta inesperada do servidor:', response);
        alert('Erro inesperado ao enviar denúncia.');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Erro ao enviar alerta para o Flask:', error.response.status, error.response.data);
        alert(`Erro ao enviar denúncia: ${error.response.data.message || 'Erro desconhecido do servidor'}`);
      } else if (axios.isAxiosError(error)) {
        console.error('Erro de rede ou requisição (Axios):', error.message);
        alert('Erro de conexão com o servidor. Verifique sua conexão ou tente novamente mais tarde.');
      } else {
        console.error('Erro desconhecido:', error);
        alert('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      closeReportModal();
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header do AlertPanel */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-red-400" />
          <h3 className="text-xl font-bold text-white">Alertas Recentes</h3>
          <div className="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30">
            {displayedAlerts.length} alertas
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {displayedAlerts.length > 0 ? (
          displayedAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start space-x-3">
                  {<Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-1">
                      {alert.message}
                    </p>
                    <div className="flex items-center text-xs text-slate-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {alert.time}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum alerta no momento</p>
            <p className="text-slate-500 text-sm">Você está seguro!</p>
          </div>
        )}
      </div>

      {/* Modal para o Formulário de Denúncia */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        title="Preencha os Dados da Denúncia"
        onConfirm={handleSubmitForm}
        confirmButtonText="Enviar Denúncia"
      >
        <form className="space-y-4">


            {/* Campo para Tipo de Ocorrência (Select Box) */}

            <div>
              {/* Campo para Localização (Input de texto) */}
            <div>
              {/*
              <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-1">
                Localização:
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ex: SQN 108 Bloco A"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white appearance-none"
              />*/}
              <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-1">Bairro:</label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white"
              >
                <option value="Arniqueira">Arniqueira</option>
                <option value="Brasília">Brasília</option>
                <option value="Brazlândia">Brazlândia</option>
                <option value="Candangolândia">Candangolândia</option>
                <option value="Ceilândia">Ceilândia</option>
                <option value="Cruzeiro">Cruzeiro</option>
                <option value="Fercal">Fercal</option>
                <option value="Gama">Gama</option>
                <option value="Guará">Guará</option>
                <option value="Itapoã">Itapoã</option>
                <option value="Jardim Botânico">Jardim Botânico</option>
                <option value="Lago Norte">Lago Norte</option>
                <option value="Lago Sul">Lago Sul</option>
                <option value="Núcleo Bandeirante">Núcleo Bandeirante</option>
                <option value="Paranoá">Paranoá</option>
                <option value="Park Way">Park Way</option>
                <option value="Planaltina">Planaltina</option>
                <option value="Recanto Das Emas">Recanto Das Emas</option>
                <option value="Riacho Fundo">Riacho Fundo</option>
                <option value="Riacho Fundo II">Riacho Fundo II</option>
                <option value="Samambaia">Samambaia</option>
                <option value="Santa Maria">Santa Maria</option>
                <option value="Scia Estrutural">Scia Estrutural</option>
                <option value="Sia">Sia</option>
                <option value="Sobradinho">Sobradinho</option>
                <option value="Sobradinho II">Sobradinho II</option>
                <option value="Sol Nascente">Sol Nascente</option>
                <option value="Sudoeste Octogonal">Sudoeste Octogonal</option>
                <option value="São Sebastião">São Sebastião</option>
                <option value="Taguatinga">Taguatinga</option>
                <option value="Varjão">Varjão</option>
                <option value="Vicente Pires">Vicente Pires</option>
                <option value="Águas Claras">Águas Claras</option>
              </select>
            </div>
            {/* Campo para Gênero */}
            <div className='mb-2'>
              <label htmlFor="gender" className="block text-sm font-semibold text-slate-700 mb-1">Gênero:</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Não desejo informar">Não desejo informar</option>
              </select>
            </div>
            <label htmlFor="selectedOccurrenceType" className="block text-sm font-semibold text-slate-700 mb-1">Classificação do Alerta:</label>
            <select
              id="selectedOccurrenceType"
              name="selectedOccurrenceType"
              value={formData.selectedOccurrenceType}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white"
            >
              <option value="critico">Crítico (Vermelho)</option>
              <option value="danger">Perigo (Laranja)</option>
              <option value="warning">Aviso (Amarelo)</option>
              <option value="low">Baixo Risco (Verde)</option>
              <option value="info">Informativo (Azul)</option>
            </select>
          </div>
          

          {/* Campo para Tipo da Ocorrência (Descrição Livre) */}
          <div>
            <label htmlFor="occurrenceType" className="block text-sm font-semibold text-slate-700 mb-1">Detalhes do Tipo da Ocorrência (texto livre):</label>
            <input
              type="text"
              id="occurrenceType"
              name="occurrenceType"
              value={formData.occurrenceType}
              onChange={handleInputChange}
              placeholder="Ex: Assalto à mão armada, Incêndio em veículo"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white"
            />
          </div>

          {/* Campo Data e Hora do Acontecimento */}
          <div>
            <label htmlFor="eventDateTime" className="block text-sm font-semibold text-slate-700 mb-1">Data e Hora do Acontecimento:</label>
            <input
              type="datetime-local"
              id="eventDateTime"
              name="eventDateTime"
              value={formData.eventDateTime}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white"
            />
          </div>

          {/* Campo Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1">Descrição Detalhada:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Descreva a situação em detalhes..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white resize-y"
            ></textarea>
          </div>

          {/* Campo Localização */}
          

        </form>
      </Modal>

      {/* Renderizar o componente PanicButton e controlar sua visibilidade */}
      <PanicButton
        isOpen={isPanicModalOpen}
        onOpenChange={setIsPanicModalOpen}
      />

      {/* Quick Actions (Botões de Emergência e Reportar) */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
        <div className="grid grid-cols-2 gap-3">
          <button
            className="flex items-center justify-center space-x-2 py-2 px-4 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors duration-200 text-sm"
            onClick={openPanicModal}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Emergência</span>
          </button>
          <button
            className="flex items-center justify-center space-x-2 py-2 px-4 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200 text-sm"
            onClick={() => openReportModal('info')}
          >
            <Info className="w-4 h-4" />
            <span>Reportar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;