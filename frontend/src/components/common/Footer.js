import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Về chúng tôi</h3>
            <p>Website đọc truyện tranh online miễn phí</p>
          </div>
          <div className="footer-section">
            <h3>Liên kết</h3>
            <ul>
              <li><a href="/">Trang chủ</a></li>
              <li><a href="/search">Tìm kiếm</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Thông tin</h3>
            <p>&copy; 2024 Truyện GG. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

