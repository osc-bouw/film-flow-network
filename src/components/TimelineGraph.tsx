import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ForceGraph3D, { ForceGraph3DInstance } from "3d-force-graph";
import { AddMediaButton } from "./AddMediaButton";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useMedia } from "../context/MediaContext";

interface GraphNode {
  id: string;
  title: string;
  type: "movie" | "tvshow";
  val: number;
}

interface GraphLink {
  source: string;
  target: string;
}

export const TimelineGraph = () => {
  const { allMedia, deleteMedia } = useMedia();
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraph3DInstance<GraphNode, GraphLink> | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear existing graph
    if (graphRef.current) {
      graphRef.current._destructor?.();
      containerRef.current.innerHTML = "";
    }

    const graphData = { nodes: [] as GraphNode[], links: [] as GraphLink[] };

    graphData.nodes = allMedia.map(m => ({
      id: m.id,
      title: m.title,
      type: m.type,
      val: 1,
    }));

    allMedia.forEach(media => {
      media.relatedMedia.forEach(rel => {
        if (!graphData.links.find(l => (l.source === media.id && l.target === rel) || (l.source === rel && l.target === media.id))) {
          graphData.links.push({ source: media.id, target: rel });
        }
      });
    });

    const Graph = ForceGraph3D()(containerRef.current)
      .graphData(graphData)
      .backgroundColor("#0a0b0f")
      .nodeLabel((node: GraphNode) => node.title)
      .nodeColor((node: GraphNode) => (node.type === "movie" ? "#6d28d9" : "#ec4899"))
      .nodeVal((node: GraphNode) => node.val * 10)
      .linkColor(() => "#6b7280")
      .linkOpacity(0.5)
      .onNodeClick((node: GraphNode) => {
        setSelectedNode(node);
      });

    Graph.cameraPosition({ z: 200 });
    graphRef.current = Graph;

    const handleResize = () => {
      Graph.width(containerRef.current?.clientWidth || window.innerWidth).height(
        containerRef.current?.clientHeight || window.innerHeight
      );
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [allMedia]);

  const handleDelete = () => {
    if (selectedNode) {
      deleteMedia(selectedNode.id);
      setSelectedNode(null);
    }
  };

  return (
    <div className="py-8 px-4 container mx-auto flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Timeline</h1>
        <div className="flex gap-2">
          <AddMediaButton />
          {selectedNode && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Remove Node
            </Button>
          )}
        </div>
      </div>
      <div
        className="flex-1 bg-cinema-dark border border-gray-800 rounded-lg overflow-hidden"
        ref={containerRef}
      />
      {selectedNode && (
        <div className="mt-4 p-4 bg-cinema-card border border-gray-800 rounded-lg flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{selectedNode.title}</h2>
            <p className="text-sm text-muted-foreground capitalize">{selectedNode.type}</p>
          </div>
          <Button variant="outline" onClick={() => navigate(`/media/${selectedNode.id}`)}>
            View Details
          </Button>
        </div>
      )}
    </div>
  );
};
