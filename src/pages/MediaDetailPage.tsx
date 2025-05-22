
import { Header } from "../components/Header";
import { MediaDetails } from "../components/MediaDetails";

const MediaDetailPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <MediaDetails />
      </main>
    </div>
  );
};

export default MediaDetailPage;
