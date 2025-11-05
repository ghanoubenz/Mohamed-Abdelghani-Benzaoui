import React from 'react';

const logoUrl = 'https://www.pipecaregroup.com/wp-content/uploads/2018/10/PIPECARE-Logo-Web.png';

export const Logo: React.FC = () => {
  return (
    <div className="flex justify-center">
      <img 
        src={logoUrl} 
        alt="PIPECARE Logo" 
        className="h-auto w-full max-w-[180px]"
      />
    </div>
  );
};