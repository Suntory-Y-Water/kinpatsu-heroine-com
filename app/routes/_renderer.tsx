import { html } from 'hono/html';
import { jsxRenderer } from 'hono/jsx-renderer';
import { Link, Script } from 'honox/server';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default jsxRenderer(({ children, metadata }) => {
  return (
    <html lang='ja'>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta property='og:title' content={metadata?.title} />
        <meta property='og:description' content={metadata?.description} />
        <meta property='og:type' content={metadata?.ogType ?? 'website'} />
        <meta property='og:url' content={metadata?.canonical} />
        <meta property='og:image' content={metadata?.ogImage} />
        <meta property='og:site_name' content='金髪ヒロイン.com' />
        <meta name='description' content={metadata?.description} />
        <meta name='keywords' content={metadata?.keywords?.join(', ')} />
        <meta name='author' content={metadata?.author} />
        {metadata?.noindex && <meta name='robots' content='noindex' />}
        <meta name='twitter:card' content={metadata?.twitterCard} />
        <meta name='twitter:title' content={metadata?.title} />
        <meta name='twitter:description' content={metadata?.description} />
        <meta name='twitter:image' content={metadata?.ogImage} />
        {import.meta.env.PROD ? <GoogleAnalytics /> : null}
        <title>{metadata?.title ?? '金髪ヒロイン.com'}</title>
        <link rel='icon' href='/favicon.ico' />
        <Link href='/app/style.css' rel='stylesheet' />
        <Script src='/app/client.ts' async />
      </head>
      <body className='min-h-screen bg-background-light flex flex-col'>
        <Header />
        <main className='flex-1'>{children}</main>
        <Footer />
      </body>
    </html>
  );
});

function GoogleAnalytics() {
  return (
    <>
      <script
        async
        src='https://www.googletagmanager.com/gtag/js?id=G-JMXK8G36PG'
      />
      {html`
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-JMXK8G36PG');
        </script>
      `}
    </>
  );
}
