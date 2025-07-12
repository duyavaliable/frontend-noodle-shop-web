import React, { useState, useEffect } from 'react';
import { productService, categoryService } from '../services/api';
import '../style/Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  
  // Load products và categories khi component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch tất cả sản phẩm
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách món ăn');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tất cả danh mục để hiển thị trong dropdown
  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError('Không thể tải danh mục');
      console.error(err);
    }
  };

  // Xử lý thay đổi trong form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Bắt đầu thêm món ăn mới
  const startAddProduct = () => {
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      category_id: '', 
      image_url: '' 
    });
    setIsAdding(true);
    setEditingId(null);
  };

  // Bắt đầu chỉnh sửa món ăn
  const startEditProduct = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category_id: product.category_id,
      image_url: product.image_url || ''
    });
    setEditingId(product.id);
    setIsAdding(false);
  };

  // Lưu món ăn (tạo mới hoặc cập nhật)
  const saveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Đảm bảo giá được lưu dưới dạng số
    const productData = {
      ...formData,
      price: parseFloat(formData.price)
    };
    
    try {
      if (isAdding) {
        await productService.createProduct(productData);
      } else {
        await productService.updateProduct(editingId, productData);
      }
      
      // Reset form và lấy danh sách cập nhật
      setFormData({ name: '', description: '', price: '', category_id: '', image_url: '' });
      setIsAdding(false);
      setEditingId(null);
      await fetchProducts();
    } catch (err) {
      setError(`Không thể ${isAdding ? 'thêm' : 'cập nhật'} món ăn`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xóa món ăn
  const deleteProduct = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa món ăn này?')) {
      setLoading(true);
      try {
        await productService.deleteProduct(id);
        await fetchProducts();
      } catch (err) {
        setError('Không thể xóa món ăn');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Hủy form
  const cancelForm = () => {
    setFormData({ name: '', description: '', price: '', category_id: '', image_url: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="products-container">
      <h1 className="products-title">Quản lý món ăn</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="products-actions">
        <button 
          onClick={startAddProduct} 
          className="add-product-btn"
          disabled={loading || isAdding || editingId !== null}
        >
          Thêm món ăn mới
        </button>
      </div>

      {(isAdding || editingId !== null) && (
        <div className="product-form-container">
          <h2>{isAdding ? 'Thêm món ăn mới' : 'Cập nhật món ăn'}</h2>
          <form onSubmit={saveProduct} className="product-form">
            <div className="form-group">
              <label htmlFor="name">Tên món ăn</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên món ăn"
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
                placeholder="Nhập mô tả món ăn"
                disabled={loading}
                rows={4}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Giá (VNĐ)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Nhập giá món ăn"
                required
                min="0"
                step="1000"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category_id">Danh mục</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="image_url">URL hình ảnh</label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="Nhập URL hình ảnh món ăn"
                disabled={loading}
              />
            </div>
            
            <div className="form-buttons">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : (isAdding ? 'Thêm món ăn' : 'Cập nhật')}
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
        <div className="products-list">
          {products.length === 0 ? (
            <p>Không có món ăn nào.</p>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hình ảnh</th>
                  <th>Tên món</th>
                  <th>Mô tả</th>
                  <th>Giá</th>
                  <th>Danh mục</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="product-thumbnail" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                          }}
                        />
                      ) : (
                        <img 
                          src="https://via.placeholder.com/50?text=No+Image" 
                          alt="No Image" 
                          className="product-thumbnail"
                        />
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{product.description || 'Không có mô tả'}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>{product.categoryName || 'Không có danh mục'}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => startEditProduct(product)}
                        className="edit-btn"
                        disabled={loading || isAdding || editingId !== null}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
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

export default Products;