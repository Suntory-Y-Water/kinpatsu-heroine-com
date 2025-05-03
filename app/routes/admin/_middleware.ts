import { jwt, verify } from 'hono/jwt';
import { deleteCookie, getCookie } from 'hono/cookie';
import { createRoute } from 'honox/factory';

import { Context } from 'hono';

/**
 * JWT認証の検証を行う関数
 * @param c コンテキスト
 * @returns JWTが有効かどうか
 */
async function isValidToken(c: Context): Promise<boolean> {
  const token = getCookie(c, 'admin_token');
  if (!token) {
    return false;
  }

  try {
    await verify(token, c.env.JWT_SECRET);
    return true;
  } catch (_error) {
    return false;
  }
}

export default createRoute(async (c, next) => {
  // ログイン画面へのアクセス時に既にログイン済みなら管理画面へリダイレクト
  if (c.req.path === '/admin/login') {
    const isLoggedIn = await isValidToken(c);
    if (isLoggedIn) {
      return c.redirect('/admin');
    }
    return next();
  }

  // JWT認証ミドルウェアを作成
  // クッキーからトークンを取得
  const jwtAuth = jwt({
    secret: c.env.JWT_SECRET,
    cookie: 'admin_token',
  });

  try {
    // JWT認証ミドルウェアを実行
    await jwtAuth(c, next);
  } catch (_error) {
    // JWT認証に失敗した場合の処理
    deleteCookie(c, 'admin_token');
    return c.redirect('/admin/login');
  }
});
