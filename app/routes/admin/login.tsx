import { createRoute } from 'honox/factory';
import { sign } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Context } from 'hono';

import { setCookie } from 'hono/cookie';
import { customLogger } from '../_middleware';

import { compare } from 'bcrypt-ts';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'ユーザー名は必須です' }),
  password: z.string().min(1, { message: 'パスワードは必須です' }),
});

// ログイン処理
export const POST = createRoute(zValidator('form', loginSchema), async (c) => {
  try {
    const { username, password } = await c.req.valid('form');

    // 環境変数から管理者認証情報を取得
    const ADMIN_USERNAME = c.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD_HASH = c.env.ADMIN_PASSWORD_HASH;

    // ユーザー名とパスワードの検証
    if (username !== ADMIN_USERNAME) {
      return c.redirect('/admin/login?error=invalid');
    }

    const passwordMatches = await verifyPassword(password, ADMIN_PASSWORD_HASH);
    if (!passwordMatches) {
      return c.redirect('/admin/login?error=invalid');
    }

    // 認証成功：JWTトークンを生成して管理画面へリダイレクト
    return await createAndSetToken(c, username);
  } catch (error) {
    const message = error instanceof Error ? error.message : '不明なエラー';
    customLogger('認証に失敗しました');
    customLogger(message);
    return c.redirect('/admin/login?error=system');
  }
});

/**
 * パスワード検証関数
 * @param password 入力されたパスワード
 * @param hashedPassword ハッシュ化されたパスワード(bcryptハッシュ)
 * @returns 検証結果(true/false)
 */
async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    return await compare(password, hashedPassword);
  } catch (error) {
    customLogger(`パスワード検証エラー ${error}`);
    return false;
  }
}
// ログイン成功時のJWT生成と設定
async function createAndSetToken(c: Context, username: string) {
  // JWTトークン生成（30分有効）
  const token = await sign(
    {
      role: 'admin',
      username: username,
      exp: Math.floor(Date.now() / 1000) + 60 * 30, // 30分有効
    },
    c.env.JWT_SECRET,
  );

  // クッキーにトークンを設定
  setCookie(c, 'admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 60 * 30, // 30分
    path: '/',
  });

  return c.redirect('/admin');
}

// ログインフォーム画面表示
export default createRoute((c) => {
  // エラーメッセージが存在する場合に表示
  const error = c.req.query('error');
  const errorMessage = error ? 'ログインに失敗しました。' : '';

  return c.render(
    <div className='max-w-md mx-auto my-10 bg-gray-800 p-6 rounded-lg shadow-lg'>
      <h1 className='text-2xl font-bold text-center mb-6 text-yellow-300'>
        管理者ログイン
      </h1>
      <form method='post' action='/admin/login'>
        {error && (
          <div className='mb-4 p-3 bg-red-900/30 border border-red-500 text-red-300 rounded'>
            {errorMessage}
          </div>
        )}

        <div className='mb-4'>
          <label htmlFor='username' className='block text-white mb-2'>
            ユーザー名
          </label>
          <input
            type='text'
            id='username'
            name='username'
            className='w-full bg-gray-700 border border-gray-600 rounded py-2 px-3 text-white'
            required
          />
        </div>

        <div className='mb-6'>
          <label htmlFor='password' className='block text-white mb-2'>
            パスワード
          </label>
          <input
            type='password'
            id='password'
            name='password'
            className='w-full bg-gray-700 border border-gray-600 rounded py-2 px-3 text-white'
            required
          />
        </div>

        <button
          type='submit'
          className='w-full bg-yellow-300 text-gray-900 py-2 px-4 rounded font-bold hover:bg-yellow-400 transition-colors'
        >
          ログイン
        </button>
      </form>
    </div>,
  );
});
