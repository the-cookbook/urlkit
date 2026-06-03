import type { LinksFunction } from '@remix-run/node';
import { Links, Link, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import stylesHref from './styles.css?url';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: stylesHref }];

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
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
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
