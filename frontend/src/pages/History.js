import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReadingHistory } from '../services/api';
import Loading from '../components/common/Loading';
import ComicCard from '../components/features/ComicCard';
import './History.css';

const History = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchHistory();
  }, [isAuthenticated, navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getReadingHistory(50);
      if (response.data.success) {
        setComics(response.data.data);
      }
    } catch (err) {
      setError('Không thể tải lịch sử đọc. Vui lòng thử lại sau.');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="history-page">
      <div className="container">
        <h1 className="page-title">Lịch sử đọc</h1>

        {error && <div className="error-message">{error}</div>}

        {comics.length > 0 ? (
          <div className="comics-grid-history">
            {comics.map(comic => (
              <div key={comic.id} className="history-item">
                <ComicCard comic={comic} />
                {comic.last_chapter_number && (
                  <div className="last-read-info">
                    <span>Đã đọc đến: Chương {comic.last_chapter_number}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>Bạn chưa đọc truyện nào</p>
            <p className="sub-text">Hãy bắt đầu đọc truyện để xem lịch sử ở đây!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

