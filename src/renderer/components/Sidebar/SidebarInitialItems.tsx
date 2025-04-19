import { SidebarItem } from '@/renderer/components/Sidebar/types';
import ProjectContent from '@/renderer/components/Sidebar/ProjectContent';
import FlowchartNodeList from '@/renderer/flowchart/components/FlowchartNodeList';

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
    {
      id: 'flowchart-nodes',
      type: 'flowchart-nodes',
      title: 'フローチャート',
      icon: '🧩',
      content: (
        <FlowchartNodeList
          configIdentifier={{
            projectId: 0,
            unitId: 0,
            configType: 'operationConfigs',
            configId: 0,
          }}
        />
      ),
    },
  ];
};
