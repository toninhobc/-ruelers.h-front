import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0 
}) => {
  return (
    <div 
      className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-700/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-red-500/20 rounded-xl border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
        </div>
        <h4 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
          {title}
        </h4>
      </div>
      
      <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
        {description}
      </p>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
};

export default FeatureCard;