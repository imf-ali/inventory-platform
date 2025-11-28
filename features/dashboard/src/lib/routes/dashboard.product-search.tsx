import styles from './dashboard.product-search.module.css';

export function meta() {
  return [
    { title: 'Product Search - InventoryPro' },
    { name: 'description', content: 'Quickly find products with powerful search and filtering' },
  ];
}

export default function ProductSearchPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Product Search</h2>
        <p className={styles.subtitle}>Quickly find products with powerful search and filtering</p>
      </div>
      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon} role="img" aria-label="Search">🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name, SKU, barcode, or category..."
          />
          <button className={styles.searchBtn}>Search</button>
        </div>
        <div className={styles.filters}>
          <select className={styles.filterSelect}>
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="food">Food & Beverages</option>
          </select>
          <select className={styles.filterSelect}>
            <option value="">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>
      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <span className={styles.resultsCount}>Showing 12 results</span>
        </div>
        <div className={styles.productsGrid}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className={styles.productCard}>
              <div className={styles.productImage} role="img" aria-label="Product">📦</div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>Product Name {item}</h3>
                <p className={styles.productSku}>SKU: PROD-{item.toString().padStart(4, '0')}</p>
                <div className={styles.productDetails}>
                  <span className={styles.productPrice}>$99.99</span>
                  <span className={styles.productStock}>Stock: 45</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

