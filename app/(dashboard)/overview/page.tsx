"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConversationStore } from "@/stores/conversationStore";
import { useMindMapStore } from "@/stores/mindMapStore";
import { useChatStore } from "@/stores/chatStore";
import { MessageRecord } from "@/types";
import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
  Handle,
  Position,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";

// カスタムノードコンポーネント
const MessageNode = ({
  data,
}: {
  data: { label: string; role: string; messageId: string; isInPath: boolean };
}) => {
  const router = useRouter();
  const { switchToBranch } = useChatStore();
  const { currentConversationId } = useConversationStore();

  const bgColor =
    data.role === "user"
      ? data.isInPath
        ? "bg-orange-500"
        : "bg-orange-300"
      : data.isInPath
        ? "bg-white"
        : "bg-gray-100";
  const textColor = data.role === "user" ? "text-white" : "text-black";
  const borderColor = data.isInPath
    ? "border-blue-500 border-2"
    : "border-gray-300 border";

  const handleNodeClick = async () => {
    if (!currentConversationId) return;

    // このノードまでのパスを構築
    const response = await fetch(
      `/api/conversation/${currentConversationId}/messages`,
    );
    const result = await response.json();

    if (response.ok) {
      const messages = result.messages;
      const targetMessage = messages.find(
        (m: MessageRecord) => m.id === data.messageId,
      );
      if (!targetMessage) return;

      // パスを再構築
      const path = [];
      let current = targetMessage;
      path.unshift(current.id);

      while (current.parent_id) {
        const parent = messages.find(
          (m: MessageRecord) => m.id === current.parent_id,
        );
        if (!parent) break;
        path.unshift(parent.id);
        current = parent;
      }

      // パスを切り替えてチャット画面に移動
      switchToBranch(path);
      router.push(`/chat/${currentConversationId}`);
    }
  };

  return (
    <div
      className={`px-4 py-2 rounded-lg ${bgColor} ${textColor} ${borderColor} shadow-md max-w-[300px] cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={handleNodeClick}
    >
      <Handle type="target" position={Position.Top} />
      <div className="text-sm font-medium mb-1">
        {data.role === "user" ? "User" : "Assistant"}
      </div>
      <div className="text-xs whitespace-pre-wrap">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  messageNode: MessageNode,
};

export default function Overview() {
  const { currentConversationId } = useConversationStore();
  const { currentPath } = useChatStore();
  const {
    nodes,
    edges,
    loading,
    setLoading,
    onNodesChange,
    onEdgesChange,
    onConnect,
    createMindMapFromMessages,
    clearMindMap,
  } = useMindMapStore();

  // メッセージを取得
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentConversationId) {
        clearMindMap();
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/conversation/${currentConversationId}/messages`,
        );
        const data = await response.json();

        if (response.ok) {
          createMindMapFromMessages(data.messages);
        } else {
          console.error("Error fetching messages:", data.error);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [
    currentConversationId,
    setLoading,
    createMindMapFromMessages,
    clearMindMap,
  ]);

  // 現在のパスに基づいてノードとエッジを更新
  const enhancedNodes: Node[] = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      messageId: node.id,
      isInPath: currentPath.includes(node.id),
    },
  }));

  const enhancedEdges: Edge[] = edges.map((edge) => {
    const isInPath =
      currentPath.includes(edge.source) && currentPath.includes(edge.target);
    const sourceIndex = currentPath.indexOf(edge.source);
    const targetIndex = currentPath.indexOf(edge.target);
    const isDirectPath = isInPath && targetIndex === sourceIndex + 1;

    return {
      ...edge,
      style: {
        ...edge.style,
        stroke: isDirectPath ? "#3b82f6" : "#999",
        strokeWidth: isDirectPath ? 3 : 2,
      },
      animated: isDirectPath,
    };
  });

  if (!currentConversationId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        会話を選択してください
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={enhancedNodes}
        edges={enhancedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
