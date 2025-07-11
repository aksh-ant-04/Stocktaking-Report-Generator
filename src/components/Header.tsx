import React from 'react';
import { FileText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900 text-white py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-bold">APPLICATION FOR STOCKTAKING</h1>
            <p className="text-sm text-gray-300">Report Generation Tool</p>
          </div>
        </div>
        <div className="text-red-500 font-bold text-4xl" style={{ fontFamily: 'Calibri, sans-serif' }}>
          acrebis
        </div>
      </div>
    </header>
  );
};

export default Header;