import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NovelDashboard from './pages/NovelDashboard';
import CreateNovel from './pages/CreateNovel';
import NovelDetails from './pages/NovelDetails';
import ChapterEditor from './pages/ChapterEditor';
import CoverGenerator from './pages/CoverGenerator';
import Settings from './pages/Settings';

function App() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Box as="main" pt="16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<NovelDashboard />} />
          <Route path="/create" element={<CreateNovel />} />
          <Route path="/novel/:id" element={<NovelDetails />} />
          <Route path="/novel/:id/chapter/:chapterNumber" element={<ChapterEditor />} />
          <Route path="/novel/:id/cover" element={<CoverGenerator />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
