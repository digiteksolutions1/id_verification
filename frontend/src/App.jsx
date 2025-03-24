import { Routes, Route } from "react-router-dom";
import Home from "./client/Home";
import Bio from "./client/Bio";
import IDDocs from "./client/IDDocs";
import AddressDocs from "./client/AddressDocs";
import Video from "./client/Video";

function App() {
  return (
    <Routes>
      <Route path="clients" element={<Home />} />
      <Route path="clients/bio" element={<Bio />} />
      <Route path="clients/id-docs" element={<IDDocs />} />
      <Route path="clients/address-docs" element={<AddressDocs />} />
      <Route path="clients/video" element={<Video />} />
    </Routes>
  );
}

export default App;
