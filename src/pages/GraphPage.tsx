
import { Header } from "../components/Header";
import { MediaGraph } from "../components/MediaGraph";

const GraphPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <MediaGraph />
      </main>
    </div>
  );
};

export default GraphPage;
