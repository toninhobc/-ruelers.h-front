"use client";
import React, { useState } from 'react';
import Header from '../../components/Header';
import ImageUpload from '../../components/ImageUpload';
import { Shield, Camera, Upload } from 'lucide-react';

const UploadImages = () => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImages(prev => [...prev, imageUrl]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30 mb-8">
            <Camera className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-300 text-sm font-medium">Contribua com a Segurança</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Envio de
            <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent"> Imagens</span>
            <br />de Segurança
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Ajude a manter nossa comunidade segura compartilhando imagens de situações de risco, 
            infraestrutura danificada ou atividades suspeitas.
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <ImageUpload onImageUpload={handleImageUpload} />
        </div>
      </section>

      {/* Guidelines Section */}
      <section className="px-4 mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Shield className="w-6 h-6 text-blue-400 mr-3" />
              Diretrizes de Upload
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-blue-300">O que enviar:</h4>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Situações de emergência
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Infraestrutura danificada
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Atividades suspeitas
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    Problemas de iluminação
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-red-300">Não enviar:</h4>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                    Conteúdo pessoal/privado
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                    Imagens ofensivas
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                    Informações falsas
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                    Violação de privacidade
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Uploaded Images Gallery */}
      {uploadedImages.length > 0 && (
        <section className="px-4 mb-16">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Imagens Enviadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedImages.map((imageUrl, index) => (
                <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={`Upload ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-slate-300 text-sm">
                      Enviado em {new Date().toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default UploadImages;