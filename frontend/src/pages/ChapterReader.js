import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useChapter } from '../hooks/useChapter';
import { useAuth } from '../contexts/AuthContext';
import { addReadingHistory } from '../services/api';
import Loading from '../components/common/Loading';
import { formatDate, getImageUrl } from '../utils/helpers';
import './ChapterReader.css';

const ChapterReader = () => {
  const { id } = useParams();
  const { chapter, loading, error } = useChapter(id);
  const { isAuthenticated } = useAuth();
  const contentRef = useRef(null);
  const scrollSaved = useRef(false);

  // Lưu scroll position vào localStorage
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        localStorage.setItem(`chapter_${id}_scroll`, scrollPosition.toString());
      }
    };

    // Throttle scroll event để không gọi quá nhiều
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [id]);

  // Khôi phục scroll position khi load chapter
  useEffect(() => {
    if (chapter && !loading && !scrollSaved.current) {
      const savedScroll = localStorage.getItem(`chapter_${id}_scroll`);
      if (savedScroll) {
        // Đợi DOM render và images load
        setTimeout(() => {
          const imageElements = document.querySelectorAll('.chapter-page');
          if (imageElements.length > 0) {
            // Đợi ít nhất một số images load
            let loadedCount = 0;
            const totalImages = imageElements.length;
            const minLoad = Math.min(5, totalImages); // Load ít nhất 5 ảnh đầu hoặc tất cả
            
            const checkAllLoaded = () => {
              loadedCount++;
              if (loadedCount >= minLoad) {
                setTimeout(() => {
                  window.scrollTo({
                    top: parseInt(savedScroll, 10),
                    behavior: 'smooth'
                  });
                  scrollSaved.current = true;
                }, 200);
              }
            };

            imageElements.forEach((img) => {
              if (img.complete) {
                checkAllLoaded();
              } else {
                img.onload = checkAllLoaded;
                img.onerror = checkAllLoaded;
              }
            });

            // Fallback: scroll sau 1.5 giây nếu chưa load đủ
            setTimeout(() => {
              if (!scrollSaved.current) {
                window.scrollTo({
                  top: parseInt(savedScroll, 10),
                  behavior: 'smooth'
                });
                scrollSaved.current = true;
              }
            }, 1500);
          } else {
            // Nếu không có images, scroll ngay
            window.scrollTo({
              top: parseInt(savedScroll, 10),
              behavior: 'smooth'
            });
            scrollSaved.current = true;
          }
        }, 100);
      } else {
        scrollSaved.current = true; // Đánh dấu đã xử lý
      }
    }
  }, [chapter, loading, id]);

  useEffect(() => {
    if (chapter && isAuthenticated && chapter.comic?.id) {
      addReadingHistory(chapter.comic.id, id).catch(err => {
        console.error('Error adding reading history:', err);
      });
    }
  }, [chapter, isAuthenticated, id]);

  if (loading) {
    return <Loading />;
  }

  if (error || !chapter) {
    return <div className="error-message">{error || 'Không tìm thấy chương'}</div>;
  }

  // Parse images - đảm bảo là array
  let images = [];
  if (chapter.images) {
    if (typeof chapter.images === 'string') {
      try {
        const parsed = JSON.parse(chapter.images);
        images = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Error parsing images:', e, 'Raw images:', chapter.images);
        images = [];
      }
    } else if (Array.isArray(chapter.images)) {
      images = chapter.images.filter(img => img && img.trim()); // Lọc bỏ null/empty
    }
  }
  
  // Debug log
  if (images.length === 0 && chapter.images) {
    console.warn('No images found. Chapter images data:', chapter.images);
  }
  
  const chapterDate = chapter.created_at ? formatDate(chapter.created_at) : '';

  return (
    <div className="chapter-reader">
      <div className="container">
        {/* Tiêu đề */}
        <div className="chapter-header">
          <Link to={`/comic/${chapter.comic?.id}`} className="back-link">
            ← Về trang truyện
          </Link>
          <div className="chapter-title-section">
            <h1 className="chapter-title">
              {chapter.comic?.title} - Chương {chapter.chapter_number}
              {chapter.title && `: ${chapter.title}`}
            </h1>
            {chapterDate && (
              <p className="chapter-date">Ngày đăng: {chapterDate}</p>
            )}
          </div>
        </div>

        {/* Navigation top */}
        <div className="chapter-navigation">
          {chapter.prevChapter ? (
            <Link to={`/chapter/${chapter.prevChapter.id}`} className="nav-btn prev">
              ← Chương trước
            </Link>
          ) : (
            <span className="nav-btn disabled">← Chương trước</span>
          )}
          
          <Link to={`/comic/${chapter.comic?.id}`} className="nav-btn back">
            Danh sách chương
          </Link>
          
          {chapter.nextChapter ? (
            <Link to={`/chapter/${chapter.nextChapter.id}`} className="nav-btn next">
              Chương sau →
            </Link>
          ) : (
            <span className="nav-btn disabled">Chương sau →</span>
          )}
        </div>

        {/* Nội dung chương */}
        <div className="chapter-content" ref={contentRef}>
          {images.length > 0 ? (
            images.map((image, index) => {
              if (!image || typeof image !== 'string') {
                console.warn(`Invalid image at index ${index}:`, image);
                return null;
              }
              
              const imageUrl = getImageUrl(image);
              if (!imageUrl) {
                console.warn(`Failed to generate URL for image:`, image);
                return null;
              }
              
              return (
                <div key={index} className="chapter-page-wrapper">
                  <img
                    src={imageUrl}
                    alt={`Page ${index + 1}`}
                    className="chapter-page"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Failed to load image:', imageUrl, 'Original path:', image);
                      e.target.src = 'https://via.placeholder.com/800x1200?text=Image+Not+Found';
                    }}
                    onLoad={() => {
                      console.log('Successfully loaded image:', imageUrl);
                    }}
                  />
                </div>
              );
            }).filter(Boolean) // Lọc bỏ null
          ) : (
            <div className="no-content">
              <p>Chưa có nội dung cho chương này</p>
              {process.env.NODE_ENV === 'development' && (
                <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px', fontSize: '12px' }}>
                  <p><strong>Debug Info:</strong></p>
                  <p>Chapter ID: {chapter.id}</p>
                  <p>Images type: {typeof chapter.images}</p>
                  <p>Images value: {JSON.stringify(chapter.images)}</p>
                  <p>Parsed images count: {images.length}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation bottom */}
        <div className="chapter-navigation bottom">
          {chapter.prevChapter ? (
            <Link to={`/chapter/${chapter.prevChapter.id}`} className="nav-btn prev">
              ← Chương trước
            </Link>
          ) : (
            <span className="nav-btn disabled">← Chương trước</span>
          )}
          
          <Link to={`/comic/${chapter.comic?.id}`} className="nav-btn back">
            Danh sách chương
          </Link>
          
          {chapter.nextChapter ? (
            <Link to={`/chapter/${chapter.nextChapter.id}`} className="nav-btn next">
              Chương sau →
            </Link>
          ) : (
            <span className="nav-btn disabled">Chương sau →</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterReader;

