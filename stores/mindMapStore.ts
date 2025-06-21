import { create } from "zustand";
import {
  Node,
  Edge,
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  MarkerType,
} from "reactflow";
import { MessageRecord } from "@/types";

interface MindMapState {
  nodes: Node[];
  edges: Edge[];
  loading: boolean;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setLoading: (loading: boolean) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  createMindMapFromMessages: (messages: MessageRecord[]) => void;
  clearMindMap: () => void;
}

export const useMindMapStore = create<MindMapState>((set, get) => ({
  nodes: [],
  edges: [],
  loading: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setLoading: (loading) => set({ loading }),

  onNodesChange: (changes) => {
    const { nodes } = get();
    set({ nodes: applyNodeChanges(changes, nodes) });
  },

  onEdgesChange: (changes) => {
    const { edges } = get();
    set({ edges: applyEdgeChanges(changes, edges) });
  },

  onConnect: (connection) => {
    const { edges } = get();
    set({ edges: addEdge(connection, edges) });
  },

  createMindMapFromMessages: (messages) => {
    if (messages.length === 0) {
      set({ nodes: [], edges: [] });
      return;
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const messageMap = new Map<string, MessageRecord>();
    const childrenMap = new Map<string, MessageRecord[]>();

    // メッセージをマップに格納し、親子関係を構築
    messages.forEach((msg) => {
      messageMap.set(msg.id, msg);
      if (msg.parent_id) {
        if (!childrenMap.has(msg.parent_id)) {
          childrenMap.set(msg.parent_id, []);
        }
        childrenMap.get(msg.parent_id)!.push(msg);
      }
    });

    // ルートノードを見つける（parent_idがnullのメッセージ）
    const rootMessages = messages.filter((msg) => !msg.parent_id);

    // 階層ごとにノードを配置
    const positionNodes = (
      msg: MessageRecord,
      x: number,
      y: number,
      levelWidth: number,
    ): number => {
      const content =
        msg.content.length > 100
          ? msg.content.substring(0, 100) + "..."
          : msg.content;

      newNodes.push({
        id: msg.id,
        type: "messageNode",
        position: { x, y },
        data: { label: content, role: msg.role },
      });

      const children = childrenMap.get(msg.id) || [];
      const childCount = children.length;
      let currentX = x - (levelWidth * (childCount - 1)) / 2;

      children.forEach((child) => {
        newEdges.push({
          id: `${msg.id}-${child.id}`,
          source: msg.id,
          target: child.id,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
          style: {
            strokeWidth: 2,
            stroke: "#999",
          },
        });

        positionNodes(child, currentX, y + 150, levelWidth * 0.7);
        currentX += levelWidth;
      });

      return currentX;
    };

    // ルートノードから開始
    let startX = 0;
    rootMessages.forEach((root) => {
      positionNodes(root, startX, 0, 300);
      startX += 500;
    });

    set({ nodes: newNodes, edges: newEdges });
  },

  clearMindMap: () => {
    set({ nodes: [], edges: [], loading: false });
  },
}));
