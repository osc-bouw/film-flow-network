import { Header } from "../components/Header";
import { MediaGrid } from "../components/MediaGrid";
import { MediaImportExport } from "../components/MediaImportExport";
import { AddMediaButton } from "../components/AddMediaButton";
import { Collections } from "../components/Collections";
import { useMedia } from "../context/MediaContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const HomePage = () => {
  const {
    filteredMedia,
    activeFilter,
    watchStatus,
    activeCollection,
    collections,
    loading,
    setActiveCollection
  } = useMedia();
  
  const getTitleText = () => {
    const typeText = activeFilter === 'movies' ? 'Movies' : 
                  activeFilter === 'tvshows' ? 'TV Shows' : 
                  activeFilter === 'collections' ? 'Collections' :
                  'Media';
    
    const statusText = watchStatus === 'watched' ? 'Watched' : 
                    watchStatus === 'unwatched' ? 'To Watch' : 
                    'All';
    
    let collectionText = '';
    if (activeCollection) {
      const collection = collections.find(c => c.id === activeCollection);
      collectionText = collection ? ` in ${collection.name}` : '';
    }
    
    if (activeFilter === 'collections') {
      return 'Collections';
    }
    
    return `${statusText} ${typeText}${collectionText}`;
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your media library...</p>
          </div>
        </div>
      );
    }

    if (activeFilter === 'collections') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map(collection => (
            <Card key={collection.id} className="overflow-hidden hover:border-primary transition-colors">
              <Link
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  if (activeCollection === collection.id) {
                    setActiveCollection(null);
                  } else {
                    setActiveCollection(collection.id);
                  }
                }}
                className="block h-full"
              >
                <div className="aspect-video relative">
                  {collection.image ? (
                    <img 
                      src={collection.image} 
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <span className="text-xl font-semibold text-gray-400">{collection.name}</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {collection.mediaIds.length} items
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg">{collection.name}</h3>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      );
    }
    
    return <MediaGrid media={filteredMedia} />;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4 lg:px-8 container mx-auto homepage-main">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 lg:w-72 shrink-0">
            <Collections />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">{getTitleText()}</h1>
                {activeFilter !== 'collections' && !loading && (
                  <p className="text-muted-foreground">
                    {filteredMedia.length} {filteredMedia.length === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <AddMediaButton />
                <MediaImportExport />
              </div>
            </div>
            
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
