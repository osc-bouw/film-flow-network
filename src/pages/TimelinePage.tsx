import { Header } from "../components/Header";
import { TimelineGraph } from "../components/TimelineGraph";
import { useMedia } from "../context/MediaContext";

const TimelinePage = () => {
  const { allMedia } = useMedia();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-black">
        {allMedia.length === 0 ? (
          <div className="flex items-center justify-center h-[50vh] text-center p-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">No media to display</h2>
              <p className="text-muted-foreground">Add some movies or TV shows to build your timeline.</p>
            </div>
          </div>
        ) : (
          <TimelineGraph />
        )}
      </main>
    </div>
  );
};

export default TimelinePage;
