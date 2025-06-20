// components/AlertPanel.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, Clock, CheckCircle } from 'lucide-react'; // Adicionado CheckCircle
import Modal from './Modal';

// Interface Alert (Mantida como 'critical' | 'danger' | 'warning' | 'low' | 'info')
interface Alert {
  id: number;
  type: 'critico' | 'danger' | 'warning' | 'low' | 'info'; // 'critico' ajustado para corresponder à interface
  message: string;
  time: string;
}

interface AlertPanelProps {
  alerts: Alert[];
  onAddAlert: (newAlertData: { type: Alert['type'], message: string }) => void;
  onAddAlertToMap: (alertData: {
    type: Alert['type'];
    message: string;
    locationName: string;
    lat: number;
    lng: number;
    time: string;
  }) => Promise<void>;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onAddAlert, onAddAlertToMap }) => {

  // Função para determinar o ícone do alerta (ATUALIZADA)
  const getAlertIcon = (type: Alert['type']) => { // Usando o tipo específico Alert['type']
    switch (type) {
      case 'critico': return AlertTriangle;
      case 'danger': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'low': return CheckCircle; // Ícone para baixo risco/sucesso
      case 'info': return Info;
      default: return Bell;
    }
  };

  // Função para determinar a cor do alerta (ATUALIZADA E CORRIGIDA)
  const getAlertColor = (type: Alert['type']) => { // Usando o tipo específico Alert['type']
    switch (type) {
      case 'critico': return 'border-red-600/50 bg-red-600/10 text-red-500'; // Vermelho
      case 'danger': return 'border-orange-500/50 bg-orange-500/10 text-orange-400'; // Laranja (Corrigido)
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'; // Amarelo
      case 'low': return 'border-green-500/50 bg-green-500/10 text-green-400';   // Verde (Corrigido)
      case 'info': return 'border-blue-500/50 bg-blue-500/10 text-blue-400';    // Azul
      default: return 'border-slate-500/50 bg-slate-500/10 text-slate-400';
    }
  };

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Estado do Formulário (ADICIONADOS GÊNERO E selectedOccurrenceType)
  const [formData, setFormData] = useState({
    occurrenceType: '', // Agora é mais uma descrição do que o tipo de classificação
    description: '',
    location: '',
    eventDateTime: '',
    gender: 'Não desejo informar', // Novo campo, valor padrão
    selectedOccurrenceType: 'info' as Alert['type'], // Novo campo, valor padrão 'info'
  });

  const openModal = (preselectedType?: Alert['type']) => {
    // Definir o tipo de ocorrência pré-selecionado se for passado
    setFormData(prev => ({
      ...prev,
      selectedOccurrenceType: preselectedType || 'info', // Define um padrão ou o valor passado
      occurrenceType: '' // Limpar a descrição do tipo ao abrir
    }));
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    // Resetar o formulário
    setFormData({
      occurrenceType: '',
      description: '',
      location: '',
      eventDateTime: '',
      gender: 'Não desejo informar',
      selectedOccurrenceType: 'info',
    });
  };

  // Handler de mudança para inputs e select boxes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Se o campo for 'selectedOccurrenceType', garantir que o tipo é o correto
    if (name === 'selectedOccurrenceType') {
      setFormData(prevData => ({ ...prevData, [name]: value as Alert['type'] }));
    } else {
      setFormData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmitForm = async () => {
    // A mensagem agora incluirá o gênero e a descrição digitada
    const alertMessage = `Denúncia - Tipo: ${formData.occurrenceType || 'Não informado'} - Local: ${formData.location || 'local desconhecido'}`;

    // O alertType agora VEM DIRETAMENTE DO SELECT BOX
    const alertType = formData.selectedOccurrenceType;

    onAddAlert({ type: alertType, message: alertMessage });

    // Para as coordenadas no mapa, como o AlertPanel não resolve,
    // usaremos coordenadas de Brasília (Centro) com uma pequena variação aleatória.
    const braziliaLat = -15.7801;
    const braziliaLng = -47.9292;
    const randomOffset = (Math.random() - 0.5) * 0.05;
    const randomOffset2 = (Math.random() - 0.5) * 0.05;

    await onAddAlertToMap({
      type: alertType,
      message: alertMessage,
      locationName: formData.location,
      lat: braziliaLat + randomOffset,
      lng: braziliaLng + randomOffset2,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });

    console.log('Dados da denúncia enviados:', formData);
    alert(`Denúncia Enviada:
      Gênero: ${formData.gender},
      Tipo da Ocorrência (Descrição): ${formData.occurrenceType || 'Não informado'},
      Tipo da Ocorrência (Classificação): ${formData.selectedOccurrenceType},
      Descrição: ${formData.description || 'Não informada'},
      Localização: ${formData.location || 'Não informada'},
      Data e Hora do Acontecimento: ${formData.eventDateTime || 'Não informada'}`);

    closeModal(); // Fecha e reseta o formulário
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header do AlertPanel */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-red-400" />
          <h3 className="text-xl font-bold text-white">Alertas Recentes</h3>
          <div className="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30">
            {alerts.length} novos
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          return (
            <div
              key={alert.id} // Certifique-se que alert.id é único!
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
        })}

        {alerts.length === 0 && (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum alerta no momento</p>
            <p className="text-slate-500 text-sm">Você está seguro!</p>
          </div>
        )}
      </div>

      {/* Modal para o Formulário de Denúncia */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Preencha os Dados da Denúncia"
        onConfirm={handleSubmitForm}
        confirmButtonText="Enviar Denúncia"
      >
        <form className="space-y-4">
          {/* Campo para Gênero */}
          <div>
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

          {/* Campo para Tipo de Ocorrência (Select Box) */}
          <div>
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
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-1">Localização:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Ex: SQN 108 Bloco A"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white"
            />
          </div>

        </form>
      </Modal>

      {/* Quick Actions (Botões de Emergência e Reportar) */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
        <div className="grid grid-cols-2 gap-3">
          <button
            className="flex items-center justify-center space-x-2 py-2 px-4 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors duration-200 text-sm"
            onClick={() => openModal('critico')} // Pré-seleciona "Critico"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Emergência</span>
          </button>
          <button
            className="flex items-center justify-center space-x-2 py-2 px-4 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200 text-sm"
            onClick={() => openModal('info')} // Pré-seleciona "Informativo"
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