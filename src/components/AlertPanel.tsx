// components/AlertPanel.tsx
'use client';
import React, { useState, useEffect } from 'react'; // Adicione useEffect se quiser os console.logs de debug
import { Bell, AlertTriangle, Info, Clock } from 'lucide-react';
import Modal from './Modal';

interface Alert {
  id: number;
  type: 'warning' | 'danger' | 'info' | 'default';
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
    time: string;
  }) => Promise<void>;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onAddAlert, onAddAlertToMap }) => {
  // Opcional: Console.log para debug, remova quando tudo estiver funcionando
  // useEffect(() => {
  //   console.log('AlertPanel foi montado!');
  //   console.log('Alerts recebidos:', alerts);
  // }, [alerts]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'danger': return AlertTriangle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
      case 'danger': return 'border-red-500/50 bg-red-500/10 text-red-400';
      case 'info': return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
      default: return 'border-slate-500/50 bg-slate-500/10 text-slate-400';
    }
  };

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({ 
    occurrenceType: '',
    description: '',
    location: '',
    eventDateTime: '' 
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmitForm = async () => {
    const alertMessage = `Denúncia: ${formData.occurrenceType || 'Não informado'} em ${formData.location || 'local desconhecido'}`;
    
    let alertType: Alert['type'] = 'info';
    if (formData.occurrenceType.toLowerCase().includes('assalto') || formData.occurrenceType.toLowerCase().includes('roubo') || formData.occurrenceType.toLowerCase().includes('violência')) {
      alertType = 'danger';
    } else if (formData.occurrenceType.toLowerCase().includes('suspeito')) {
      alertType = 'warning';
    }

    onAddAlert({ type: alertType, message: alertMessage });

    await onAddAlertToMap({
      type: alertType,
      message: alertMessage,
      locationName: formData.location,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });

    console.log('Dados da denúncia enviados:', formData);
    alert(`Denúncia Enviada:
      Tipo da Ocorrência: ${formData.occurrenceType || 'Não informado'},
      Descrição: ${formData.description || 'Não informada'},
      Localização: ${formData.location || 'Não informada'},
      Data e Hora do Acontecimento: ${formData.eventDateTime || 'Não informada'}`);
    
    setFormData({
      occurrenceType: '',
      description: '',
      location: '',
      eventDateTime: '',
    });
    closeModal();
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header do AlertPanel - AGORA VISÍVEL */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-red-400" />
          <h3 className="text-xl font-bold text-white">Alertas Recentes</h3>
          <div className="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30">
            {alerts.length} novos
          </div>
        </div>
      </div>

      {/* Alerts List - AGORA VISÍVEL */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start space-x-3">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
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

      {/* Modal para o Formulário de Denúncia - AGORA VISÍVEL */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Preencha os Dados da Denúncia"
        onConfirm={handleSubmitForm}
        confirmButtonText="Enviar Denúncia"
      >
        <form className="space-y-4">
          <div>
            <label htmlFor="occurrenceType" className="block text-sm font-semibold text-slate-700 mb-1">Tipo da Ocorrência:</label>
            <input
              type="text"
              id="occurrenceType"
              name="occurrenceType"
              value={formData.occurrenceType}
              onChange={handleInputChange}
              placeholder="Ex: Assalto, Roubo, Violência Doméstica"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1">Descrição:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Detalhe o ocorrido..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white resize-y"
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-1">Localização:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Ex: Rua Exemplo, 123, Bairro"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 bg-white"
            />
          </div>
          
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
        </form>
      </Modal>

      {/* Quick Actions (Botões de Emergência e Reportar) - AGORA VISÍVEL */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
        <div className="grid grid-cols-2 gap-3">
          <button
            className="flex items-center justify-center space-x-2 py-2 px-4 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors duration-200 text-sm"
            onClick={openModal}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Emergência</span>
          </button>
          <button
            className="flex items-center justify-center space-x-2 py-2 px-4 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200 text-sm"
            onClick={openModal}
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