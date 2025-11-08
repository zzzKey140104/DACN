import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import ComicsList from './pages/ComicsList';
import ComicDetail from './pages/ComicDetail';
import ChapterReader from './pages/ChapterReader';
import Search from './pages/Search';
import Category from './pages/Category';
import History from './pages/History';
import Favorites from './pages/Favorites';
import AdminComics from './pages/AdminComics';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Header />
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/comics" element={<ComicsList />} />
                <Route path="/comic/:id" element={<ComicDetail />} />
                <Route path="/chapter/:id" element={<ChapterReader />} />
                <Route path="/search" element={<Search />} />
                <Route path="/category/:id" element={<Category />} />
                <Route path="/history" element={<History />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/admin/comics" element={<AdminComics />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

