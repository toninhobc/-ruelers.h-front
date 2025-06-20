import React from 'react';
import { Power, Shield, MapPin } from 'lucide-react';

interface SecurityButtonProps {
  isActive: boolean;
  onToggle: () => void;
}

const SecurityButton: React.FC<SecurityButtonProps> = ({ isActive, onToggle }) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main Toggle Button */}
      <button
        onClick={onToggle}
        className={`relative group w-32 h-32 rounded-full border-4 transition-all duration-500 transform hover:scale-110 ${
          isActive
            ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-400 shadow-green-500/50'
            : 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 shadow-red-500/50'
        } shadow-2xl hover:shadow-3xl`}
      >
        <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
        <div className="relative flex items-center justify-center h-full">
          <Power 
            className={`w-12 h-12 transition-all duration-300 ${
              isActive ? 'text-white rotate-0' : 'text-white rotate-180'
            }`} 
          />
        </div>
        
        {/* Ripple effect */}
        <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
          isActive 
            ? 'bg-green-400/30 animate-ping' 
            : 'bg-red-400/30'
        }`}></div>
      </button>

      {/* Status Text */}
      <div className="text-center">
        <div className={`text-2xl font-bold transition-colors duration-300 ${
          isActive ? 'text-green-400' : 'text-red-400'
        }`}>
          {isActive ? 'PROTEÇÃO ATIVA' : 'PROTEÇÃO INATIVA'}
        </div>
        <div className="text-slate-400 text-sm mt-2">
          {isActive 
            ? 'Monitorando sua segurança...' 
            : 'Toque para ativar o monitoramento'
          }
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex space-x-6">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-600'
          }`}></div>
          <span className="text-slate-300 text-sm">GPS</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            isActive ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'
          }`}></div>
          <span className="text-slate-300 text-sm">Rede</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            isActive ? 'bg-yellow-400 animate-pulse' : 'bg-slate-600'
          }`}></div>
          <span className="text-slate-300 text-sm">Alertas</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityButton;
