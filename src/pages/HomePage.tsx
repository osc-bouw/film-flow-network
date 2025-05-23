
import { Header } from "../components/Header";
import { MediaGrid } from "../components/MediaGrid";
import { MediaImportExport } from "../components/MediaImportExport";
import { Collections } from "../components/Collections";
import { useMedia } from "../context/MediaContext";

const HomePage = () => {
  const { filteredMedia, activeFilter, watchStatus, activeCollection, collections } = useMedia();
  
  const getTitleText = () => {
    let typeText = activeFilter === 'movies' ? 'Movies' : 
                  activeFilter === 'tvshows' ? 'TV Shows' : 
                  'Media';
    
    let statusText = watchStatus === 'watched' ? 'Watched' : 
                    watchStatus === 'unwatched' ? 'To Watch' : 
                    'All';
    
    let collectionText = '';
    if (activeCollection) {
      const collection = collections.find(c => c.id === activeCollection);
      collectionText = collection ? ` in ${collection.name}` : '';
    }
    
    return `${statusText} ${typeText}${collectionText}`;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4 lg:px-8 container mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 lg:w-72 shrink-0">
            <Collections />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">{getTitleText()}</h1>
                <p className="text-muted-foreground">
                  {filteredMedia.length} {filteredMedia.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              
              <MediaImportExport />
            </div>
            
            <MediaGrid media={filteredMedia} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
