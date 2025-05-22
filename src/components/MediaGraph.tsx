
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mediaData } from "../data/mediaData";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { toast } from "sonner";

interface GraphNode {
  id: string;
  title: string;
  type: 'movie' | 'tvshow';
  x: number;
  y: number;
  radius: number;
}

interface GraphLink {
  source: string;
  target: string;
}

export const MediaGraph = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const navigate = useNavigate();
  
  // Initialize graph data
  useEffect(() => {
    const nodeRadius = 20;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 3;
    const radius = Math.min(window.innerWidth, window.innerHeight) / 3;
    
    // Create nodes
    const graphNodes: GraphNode[] = mediaData.map((media, i) => {
      const angle = (i / mediaData.length) * 2 * Math.PI;
      return {
        id: media.id,
        title: media.title,
        type: media.type,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        radius: nodeRadius
      };
    });
    
    // Create links
    const graphLinks: GraphLink[] = [];
    mediaData.forEach(media => {
      media.relatedMedia.forEach(relatedId => {
        // Avoid duplicate links
        const existingLink = graphLinks.find(
          link => 
            (link.source === media.id && link.target === relatedId) || 
            (link.source === relatedId && link.target === media.id)
        );
        
        if (!existingLink) {
          graphLinks.push({
            source: media.id,
            target: relatedId
          });
        }
      });
    });
    
    setNodes(graphNodes);
    setLinks(graphLinks);
    
    toast("Hover over nodes to see connections, click to view details", {
      duration: 5000,
    });
  }, []);
  
  // Draw the graph
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Resize canvas to full container size
    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        drawGraph();
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Function to draw the graph
    function drawGraph() {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw links
      links.forEach(link => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        
        if (sourceNode && targetNode) {
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          
          // Highlight connections for selected node
          if (selectedNode && 
              (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id)) {
            ctx.strokeStyle = '#ec4899'; // cinema-highlight
            ctx.lineWidth = 2;
          } else {
            ctx.strokeStyle = '#6b7280'; // muted gray
            ctx.lineWidth = 1;
          }
          
          ctx.stroke();
        }
      });
      
      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        
        // Fill based on media type
        if (node.type === 'movie') {
          ctx.fillStyle = '#1c1e25'; // cinema-card
        } else {
          ctx.fillStyle = '#1c1e25'; // cinema-card
        }
        
        ctx.fill();
        
        // Stroke color based on selection
        if (selectedNode && selectedNode.id === node.id) {
          ctx.strokeStyle = '#ec4899'; // cinema-highlight
          ctx.lineWidth = 3;
        } else {
          ctx.strokeStyle = node.type === 'movie' ? '#6d28d9' : '#ec4899'; // cinema-accent or cinema-highlight
          ctx.lineWidth = 2;
        }
        
        ctx.stroke();
        
        // Draw node label
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Wrap text to fit in node
        const words = node.title.split(' ');
        let line = '';
        let y = node.y + node.radius + 15;
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > 100 && i > 0) {
            ctx.fillText(line, node.x, y);
            line = words[i] + ' ';
            y += 12;
          } else {
            line = testLine;
          }
        }
        
        ctx.fillText(line, node.x, y);
      });
    }
    
    drawGraph();
    
    // Handle mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Check if mouse is over a node
      let hoveredNode = null;
      for (const node of nodes) {
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < node.radius) {
          hoveredNode = node;
          break;
        }
      }
      
      if (hoveredNode !== selectedNode) {
        setSelectedNode(hoveredNode);
        canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
        drawGraph();
      }
    };
    
    const handleClick = () => {
      if (selectedNode) {
        navigate(`/media/${selectedNode.id}`);
      }
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [nodes, links, selectedNode, navigate]);
  
  return (
    <div className="py-8 px-4 container mx-auto flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Media Connections Graph</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Info size={16} />
          <span className="hidden sm:inline">Click on nodes to view details</span>
        </Button>
      </div>
      
      <div 
        className="flex-1 bg-cinema-dark border border-gray-800 rounded-lg overflow-hidden"
        ref={containerRef}
      >
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>
      
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
