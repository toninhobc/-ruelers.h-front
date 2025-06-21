// Header.jsx
import React, { useState } from 'react';
import { Menu, Shield, X } from 'lucide-react';
import PanicButton from './PanicButton'; // Make sure the path is correct

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPanicModalOpen, setIsPanicModalOpen] = useState(false); // State for modal visibility

  const menuItems = [
    { name: 'Início', href: '/' },
    { name: 'Emergência', action: () => setIsPanicModalOpen(true) }, // Changed to an action
    { name: 'Upload', href: '/upload' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              SecureCity
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {menuItems.map((item) => (
                // Conditionally render based on whether 'item' has an href or an action
                item.href ? (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-slate-300 hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors duration-200 relative group"
                  >
                    {item.name}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                  </a>
                ) : (
                  // Render a button if there's an action (for the "Emergência" item)
                  <button
                    key={item.name}
                    onClick={item.action}
                    className="text-slate-300 hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors duration-200 relative group cursor-pointer"
                  >
                    {item.name}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-800/50 backdrop-blur-sm rounded-lg mt-2 border border-slate-700/50">
              {menuItems.map((item) => (
                // Conditionally render for mobile menu as well
                item.href ? (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-slate-300 hover:text-blue-400 block px-3 py-2 text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)} // Close mobile menu on click
                  >
                    {item.name}
                  </a>
                ) : (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      }
                      setIsMenuOpen(false); // Close mobile menu when action is performed
                    }}
                    className="text-slate-300 hover:text-blue-400 block px-3 py-2 text-base font-medium transition-colors duration-200 w-full text-left"
                  >
                    {item.name}
                  </button>
                )
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Panic Button Modal - rendered outside the nav but within the Header */}
      <PanicButton
        isOpen={isPanicModalOpen}
        onOpenChange={setIsPanicModalOpen}
      />
    </header>
  );
};

export default Header;