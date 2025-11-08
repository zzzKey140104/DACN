export const IMAGE_PLACEHOLDER = 'https://via.placeholder.com/200x300?text=No+Image';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const COMIC_STATUS = {
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  HIATUS: 'hiatus'
};

export const COMIC_STATUS_LABELS = {
  [COMIC_STATUS.ONGOING]: 'Đang ra',
  [COMIC_STATUS.COMPLETED]: 'Hoàn thành',
  [COMIC_STATUS.HIATUS]: 'Tạm ngưng'
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20
};

