// app/layout.tsx
import { Toaster as Sonner } from "@/components/ui/sonner"; // Ajuste o alias de path se necessário
import { TooltipProvider } from "@/components/ui/tooltip"; // Ajuste o alias de path se necessário
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import '../src/app/globals.css'; // Importe seus estilos globais, se houver

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Sonner />
            {children} {/* 'children' são suas páginas renderizadas */}
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}