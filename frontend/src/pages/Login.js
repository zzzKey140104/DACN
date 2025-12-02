import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: authLogin } = useAuth();

  useEffect(() => {
    // Check for account locked error from query params
    if (searchParams.get('error') === 'account_locked') {
      setError('Tài khoản của bạn đã bị khóa hoặc cấm vĩnh viễn. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData);
      if (response.data.success) {
        authLogin(response.data.data.token, response.data.data.user);
        navigate('/');
      } else {
        setError(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Đăng nhập</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message" style={{
              padding: '15px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '5px',
              color: '#c33',
              marginBottom: '20px'
            }}>
              {error}
              {error.includes('khóa') || error.includes('cấm') ? (
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  <p>Email: khanhhungbadong@gmail.com</p>
                  <p>Hotline: 0868686868</p>
                </div>
              ) : null}
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Nhập email của bạn"
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

