import React, { useState, useEffect} from 'react';
import { categoryService } from '../services/api';
// import { AuthContext } from '../context/AuthContext';
import '../style/Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  // // Get current user from AuthContext
  // const { currentUser } = useContext(AuthContext);
  
  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Start adding new category
  const startAddCategory = () => {
    setFormData({ name: '', description: '' });
    setIsAdding(true);
    setEditingId(null);
  };

  // Start editing a category
  const startEditCategory = (category) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setEditingId(category.id);
    setIsAdding(false);
  };

  // Save category (create or update)
  const saveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isAdding) {
        await categoryService.createCategory(formData);
      } else {
        await categoryService.updateCategory(editingId, formData);
      }
      
      // Reset form and fetch updated list
      setFormData({ name: '', description: '' });
      setIsAdding(false);
      setEditingId(null);
      await fetchCategories();
    } catch (err) {
      setError(`Failed to ${isAdding ? 'create' : 'update'} category`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a category
  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setLoading(true);
      try {
        await categoryService.deleteCategory(id);
        await fetchCategories();
      } catch (err) {
        setError('Failed to delete category');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Cancel form editing/adding
  const cancelForm = () => {
    setFormData({ name: '', description: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="categories-container">
      <h1 className="categories-title">Quản lý danh mục</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="categories-actions">
        <button 
          onClick={startAddCategory} 
          className="add-category-btn"
          disabled={loading || isAdding || editingId !== null}
        >
          Thêm danh mục mới
        </button>
      </div>

      {(isAdding || editingId !== null) && (
        <div className="category-form-container">
          <h2>{isAdding ? 'Thêm danh mục mới' : 'Cập nhật danh mục'}</h2>
          <form onSubmit={saveCategory} className="category-form">
            <div className="form-group">
              <label htmlFor="name">Tên danh mục</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên danh mục"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả danh mục (không bắt buộc)"
                disabled={loading}
                rows={4}
              />
            </div>
            
            <div className="form-buttons">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : (isAdding ? 'Thêm danh mục' : 'Cập nhật')}
              </button>
              <button 
                type="button"
                onClick={cancelForm}
                className="cancel-btn"
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading && !isAdding && editingId === null ? (
        <div className="loading-indicator">Đang tải dữ liệu...</div>
      ) : (
        <div className="categories-list">
          {categories.length === 0 ? (
            <p>Không có danh mục nào.</p>
          ) : (
            <table className="categories-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.description || 'Không có mô tả'}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => startEditCategory(category)}
                        className="edit-btn"
                        disabled={loading || isAdding || editingId !== null}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="delete-btn"
                        disabled={loading || isAdding || editingId !== null}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Categories;