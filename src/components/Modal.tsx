// components/Modal.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  onConfirm?: () => void;
  confirmButtonText?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, onConfirm, confirmButtonText = 'Confirmar' }) => {
  // Estado para armazenar a referência ao nó DOM onde o portal será montado
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Este useEffect roda APENAS no lado do cliente (navegador)

    // 1. Criar o elemento div para o portal
    const el = document.createElement('div');
    el.setAttribute('id', 'modal-root'); // Opcional: Adicionar um ID para referência

    // 2. Anexar o elemento ao body
    document.body.appendChild(el);
    setPortalRoot(el); // Armazena a referência para uso posterior

    // 3. Função de limpeza: Remove o elemento div do body quando o componente Modal é desmontado
    return () => {
      document.body.removeChild(el);
    };
  }, []); // O array vazio garante que este useEffect rode apenas uma vez (na montagem)

  // Se o modal não estiver aberto ou o portalRoot ainda não foi criado, não renderize nada
  if (!isOpen || !portalRoot) return null;

  // Use ReactDOM.createPortal para renderizar o conteúdo do modal dentro do 'portalRoot'
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      {/* Overlay/Backdrop */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-auto max-w-lg mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
            <h3 className="text-xl font-semibold">
              {title}
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-black opacity-70 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              <span className="bg-transparent text-black opacity-70 h-6 w-6 text-2xl block outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>

          {/* Body */}
          <div className="relative p-6 flex-auto">
            {children}
          </div>

          {/* Rodapé do Modal */}
          {onConfirm && (
            <div className="flex items-center justify-center p-6 border-t border-solid border-gray-300 rounded-b">
              <button
                className="flex items-center justify-center py-3 px-6 bg-red-600 text-white font-semibold rounded-xl shadow-xl hover:scale-105 hover:opacity-90 transition-all duration-300"
                type="button"
                onClick={onConfirm}
              >
                {confirmButtonText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    portalRoot // Renderiza o conteúdo no div criado e anexado ao body
  );
};

export default Modal;