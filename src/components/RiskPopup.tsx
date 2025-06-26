import React from 'react';
import { X, ShieldAlert, ShieldCheck, Shield, AlertTriangle, Info } from 'lucide-react';

// Interfaces e a função getRiskLevel permanecem as mesmas
interface RiskLevel {
  level: 'Crítico' | 'Alto Risco' | 'Médio Risco' | 'Baixo Risco' | 'Informativo';
  color: string;
  bgColor: string;
  icon: React.ElementType;
  description: string;
}

interface RiskPopupProps {
  percentage: number;
  onClose: () => void;
  isVisible: boolean;
}


const getRiskLevel = (percentage: number): RiskLevel => {
  if (percentage >= 0.80) {
    return {
      level: 'Crítico',
      color: 'text-red-100',
      bgColor: 'bg-red-500',
      icon: ShieldAlert,
      description: 'Perigo iminente detectado. Evite a área e procure um local seguro.',
    };
  }
  if (percentage >= 0.60) {
    return {
      level: 'Alto Risco',
      color: 'text-orange-100',
      bgColor: 'bg-orange-500',
      icon: AlertTriangle,
      description: 'Condições de alto risco. Mantenha-se alerta e considere alterar sua rota.',
    };
  }
  if (percentage >= 0.40) {
    return {
      level: 'Médio Risco',
      color: 'text-yellow-100',
      bgColor: 'bg-yellow-500',
      icon: Shield,
      description: 'Risco moderado identificado. Tenha cautela.',
    };
  }
  if (percentage >= 0.20) {
    return {
      level: 'Baixo Risco',
      color: 'text-green-100',
      bgColor: 'bg-green-500',
      icon: ShieldCheck,
      description: 'A área é considerada de baixo risco, mas a vigilância é recomendada.',
    };
  }
  return {
    level: 'Informativo',
    color: 'text-sky-100',
    bgColor: 'bg-sky-500',
    icon: Info,
    description: 'Nenhum alerta de risco significativo no momento.',
  };
};


const RiskPopup: React.FC<RiskPopupProps> = ({ percentage, onClose, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  const { level, color, bgColor, icon: Icon, description } = getRiskLevel(percentage);

  return (
    // Em telas pequenas centraliza. Em telas medias e maiores, alinha a direita
    <div className="fixed inset-x-0 bottom-0 p-3 z-50 flex justify-center md:justify-end md:p-4">
      
      {/* Em mobile ocupa a largura toda. Em desktop tem largura automatica com um maximo */}
      <div 
        className={`relative w-full md:w-auto md:max-w-md rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 ${bgColor} ${color} animate-fade-in-up`}
      >
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Fechar pop-up"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center p-3">
          <div className="flex-shrink-0 mr-3">
            <Icon className="w-10 h-10" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{level}</h3>
            <p className="text-sm mt-1">{description}</p>
            <div className="text-xs font-mono opacity-80 mt-2">Risco: {percentage.toFixed(2)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskPopup;