
import { Header } from "../components/Header";
import { MediaGrid } from "../components/MediaGrid";
import { useMedia } from "../context/MediaContext";

const HomePage = () => {
  const { filteredMedia, activeFilter, watchStatus } = useMedia();
  
  const getTitleText = () => {
    let typeText = activeFilter === 'movies' ? 'Movies' : 
                  activeFilter === 'tvshows' ? 'TV Shows' : 
                  'Media';
    
    let statusText = watchStatus === 'watched' ? 'Watched' : 
                    watchStatus === 'unwatched' ? 'To Watch' : 
                    'All';
    
    return `${statusText} ${typeText}`;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4 lg:px-8 container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{getTitleText()}</h1>
          <p className="text-muted-foreground">
            {filteredMedia.length} {filteredMedia.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        
        <MediaGrid media={filteredMedia} />
      </main>
    </div>
  );
};

export default HomePage;
