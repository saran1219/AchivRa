import React from 'react';

interface MasterDetailLayoutProps {
  masterList: React.ReactNode;
  detailPanel: React.ReactNode;
  masterWidth?: 'narrow' | 'medium' | 'wide';
}

export const MasterDetailLayout: React.FC<MasterDetailLayoutProps> = ({
  masterList,
  detailPanel,
  masterWidth = 'medium',
}) => {
  const widthClasses = {
    narrow: 'w-1/3',
    medium: 'w-2/5',
    wide: 'w-1/2',
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Master List */}
      <div className={`${widthClasses[masterWidth]} overflow-hidden flex flex-col bg-white rounded-xl shadow-sm`}>
        <div className="flex-1 overflow-y-auto">
          {masterList}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 overflow-auto">
        {detailPanel}
      </div>
    </div>
  );
};

interface HorizontalListContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const HorizontalListContainer: React.FC<HorizontalListContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex gap-3 overflow-x-auto pb-4 ${className}`}>
      {children}
    </div>
  );
};

interface HorizontalListItemProps {
  children: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const HorizontalListItem: React.FC<HorizontalListItemProps> = ({
  children,
  isSelected = false,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex-shrink-0 w-72 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'bg-[#001a4d] text-white shadow-lg border-l-4 border-yellow-400'
          : 'bg-white text-gray-900 shadow-sm hover:shadow-md'
      } ${className}`}
    >
      {children}
    </div>
  );
};
