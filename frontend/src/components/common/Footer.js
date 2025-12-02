import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <img
                src="/logo.jpg"
                alt="ReaCom logo"
                className="footer-logo-image"
              />
              <h2 className="logo-text">ReaCom</h2>
            </div>
            <p className="footer-description">
              Nền tảng đọc truyện tranh online miễn phí, cập nhật nhanh chóng với hàng ngàn bộ truyện đa dạng thể loại.
            </p>
            <div className="social-links">
              <button 
                type="button"
                className="social-link" 
                aria-label="Facebook"
                onClick={() => window.open('https://facebook.com', '_blank', 'noopener,noreferrer')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button 
                type="button"
                className="social-link" 
                aria-label="Twitter"
                onClick={() => window.open('https://twitter.com', '_blank', 'noopener,noreferrer')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button 
                type="button"
                className="social-link" 
                aria-label="YouTube"
                onClick={() => window.open('https://youtube.com', '_blank', 'noopener,noreferrer')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Liên kết nhanh</h3>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/ranking?type=day">Xếp hạng</Link></li>
              <li><Link to="/advanced-search">Tìm kiếm nâng cao</Link></li>
              <li><Link to="/comics">Tất cả truyện</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h3 className="footer-title">Xếp hạng</h3>
            <ul className="footer-links">
              <li><Link to="/ranking?type=day">Top ngày</Link></li>
              <li><Link to="/ranking?type=week">Top tuần</Link></li>
              <li><Link to="/ranking?type=month">Top tháng</Link></li>
              <li><Link to="/ranking?type=new_comic">Truyện mới</Link></li>
              <li><Link to="/ranking?type=full">Truyện hoàn thành</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="footer-title">Liên hệ</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <a href="mailto:khanhhungbadong@gmail.com">khanhhungbadong@gmail.com</a>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <a href="tel:0868686868">0868686868</a>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>Khu Công nghệ cao XLHN, Hiệp Phú, Thủ Đức, TP.HCM</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

