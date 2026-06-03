import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Link, Navigate, Outlet, RouterProvider } from 'react-router';
import { loader as productDetailLoader, ProductDetailRoute } from './routes/product-detail.js';
import { loader as productsLoader, ProductsRoute } from './routes/products.js';
import './styles.css';

function AppLayout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/products">
          Cookbook Commerce
        </Link>
        <nav aria-label="Primary navigation">
          <Link to="/products">Products</Link>
        </nav>
      </header>
      <Outlet />
      <footer className="site-footer">Built with shared URLKit contracts.</footer>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/products" replace /> },
      { path: 'products', loader: productsLoader, element: <ProductsRoute /> },
      { path: 'products/:slug', loader: productDetailLoader, element: <ProductDetailRoute /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
