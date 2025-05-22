
import { Header } from "../components/Header";
import { MediaGraph } from "../components/MediaGraph";
import { useMedia } from "../context/MediaContext";

const GraphPage = () => {
  const { allMedia } = useMedia();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-black">
        {allMedia.length === 0 ? (
          <div className="flex items-center justify-center h-[50vh] text-center p-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">No media to display</h2>
              <p className="text-muted-foreground">
                Add some movies or TV shows to your collection to see connections between them.
              </p>
            </div>
          </div>
        ) : (
          <MediaGraph />
        )}
      </main>
    </div>
  );
};

export default GraphPage;
