// components/ImageUpload.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Upload, Camera, MapPin, AlertTriangle, LocateFixed } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('emergencia'); // REINTRODUZIDO: Estado para a categoria da imagem
  const [isUploading, setIsUploading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    setIsUploading(true);

    setTimeout(() => {
      if (imagePreview) {
        onImageUpload(imagePreview);
      }

      // Reset form
      setSelectedImage(null);
      setImagePreview(null);
      setDescription('');
      setLocation('');
      setCategory('emergencia'); // REINTRODUZIDO: Reset da categoria
      setIsUploading(false);
      setLocationError(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 2000);
  };

  // Função para obter a localização atual e fazer a geocodificação reversa
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
      });

      const { latitude, longitude } = position.coords;

      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

      const response = await fetch(nominatimUrl, {
          headers: {
              'User-Agent': 'SeuAplicativoDeSeguranca/1.0 (seu.email@exemplo.com)'
          }
      });

      if (!response.ok) {
        throw new Error(`Erro de rede ao buscar endereço: ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.display_name) {
        setLocation(data.display_name);
      } else {
        setLocation(`Lat: ${latitude}, Lng: ${longitude} (endereço não encontrado)`);
      }

    } catch (error: any) {
      console.error("Erro de geolocalização ou geocodificação reversa:", error);
      if (error instanceof GeolocationPositionError) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError('Permissão negada para acessar a localização.');
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError('Localização não pôde ser determinada.');
              break;
            case error.TIMEOUT:
              setLocationError('Tempo esgotado para obter a localização.');
              break;
            default:
              setLocationError('Erro desconhecido ao obter a localização.');
              break;
          }
      } else {
          setLocationError(`Erro ao obter endereço: ${error.message || 'Erro desconhecido'}`);
      }
      setLocation('');
    } finally {
      setIsLocating(false);
    }
  };

  // REINTRODUZIDO: Array de categorias para o campo de seleção
  const categories = [
    { value: 'emergencia', label: 'Emergência', color: 'text-red-400' },
    { value: 'infraestrutura', label: 'Infraestrutura', color: 'text-yellow-400' },
    { value: 'suspeita', label: 'Atividade Suspeita', color: 'text-orange-400' },
    { value: 'iluminacao', label: 'Problema de Iluminação', color: 'text-blue-400' },
    { value: 'outro', label: 'Outro', color: 'text-slate-400' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Upload Area */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-white">Selecionar Imagem</Label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg border border-slate-600"
                  />
                  <p className="text-slate-300">Clique ou arraste para trocar a imagem</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-slate-700/50 rounded-full">
                      <Upload className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg text-slate-300 mb-2">
                      Arraste uma imagem aqui ou clique para selecionar
                    </p>
                    <p className="text-sm text-slate-500">
                      Formatos aceitos: JPG, PNG, GIF (máx. 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* REINTRODUZIDO: Category Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-white">Categoria da Imagem</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button" // Importante para não submeter o formulário
                  onClick={() => setCategory(cat.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    category === cat.value
                      ? 'border-blue-400 bg-blue-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* AlertaTriangle aqui, mas você pode escolher um ícone diferente para cada categoria se quiser */}
                    <AlertTriangle className={`w-5 h-5 ${cat.color}`} />
                    <span className="text-white font-medium">{cat.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location - COM BOTÃO DE LOCALIZAÇÃO ATUAL E GEOCDIFICAÇÃO REVERSA */}
          <div className="space-y-4">
            <Label htmlFor="location" className="text-lg font-semibold text-white">
              Localização
            </Label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Digite o endereço ou ponto de referência..."
                  className="pl-12 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  required
                />
              </div>
              <Button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLocating}
                className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-600/30 hover:bg-blue-600/30 transition-colors duration-200 text-sm flex items-center space-x-2"
              >
                {isLocating ? (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <LocateFixed className="w-4 h-4" />
                )}
                <span>{isLocating ? 'Obtendo...' : 'Localização Atual'}</span>
              </Button>
            </div>
            {locationError && (
              <p className="text-red-400 text-sm mt-1">{locationError}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <Label htmlFor="description" className="text-lg font-semibold text-white">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a situação em detalhes..."
              rows={4}
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={!selectedImage || isUploading}
              className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
                !selectedImage || isUploading
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 shadow-xl'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Enviar Imagem</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageUpload;