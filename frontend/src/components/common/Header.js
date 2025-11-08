import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Header.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>Truyện GG</h1>
          </Link>

          <button className="theme-toggle" onClick={toggleTheme} title={isDarkMode ? 'Chuyển sang sáng' : 'Chuyển sang tối'}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Tìm kiếm truyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>

          {isAuthenticated && user ? (
            <div className="user-menu">
              <button className="notification-btn" title="Thông báo">
                🔔
              </button>
              <div className="user-dropdown">
                <Link to="/profile" className="avatar-link">
                  <img 
                    src={user?.avatar || 'https://via.placeholder.com/40?text=U'} 
                    alt={user?.username}
                    className="avatar"
                  />
                </Link>
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">Hồ sơ</Link>
                  <button onClick={logout} className="dropdown-item">Đăng xuất</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Đăng nhập</Link>
              <Link to="/register" className="btn-register">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
