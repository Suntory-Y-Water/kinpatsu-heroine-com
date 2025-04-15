import { jsxRenderer } from 'hono/jsx-renderer';
import { Link, Script } from 'honox/server';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default jsxRenderer(({ children }) => {
  return (
    <html lang='ja'>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>
          金髪ヒロイン.com - 金髪ヒロイン特化型キャラクターデータベース
        </title>
        <meta
          name='description'
          content='アニメの金髪ヒロインに特化した情報サイトです。お気に入りのキャラクターを見つけて、新しい作品との出会いを楽しみましょう。'
        />
        <link rel='icon' href='/favicon.ico' />
        <Link href='/app/style.css' rel='stylesheet' />
        <Script src='/app/client.ts' async />
      </head>
      <body className='min-h-screen bg-gradient-to-r from-[#1A1F2C] to-[#221F26] flex flex-col'>
        <Header />
        <main className='container mx-auto px-4 py-8 flex-1'>{children}</main>
        <Footer />
      </body>
    </html>
  );
});
