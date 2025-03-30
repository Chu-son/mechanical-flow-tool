import React, { useRef, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  Background,
} from '@xyflow/react';
import { useLocation } from 'react-router-dom';
import { ProjectsDB } from '../utils/database';
import { DnDProvider, useDnD } from '../utils/DnDContext';
import TaskNode, {
  MemoizedTaskStartNode,
  MemoizedTaskEndNode,
} from '../components/TaskNode';
import FlowchartSidebar from '../components/FlowchartSidebar';
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  taskStart: MemoizedTaskStartNode,
  task: TaskNode,
  taskEnd: MemoizedTaskEndNode,
};

let id = 0;
const getId = (): string => {
  id += 1;
  return `${id}`;
};

const initialNodes: any[] = [];

function DnDFlow() {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

  const location = useLocation();
  const { projectId, unitId, configType, configId } = location.state || {};

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  useEffect(() => {
    if (!projectId || !configType || !configId) {
      console.error('Missing parameters: projectId, configType, or configId');
      return;
    }

    const loadFlowData = async () => {
      const flowData = await ProjectsDB.getFlowData(
        projectId,
        configType,
        configId,
      );
      if (flowData) {
        setNodes(flowData.nodes || []);
        setEdges(flowData.edges || []);
      } else {
        setNodes(initialNodes);
      }
    };

    loadFlowData();
  }, [projectId, configType, configId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds as any[])),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type, setNodes],
  );

  return (
    <div
      className="dndflow"
      style={{ height: '90vh', width: '80vw', display: 'flex' }}
    >
      <div
        className="reactflow-wrapper"
        ref={reactFlowWrapper}
        style={{ height: '100%', width: '100%' }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          nodeTypes={nodeTypes}
          style={{ backgroundColor: '#F7F9FB' }}
          colorMode="system"
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <FlowchartSidebar
        projectId={projectId}
        unitId={unitId}
        configType={configType}
        configId={configId}
      />
    </div>
  );
}

export default function Flowchart({
  projectId = 1,
  configType = 'driveConfigs',
  configId = 1,
}: {
  projectId?: number;
  configType?: 'driveConfigs' | 'operationConfigs';
  configId?: number;
}) {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <DnDFlow />
      </DnDProvider>
    </ReactFlowProvider>
  );
}
