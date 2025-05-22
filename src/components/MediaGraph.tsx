
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mediaData } from "../data/mediaData";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { toast } from "sonner";
import ForceGraph3D from "3d-force-graph";

interface GraphNode {
  id: string;
  title: string;
  type: 'movie' | 'tvshow';
  val: number; // Size of the node
}

interface GraphLink {
  source: string;
  target: string;
}

export const MediaGraph = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const navigate = useNavigate();
  
  // Initialize graph
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear any existing graph
    containerRef.current.innerHTML = '';
    
    // Prepare data for the 3D force graph
    const graphData = {
      nodes: mediaData.map(media => ({
        id: media.id,
        title: media.title,
        type: media.type,
        val: 1, // Default size
      })),
      links: []
    };
    
    // Create links between related media
    mediaData.forEach(media => {
      media.relatedMedia.forEach(relatedId => {
        // Avoid duplicate links
        const existingLink = graphData.links.find(
          link => 
            (link.source === media.id && link.target === relatedId) || 
            (link.source === relatedId && link.target === media.id)
        );
        
        if (!existingLink) {
          graphData.links.push({
            source: media.id,
            target: relatedId
          });
        }
      });
    });
    
    // Initialize the 3D force graph
    const Graph = ForceGraph3D()(containerRef.current)
      .graphData(graphData)
      .backgroundColor("#0a0b0f")
      .nodeLabel(node => (node as GraphNode).title)
      .nodeColor(node => {
        const n = node as GraphNode;
        return n.type === 'movie' ? '#6d28d9' : '#ec4899';
      })
      .nodeVal(node => (node as GraphNode).val * 10) // Size multiplier
      .linkColor(() => '#6b7280')
      .linkWidth(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (
          selectedNode && 
          (selectedNode.id === sourceId || selectedNode.id === targetId)
        ) {
          return 2; // Thicker lines for selected node links
        }
        return 1;
      })
      .linkOpacity(0.5)
      .onNodeClick(node => {
        navigate(`/media/${node.id}`);
      })
      .onNodeHover(node => {
        if (node) {
          setSelectedNode(node as GraphNode);
          
          // Highlight connections
          Graph.linkWidth(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            
            if (node.id === sourceId || node.id === targetId) {
              return 2;
            }
            return 1;
          });
          
          Graph.linkColor(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            
            if (node.id === sourceId || node.id === targetId) {
              return '#ec4899'; // cinema-highlight
            }
            return '#6b7280'; // muted gray
          });
        } else {
          setSelectedNode(null);
          
          // Reset links
          Graph.linkWidth(1)
            .linkColor('#6b7280');
        }
      });
    
    // Custom node rendering
    Graph.nodeThreeObject(node => {
      const { title, type } = node as GraphNode;
      
      // Use the 3d-force-graph API to create a text sprite
      const sprite = new window.SpriteText(title);
      sprite.color = 'white';
      sprite.textHeight = 2.5;
      sprite.position.y = 5;
      
      return sprite;
    });
    
    // Adjust initial camera distance
    Graph.cameraPosition({ z: 200 });
    
    toast("Click on nodes to see details, drag to rotate the graph", {
      duration: 5000,
    });
    
    // Handle window resize
    const handleResize = () => {
      Graph.width(containerRef.current?.clientWidth || window.innerWidth)
          .height(containerRef.current?.clientHeight || window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate]);
  
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
