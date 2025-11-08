import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCategories, getCountries } from '../services/api';
import { getImageUrl } from '../utils/helpers';
import Loading from '../components/common/Loading';
import './AdminComics.css';

const AdminComics = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [comics, setComics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingComic, setEditingComic] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    status: 'ongoing',
    country_id: '',
    category_ids: []
  });
  const [coverImage, setCoverImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedComic, setSelectedComic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [chapterFormData, setChapterFormData] = useState({
    comic_id: '',
    chapter_number: '',
    title: ''
  });
  const [chapterImages, setChapterImages] = useState([]);
  const [submittingChapter, setSubmittingChapter] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAuthenticated, user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [comicsRes, categoriesRes, countriesRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/comics?page=1&limit=50', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(res => res.json()),
        getCategories(),
        getCountries()
      ]);

      if (comicsRes.success && comicsRes.data) {
        // Kiểm tra nếu data là object có property data
        const comicsArray = Array.isArray(comicsRes.data) 
          ? comicsRes.data 
          : (comicsRes.data.data || []);
        setComics(comicsArray);
      } else {
        setComics([]);
      }
      
      if (categoriesRes.data.success) {
        const categoriesArray = Array.isArray(categoriesRes.data.data) 
          ? categoriesRes.data.data 
          : [];
        setCategories(categoriesArray);
      }
      
      if (countriesRes.data.success) {
        const countriesArray = Array.isArray(countriesRes.data.data) 
          ? countriesRes.data.data 
          : [];
        setCountries(countriesArray);
      }
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error('Error fetching data:', err);
      setComics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => {
      const category_ids = prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId];
      return { ...prev, category_ids };
    });
  };

  const handleCoverImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'category_ids') {
          formData.category_ids.forEach(id => {
            formDataToSend.append('category_ids[]', id);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (coverImage) {
        formDataToSend.append('cover_image', coverImage);
      }

      const url = editingComic 
        ? `http://localhost:5000/api/admin/comics/${editingComic.id}`
        : 'http://localhost:5000/api/admin/comics';
      
      const method = editingComic ? 'PUT' : 'POST';
      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setShowForm(false);
        setEditingComic(null);
        setFormData({
          title: '',
          author: '',
          description: '',
          status: 'ongoing',
          country_id: '',
          category_ids: []
        });
        setCoverImage(null);
        fetchData();
      } else {
        setError(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Không thể lưu truyện. Vui lòng thử lại.');
      console.error('Error saving comic:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (comic) => {
    setEditingComic(comic);
    setFormData({
      title: comic.title || '',
      author: comic.author || '',
      description: comic.description || '',
      status: comic.status || 'ongoing',
      country_id: comic.country_id || '',
      category_ids: comic.categories ? comic.categories.map(c => c.id) : []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa truyện này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/comics/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message || 'Không thể xóa truyện');
      }
    } catch (err) {
      setError('Không thể xóa truyện. Vui lòng thử lại.');
      console.error('Error deleting comic:', err);
    }
  };

  const handleManageChapters = async (comic) => {
    setSelectedComic(comic);
    setChapterFormData({
      comic_id: comic.id,
      chapter_number: '',
      title: ''
    });
    setChapterImages([]);
    setShowChapterForm(false);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/chapters/comic/${comic.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setChapters(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching chapters:', err);
      setChapters([]);
    }
  };

  const handleChapterInputChange = (e) => {
    const { name, value } = e.target;
    setChapterFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChapterImagesChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setChapterImages(files);
    }
  };

  const handleSubmitChapter = async (e) => {
    e.preventDefault();
    setSubmittingChapter(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('comic_id', chapterFormData.comic_id);
      formDataToSend.append('chapter_number', chapterFormData.chapter_number);
      if (chapterFormData.title) {
        formDataToSend.append('title', chapterFormData.title);
      }

      chapterImages.forEach((file) => {
        formDataToSend.append('chapter_images', file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/chapters', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setShowChapterForm(false);
        setChapterFormData({
          comic_id: selectedComic.id,
          chapter_number: '',
          title: ''
        });
        setChapterImages([]);
        handleManageChapters(selectedComic); // Refresh chapters list
      } else {
        setError(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Không thể tạo chương. Vui lòng thử lại.');
      console.error('Error creating chapter:', err);
    } finally {
      setSubmittingChapter(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        handleManageChapters(selectedComic); // Refresh chapters list
        fetchData(); // Refresh comics list to update total_chapters
      } else {
        setError(data.message || 'Không thể xóa chương');
      }
    } catch (err) {
      setError('Không thể xóa chương. Vui lòng thử lại.');
      console.error('Error deleting chapter:', err);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-comics-page">
      <div className="container">
        <div className="admin-header">
          <h1 className="page-title">Quản lý truyện</h1>
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditingComic(null);
              setFormData({
                title: '',
                author: '',
                description: '',
                status: 'ongoing',
                country_id: '',
                category_ids: []
              });
              setCoverImage(null);
            }}
            className="btn-add"
          >
            {showForm ? 'Hủy' : '+ Thêm truyện mới'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <div className="comic-form-section">
            <h2>{editingComic ? 'Chỉnh sửa truyện' : 'Thêm truyện mới'}</h2>
            <form onSubmit={handleSubmit} className="comic-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tên truyện *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập tên truyện"
                  />
                </div>

                <div className="form-group">
                  <label>Tác giả</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Nhập tên tác giả"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tình trạng</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="ongoing">Đang cập nhật</option>
                    <option value="completed">Hoàn thành</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Nước</label>
                  <select
                    name="country_id"
                    value={formData.country_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn nước</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Nhập mô tả truyện"
                />
              </div>

              <div className="form-group">
                <label>Thể loại</label>
                <div className="categories-checkboxes">
                  {categories.map(category => (
                    <label key={category.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.category_ids.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Ảnh bìa {!editingComic && '*'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  required={!editingComic}
                />
                {coverImage && (
                  <div className="image-preview">
                    <img 
                      src={URL.createObjectURL(coverImage)} 
                      alt="Preview" 
                      className="preview-img"
                    />
                  </div>
                )}
                {editingComic && !coverImage && (
                  <div className="image-preview">
                    <img 
                      src={getImageUrl(editingComic.cover_image) || 'https://via.placeholder.com/200x300'} 
                      alt="Current" 
                      className="preview-img"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x300';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : editingComic ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingComic(null);
                  }}
                  className="btn-cancel"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="comics-table-section">
          <h2>Danh sách truyện</h2>
          <div className="comics-table">
            <table>
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên truyện</th>
                  <th>Tác giả</th>
                  <th>Tình trạng</th>
                  <th>Số chương</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(comics) && comics.length > 0 ? (
                  comics.map(comic => (
                    <tr key={comic.id}>
                      <td>
                        <img 
                          src={getImageUrl(comic.cover_image) || 'https://via.placeholder.com/60x80'} 
                          alt={comic.title}
                          className="table-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60x80';
                          }}
                        />
                      </td>
                      <td>{comic.title}</td>
                      <td>{comic.author || '-'}</td>
                      <td>
                        <span className={`status-badge ${comic.status}`}>
                          {comic.status === 'ongoing' ? 'Đang ra' : 'Hoàn thành'}
                        </span>
                      </td>
                      <td>{comic.total_chapters || 0}</td>
                      <td>
                        <div className="action-buttons-table">
                          <button 
                            onClick={() => handleEdit(comic)}
                            className="btn-edit"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleManageChapters(comic)}
                            className="btn-chapters"
                          >
                            Chương
                          </button>
                          <button 
                            onClick={() => handleDelete(comic.id)}
                            className="btn-delete"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      {loading ? 'Đang tải...' : 'Không có truyện nào'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal quản lý chương */}
        {selectedComic && (
          <div className="chapters-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Quản lý chương: {selectedComic.title}</h2>
                <button 
                  className="btn-close"
                  onClick={() => {
                    setSelectedComic(null);
                    setChapters([]);
                    setShowChapterForm(false);
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="chapters-actions">
                  <button 
                    onClick={() => setShowChapterForm(!showChapterForm)}
                    className="btn-add-chapter"
                  >
                    {showChapterForm ? 'Hủy' : '+ Thêm chương mới'}
                  </button>
                </div>

                {showChapterForm && (
                  <form onSubmit={handleSubmitChapter} className="chapter-form">
                    <div className="form-group">
                      <label>Số chương *</label>
                      <input
                        type="number"
                        name="chapter_number"
                        value={chapterFormData.chapter_number}
                        onChange={handleChapterInputChange}
                        required
                        min="1"
                        placeholder="Nhập số chương"
                      />
                    </div>

                    <div className="form-group">
                      <label>Tiêu đề chương</label>
                      <input
                        type="text"
                        name="title"
                        value={chapterFormData.title}
                        onChange={handleChapterInputChange}
                        placeholder="Nhập tiêu đề chương (tùy chọn)"
                      />
                    </div>

                    <div className="form-group">
                      <label>Ảnh chương * (có thể chọn nhiều ảnh)</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleChapterImagesChange}
                        required
                      />
                      <small>Chọn nhiều ảnh cùng lúc (Ctrl+Click hoặc Shift+Click để chọn nhiều). Thứ tự ảnh sẽ theo thứ tự bạn chọn.</small>
                      {chapterImages.length > 0 && (
                        <div className="images-preview">
                          <p className="images-count">Đã chọn <strong>{chapterImages.length}</strong> ảnh</p>
                          <div className="images-grid-preview">
                            {chapterImages.map((file, index) => (
                              <div key={index} className="image-preview-item">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt={`Preview ${index + 1}`}
                                  className="preview-thumbnail"
                                />
                                <span className="image-number">{index + 1}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setChapterImages([]);
                              // Reset file input
                              const fileInput = document.querySelector('input[type="file"][multiple]');
                              if (fileInput) fileInput.value = '';
                            }}
                            className="btn-clear-images"
                          >
                            Xóa tất cả ảnh
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-save" disabled={submittingChapter}>
                        {submittingChapter ? 'Đang tạo...' : 'Tạo chương'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="chapters-list-section">
                  <h3>Danh sách chương ({chapters.length})</h3>
                  {chapters.length > 0 ? (
                    <table className="chapters-table">
                      <thead>
                        <tr>
                          <th>Số chương</th>
                          <th>Tiêu đề</th>
                          <th>Ngày tạo</th>
                          <th>Lượt xem</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chapters.map(chapter => (
                          <tr key={chapter.id}>
                            <td>Chương {chapter.chapter_number}</td>
                            <td>{chapter.title || '-'}</td>
                            <td>{new Date(chapter.created_at).toLocaleDateString('vi-VN')}</td>
                            <td>{chapter.views || 0}</td>
                            <td>
                              <button 
                                onClick={() => handleDeleteChapter(chapter.id)}
                                className="btn-delete-small"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-chapters">Chưa có chương nào</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComics;

