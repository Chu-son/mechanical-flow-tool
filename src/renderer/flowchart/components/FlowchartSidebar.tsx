import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { useDnD } from '../utils/DnDContext';
import Database, { ConfigType, Config } from '../../utils/database';

const ProjectsDB = Database;
export default ({
  projectId,
  unitId,
  configType,
  configId,
}: {
  projectId: number;
  unitId: number;
  configType: string;
  configId: number;
}) => {
  const [, setType] = useDnD();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const { toObject } = useReactFlow();

  const saveFlowData = async () => {
    const flow = toObject();

    try {
      const projects = await ProjectsDB.getAll();
      console.log(
        'Debug: projectId:',
        projectId,
        'unitId:',
        unitId,
        'configType:',
        configType,
        'configId:',
        configId,
      );
      console.log('Debug: projects:', projects);

      const project = projects.find((p) => p.id === projectId);
      if (!project) throw new Error('Project not found');

      const unit = project.units.find((u) => u.id === unitId);
      if (!unit) throw new Error('Unit not found');

      console.log('Debug: unit[configType]:', unit[configType as ConfigType]);
      if (!unit[configType] || unit[configType].length === 0) {
        throw new Error(`No configurations found for type: ${configType}`);
      }
      const config = unit[configType as ConfigType].find(
        (c: Config) => c.id === configId,
      );
      if (!config) throw new Error('Configuration not found');

      config.flow_data = {
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport,
      };
      await ProjectsDB.update(projectId, project);
      console.log('Flow data saved successfully');
    } catch (error) {
      console.error('Error saving flow data:', error);
    }
  };

  return (
    <aside className="sidebar">
      <div className="description">Node</div>

      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'taskStart')}
        draggable
      >
        Task Start Node
      </div>

      <div
        className="dndnode task"
        onDragStart={(event) => onDragStart(event, 'task')}
        draggable
      >
        Task Node
      </div>

      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, 'taskEnd')}
        draggable
      >
        Task End Node
      </div>
      <button
        type="button"
        onClick={saveFlowData}
        style={{ marginBottom: '10px' }}
      >
        Save
      </button>
    </aside>
  );
};
