import type { ReactNode } from 'react';
import './globals.css';

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <a className="brand" href="/products">
              Cookbook Commerce
            </a>
            <nav aria-label="Primary navigation">
              <a href="/products">Products</a>
              <a href="/api/products">API</a>
            </nav>
          </header>
          {children}
          <footer className="site-footer">Built with shared URLKit contracts.</footer>
        </div>
      </body>
    </html>
  );
}
