import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCategories } from '../../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Trang chủ
          </Link>
          
          <div 
            className="nav-link dropdown"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
            <span>Thể loại ▼</span>
            {showCategories && (
              <div className="dropdown-menu">
                {categories.map(category => (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="dropdown-item"
                    onClick={() => setShowCategories(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated && (
            <>
              <Link 
                to="/history" 
                className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}
              >
                Lịch sử
              </Link>
              <Link 
                to="/favorites" 
                className={`nav-link ${location.pathname === '/favorites' ? 'active' : ''}`}
              >
                Theo dõi
              </Link>
            </>
          )}

          {isAdmin && (
            <Link 
              to="/admin/comics" 
              className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
            >
              Quản lý truyện
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

