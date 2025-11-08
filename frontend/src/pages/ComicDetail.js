import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useComic } from '../hooks/useComic';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavorite, checkFavorite, toggleLike, checkLike, addReadingHistory, getReadingHistoryByComic } from '../services/api';
import Loading from '../components/common/Loading';
import { COMIC_STATUS_LABELS, IMAGE_PLACEHOLDER } from '../constants';
import { formatDate, getImageUrl } from '../utils/helpers';
import './ComicDetail.css';

const ComicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { comic, loading, error } = useComic(id);
  const { isAuthenticated, user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [lastReadChapter, setLastReadChapter] = useState(null);

  useEffect(() => {
    if (comic && isAuthenticated) {
      checkFavoriteStatus();
      checkLikeStatus();
      fetchLastReadChapter();
    }
  }, [comic, isAuthenticated]);

  const fetchLastReadChapter = async () => {
    try {
      const response = await getReadingHistoryByComic(id);
      if (response.data.success && response.data.data) {
        const history = response.data.data;
        // Tìm chapter trong danh sách chapters của comic
        if (comic.chapters && history.chapter_id) {
          const chapter = comic.chapters.find(ch => ch.id === history.chapter_id);
          if (chapter) {
            setLastReadChapter(chapter);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching last read chapter:', err);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await checkFavorite(id);
      if (response.data.success) {
        setIsFavorite(response.data.data.isFavorite);
      }
    } catch (err) {
      console.error('Error checking favorite:', err);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const response = await checkLike(id);
      if (response.data.success) {
        setIsLiked(response.data.data.isLiked);
      }
    } catch (err) {
      console.error('Error checking like:', err);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setLoadingAction(true);
      const response = await toggleFavorite(id);
      if (response.data.success) {
        setIsFavorite(response.data.data.isFavorite);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setLoadingAction(true);
      const response = await toggleLike(id);
      if (response.data.success) {
        setIsLiked(response.data.data.isLiked);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReadFromStart = () => {
    if (comic?.chapters && comic.chapters.length > 0) {
      const firstChapter = comic.chapters[0];
      navigate(`/chapter/${firstChapter.id}`);
    }
  };

  const handleContinueReading = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Lấy chương đã đọc gần nhất từ history
    if (lastReadChapter) {
      navigate(`/chapter/${lastReadChapter.id}`);
    } else if (comic?.chapters && comic.chapters.length > 0) {
      // Nếu chưa có lịch sử, đọc từ đầu
      handleReadFromStart();
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !comic) {
    return <div className="error-message">{error || 'Không tìm thấy truyện'}</div>;
  }

  const firstChapter = comic.chapters && comic.chapters.length > 0 ? comic.chapters[0] : null;

  return (
    <div className="comic-detail">
      <div className="container">
        {/* Table 1: Thông tin truyện */}
        <div className="comic-info-section">
          <div className="comic-cover-large">
            <img 
              src={getImageUrl(comic.cover_image) || IMAGE_PLACEHOLDER} 
              alt={comic.title}
              onError={(e) => {
                e.target.src = IMAGE_PLACEHOLDER;
              }}
            />
          </div>
          <div className="comic-info-content">
            <h1 className="comic-title-large">{comic.title}</h1>
            <div className="comic-meta-grid">
              <div className="meta-item">
                <strong>Tác giả:</strong>
                <span>{comic.author || 'Chưa rõ'}</span>
              </div>
              <div className="meta-item">
                <strong>Tình trạng:</strong>
                <span className={`status-badge ${comic.status}`}>
                  {COMIC_STATUS_LABELS[comic.status] || comic.status}
                </span>
              </div>
              <div className="meta-item">
                <strong>Lượt thích:</strong>
                <span>❤️ {comic.likes || 0}</span>
              </div>
              <div className="meta-item">
                <strong>Lượt theo dõi:</strong>
                <span>⭐ {comic.follows || 0}</span>
              </div>
              <div className="meta-item">
                <strong>Lượt xem:</strong>
                <span>👁 {comic.views || 0}</span>
              </div>
              <div className="meta-item">
                <strong>Thể loại:</strong>
                <div className="categories-list">
                  {comic.categories && comic.categories.length > 0 ? (
                    comic.categories.map(cat => (
                      <Link key={cat.id} to={`/category/${cat.id}`} className="category-tag">
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <span>Chưa có</span>
                  )}
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button 
                onClick={handleReadFromStart} 
                className="btn-action btn-primary"
                disabled={!firstChapter}
              >
                Đọc từ đầu
              </button>
              <button 
                onClick={handleFavorite} 
                className={`btn-action ${isFavorite ? 'btn-favorite active' : 'btn-favorite'}`}
                disabled={loadingAction || !isAuthenticated}
              >
                {isFavorite ? '✓ Đã theo dõi' : 'Theo dõi'}
              </button>
              <button 
                onClick={handleLike} 
                className={`btn-action ${isLiked ? 'btn-like active' : 'btn-like'}`}
                disabled={loadingAction || !isAuthenticated}
              >
                {isLiked ? '❤️ Đã thích' : '🤍 Thích'}
              </button>
              <button 
                onClick={handleContinueReading} 
                className="btn-action btn-continue"
                disabled={!firstChapter || !isAuthenticated}
              >
                {lastReadChapter ? `Đọc tiếp Chương ${lastReadChapter.chapter_number}` : 'Đọc từ đầu'}
              </button>
            </div>
          </div>
        </div>

        {/* Table 2: Giới thiệu */}
        {comic.description && (
          <div className="comic-description-section">
            <h2>Giới thiệu</h2>
            <p>{comic.description}</p>
          </div>
        )}

        {/* Table 3: Danh sách chương */}
        <div className="chapters-section">
          <h2>Danh sách chương</h2>
          <div className="chapters-list">
            {comic.chapters && comic.chapters.length > 0 ? (
              comic.chapters.map((chapter) => (
                <Link 
                  key={chapter.id} 
                  to={`/chapter/${chapter.id}`}
                  className="chapter-item"
                  onClick={async () => {
                    if (isAuthenticated) {
                      try {
                        await addReadingHistory(id, chapter.id);
                      } catch (err) {
                        console.error('Error adding reading history:', err);
                      }
                    }
                  }}
                >
                  <span className="chapter-number">Chương {chapter.chapter_number}</span>
                  {chapter.title && <span className="chapter-title">: {chapter.title}</span>}
                  <span className="chapter-date">
                    {formatDate(chapter.created_at)}
                  </span>
                </Link>
              ))
            ) : (
              <p className="no-chapters">Chưa có chương nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicDetail;
