import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { IconRail } from './IconRail';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';

export const AppLayout: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {/* Icon Rail */}
      <IconRail />

      {/* Main Content Area offset by rail width (16 = 4rem = 64px) */}
      <div className="flex-1 ml-16 flex flex-col min-h-screen">
        <TopBar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
