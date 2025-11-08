import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_PLACEHOLDER } from '../../constants';
import { getImageUrl } from '../../utils/helpers';
import './ComicCard.css';

const ComicCard = ({ comic }) => {
  return (
    <Link to={`/comic/${comic.id}`} className="comic-card">
      <div className="comic-cover">
        <img 
          src={getImageUrl(comic.cover_image) || IMAGE_PLACEHOLDER} 
          alt={comic.title}
          onError={(e) => {
            e.target.src = IMAGE_PLACEHOLDER;
          }}
        />
        <div className="comic-overlay">
          <span className="comic-status">
            {comic.status === 'ongoing' ? 'Đang ra' : comic.status === 'completed' ? 'Hoàn thành' : 'Tạm ngưng'}
          </span>
        </div>
      </div>
      <div className="comic-info">
        <h3 className="comic-title">{comic.title}</h3>
        <p className="comic-author">{comic.author || 'Chưa rõ tác giả'}</p>
        <div className="comic-stats">
          <span>👁 {comic.views || 0}</span>
          <span>📖 {comic.total_chapters || 0} chương</span>
        </div>
      </div>
    </Link>
  );
};

export default ComicCard;

