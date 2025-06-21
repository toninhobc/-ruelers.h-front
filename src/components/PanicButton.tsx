import React from 'react';
import { Phone, MessageSquare, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface PanicButtonProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
}

const PanicButton: React.FC<PanicButtonProps> = ({ isOpen, onOpenChange }) => {
  const [selectedContact, setSelectedContact] = React.useState<string>('');

  const emergencyContacts: Contact[] = [
    { id: 'police', name: 'Polícia (190)', phone: '190' },
    { id: 'fire', name: 'Bombeiros (193)', phone: '193' },
    { id: 'samu', name: 'SAMU (192)', phone: '192' },
    { id: 'contact1', name: 'Contato de Emergência 1', phone: '+55 11 99999-9999' },
    { id: 'contact2', name: 'Contato de Emergência 2', phone: '+55 11 88888-8888' },
  ];

  const handleCall = () => {
    const contact = emergencyContacts.find(c => c.id === selectedContact);
    if (contact) {
      window.open(`tel:${contact.phone}`, '_self');
      toast.info("Ligando...", {
        description: `Ligando para ${contact.name}`,
        duration: 3000,
      });
      onOpenChange(false);
    } else {
      toast.error("Erro", {
        description: "Selecione um contato para ligar",
        duration: 3000,
      });
    }
  };

  const handleSendMessage = () => {
    const contact = emergencyContacts.find(c => c.id === selectedContact);
    if (contact) {
      const message = "EMERGÊNCIA! Preciso de ajuda urgente. Esta é uma mensagem automática do meu botão de pânico.";
      window.open(`sms:${contact.phone}?body=${encodeURIComponent(message)}`, '_self');
      toast.success("Mensagem enviada", {
        description: `Mensagem de emergência enviada para ${contact.name}`,
        duration: 3000,
      });
      onOpenChange(false);
    } else {
      toast.error("Erro", {
        description: "Selecione um contato para enviar mensagem",
        duration: 3000,
      });
    }
  };

  return (
    // O Dialog da Shadcn/ui é o responsável por ser o modal em si.
    // Ele já se centraliza e lida com o overlay automaticamente.
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Aqui não vai mais o DialogTrigger nem o botão "PÂNICO" */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Botão de Pânico Ativado
          </DialogTitle>
          <DialogDescription>
            Selecione um contato de emergência e escolha como deseja pedir ajuda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Selecionar Contato de Emergência:
            </label>
            <Select value={selectedContact} onValueChange={setSelectedContact}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um contato..." />
              </SelectTrigger>
              <SelectContent>
                {emergencyContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {contact.name} - {contact.phone}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCall}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              disabled={!selectedContact}
            >
              <Phone className="w-4 h-4" />
              Ligar
            </Button>

            <Button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              disabled={!selectedContact}
            >
              <MessageSquare className="w-4 h-4" />
              Enviar SMS
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center mt-4">
            Em caso de emergência real, ligue imediatamente para 190 (Polícia) ou 192 (SAMU)
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PanicButton;