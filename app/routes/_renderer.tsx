import { jsxRenderer } from 'hono/jsx-renderer';
import { Link, Script } from 'honox/server';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default jsxRenderer(
  ({ children, title, description, openGraph, twitter }) => {
    return (
      <html lang='ja'>
        <head>
          <meta charset='utf-8' />
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1.0'
          />
          <meta
            property='og:title'
            content={
              openGraph?.title
                ? `${openGraph.title} - 金髪ヒロイン.com`
                : '金髪ヒロイン.com'
            }
          />
          <meta
            property='og:description'
            content={
              openGraph?.description ??
              'アニメの金髪ヒロインに特化した情報サイトです。お気に入りのキャラクターを見つけて、新しい作品との出会いを楽しみましょう。'
            }
          />
          <meta property='og:type' content='website' />
          <meta
            property='og:url'
            content={
              openGraph?.url ??
              'https://kinpatsu-heroine-com.ayasnppk00.workers.dev'
            }
          />
          <meta
            property='og:image'
            content={
              openGraph?.images ??
              'https://kinpatsu-heroine-com.ayasnppk00.workers.dev/ogp.png'
            }
          />
          <meta
            name='description'
            content={
              description ??
              'アニメの金髪ヒロインに特化した情報サイトです。お気に入りのキャラクターを見つけて、新しい作品との出会いを楽しみましょう。'
            }
          />
          <meta name='twitter:card' content='summary_large_image' />
          <meta
            name='twitter:title'
            content={
              twitter?.title
                ? `${twitter.title} - 金髪ヒロイン.com`
                : '金髪ヒロイン.com'
            }
          />
          <meta
            name='twitter:description'
            content={
              twitter?.description ??
              'アニメの金髪ヒロインに特化した情報サイトです。お気に入りのキャラクターを見つけて、新しい作品との出会いを楽しみましょう。'
            }
          />
          <meta
            name='twitter:image'
            content={
              twitter?.images ??
              'https://kinpatsu-heroine-com.ayasnppk00.workers.dev/ogp.png'
            }
          />
          <title>
            {title ? `${title} - 金髪ヒロイン.com` : '金髪ヒロイン.com'}
          </title>
          <link rel='icon' href='/favicon.ico' />
          <Link href='/app/style.css' rel='stylesheet' />
          <Script src='/app/client.ts' async />
        </head>
        <body className='min-h-screen bg-gradient-to-r bg-gray-900 flex flex-col'>
          <Header />
          <main className='container mx-auto px-4 py-4 flex-1'>{children}</main>
          <Footer />
        </body>
      </html>
    );
  },
);
