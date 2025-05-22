import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMedia } from "../context/MediaContext";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { toast } from "sonner";
import ForceGraph3D from "3d-force-graph";
import SpriteText from "three-spritetext";
import * as THREE from "three";

interface GraphNode {
  id: string;
  title: string;
  type: "movie" | "tvshow";
  val: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const MediaGraph = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const navigate = useNavigate();
  const { allMedia } = useMedia();

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const graphData: GraphData = {
      nodes: allMedia.map(media => ({
        id: media.id,
        title: media.title,
        type: media.type,
        val: 1,
      })),
      links: [],
    };

    allMedia.forEach(media => {
      media.relatedMedia.forEach(relatedId => {
        const exists = graphData.links.some(link => {
          const sourceId = typeof link.source === "object" ? link.source.id : link.source;
          const targetId = typeof link.target === "object" ? link.target.id : link.target;
          return (
            (sourceId === media.id && targetId === relatedId) ||
            (sourceId === relatedId && targetId === media.id)
          );
        });

        if (!exists) {
          graphData.links.push({ source: media.id, target: relatedId });
        }
      });
    });

    const Graph = ForceGraph3D()(containerRef.current)
      .graphData(graphData)
      .backgroundColor("#0a0b0f")
      .nodeLabel(node => (node as GraphNode).title)
      .nodeColor(node => ((node as GraphNode).type === "movie" ? "#6d28d9" : "#ec4899"))
      .nodeVal(node => (node as GraphNode).val * 10)
      .linkColor(() => "#6b7280")
      .linkWidth(link => {
        const sourceId = typeof link.source === "object" ? link.source.id : link.source;
        const targetId = typeof link.target === "object" ? link.target.id : link.target;
        return selectedNode && (selectedNode.id === sourceId || selectedNode.id === targetId) ? 2 : 1;
      })
      .linkOpacity(0.5)
      .onNodeClick(node => navigate(`/media/${(node as GraphNode).id}`))
      .onNodeHover(node => {
        if (node) {
          setSelectedNode(node as GraphNode);
          Graph.linkWidth(link => {
            const sourceId = typeof link.source === "object" ? link.source.id : link.source;
            const targetId = typeof link.target === "object" ? link.target.id : link.target;
            return (node as GraphNode).id === sourceId || (node as GraphNode).id === targetId ? 2 : 1;
          });
          Graph.linkColor(link => {
            const sourceId = typeof link.source === "object" ? link.source.id : link.source;
            const targetId = typeof link.target === "object" ? link.target.id : link.target;
            return (node as GraphNode).id === sourceId || (node as GraphNode).id === targetId ? "#ec4899" : "#6b7280";
          });
        } else {
          setSelectedNode(null);
          Graph.linkWidth(1).linkColor("#6b7280");
        }
      })
      .nodeThreeObject(node => {
        const { title } = node as GraphNode;
        const sprite = new SpriteText(title);
        sprite.color = "white";
        sprite.textHeight = 2.5;
        (sprite as unknown as THREE.Object3D).position.set(0, 5, 0);
        return sprite;
      });

    Graph.cameraPosition({ z: 200 });

    toast("Click on nodes to see details, drag to rotate the graph", { duration: 5000 });

    const handleResize = () => {
      Graph.width(containerRef.current?.clientWidth || window.innerWidth)
        .height(containerRef.current?.clientHeight || window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate, allMedia, selectedNode]);

  return (
    <div className="py-8 px-4 container mx-auto flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Media Connections Graph</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Info size={16} />
          <span className="hidden sm:inline">Drag to rotate, scroll to zoom</span>
        </Button>
      </div>

      <div
        className="flex-1 bg-cinema-dark border border-gray-800 rounded-lg overflow-hidden"
        ref={containerRef}
      />

      {selectedNode && (
        <div className="mt-4 p-4 bg-cinema-card border border-gray-800 rounded-lg">
          <h2 className="text-xl font-bold">{selectedNode.title}</h2>
          <p className="text-sm text-muted-foreground capitalize">
            {selectedNode.type} • Click to view details
          </p>
        </div>
      )}
    </div>
  );
};