
import { MediaProvider } from "../context/MediaContext";
import HomePage from "./HomePage";

const Index = () => {
  return (
    <MediaProvider>
      <HomePage />
    </MediaProvider>
  );
};

export default Index;
