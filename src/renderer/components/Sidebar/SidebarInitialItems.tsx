import { ReactNode } from 'react';
import { SidebarItem } from './types';
import ProjectContent from './ProjectContent';

// サイドバーの初期アイテム
export const getInitialItems = (): SidebarItem[] => {
  return [
    {
      id: 'projects',
      type: 'project',
      title: 'プロジェクト/ユニット',
      icon: '📁',
      isOpen: true,
      content: <ProjectContent />,
    },
  ];
};
