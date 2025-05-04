import { createRoute } from 'honox/factory';
import { sign } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Context } from 'hono';

import { setCookie } from 'hono/cookie';

import { compare } from 'bcrypt-ts';
import { StatusMessage } from '@/components/character/StatusMessage';
import { absoluteUrl } from '@/lib/utils';
import {
  getLoginAttempt,
  resetLoginAttempt,
  updateLoginAttempt,
} from '@/lib/db';
import { getConnInfo } from 'hono/cloudflare-workers';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'ユーザー名は必須です' }),
  password: z.string().min(1, { message: 'パスワードは必須です' }),
});

// 指数的なロックアウト時間を計算
function calculateLockoutTime(attempts: number): number | null {
  if (attempts <= 5) {
    return null;
  }

  // 6回目以降は指数的に増加（秒数）
  const baseSeconds = 60; // 初期ロック時間
  const exponent = attempts - 6; // 6回目をベースとして0から開始

  return baseSeconds * Math.pow(2, exponent);
}

// IPアドレス取得関数
function getIpAddress(c: Context): string {
  // ConnInfoを使用してリモートアドレスを取得
  const connInfo = getConnInfo(c);
  if (connInfo.remote.address) {
    return connInfo.remote.address;
  }
  // IPを取得できない場合はローカル環境の識別子を返す
  return 'localhost-dev';
}

// ログイン処理
export const POST = createRoute(zValidator('form', loginSchema), async (c) => {
  const { logger } = c.var;
  const ipAddress = getIpAddress(c);
  const DB = c.env.DB;

  try {
    const { username, password } = await c.req.valid('form');

    // ログイン試行履歴の確認
    const attemptResult = await getLoginAttempt({ DB, ipAddress, username });

    if (attemptResult.isErr()) {
      logger.error({
        message: 'ログイン試行履歴の取得に失敗しました',
        error: attemptResult.error,
      });
      return c.redirect('/admin/login?error=system');
    }

    const attempt = attemptResult.value;
    const now = new Date();

    // ロックアウト状態確認
    if (attempt?.lockout_until) {
      const lockoutUntil = new Date(attempt.lockout_until);
      if (now < lockoutUntil) {
        const remainingSeconds = Math.ceil(
          (lockoutUntil.getTime() - now.getTime()) / 1000,
        );
        const message = encodeURIComponent(
          `不正ログインの検出により一時的にロックされています。${remainingSeconds}秒後に再試行してください。`,
        );
        return c.redirect(`/admin/login?status=error&message=${message}`);
      }
    }

    // 認証
    const ADMIN_USERNAME = c.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD_HASH = c.env.ADMIN_PASSWORD_HASH;

    if (
      username !== ADMIN_USERNAME ||
      !(await compare(password, ADMIN_PASSWORD_HASH))
    ) {
      // ログイン失敗時の処理
      const failedAttempts = (attempt?.failed_attempts || 0) + 1;

      // ロックアウト条件確認
      let lockoutUntil: string | null = null;
      const lockoutSeconds = calculateLockoutTime(failedAttempts);

      if (lockoutSeconds) {
        const lockoutTime = new Date(now.getTime() + lockoutSeconds * 1000);
        lockoutUntil = lockoutTime.toISOString();
      }

      // 試行回数更新
      const updateResult = await updateLoginAttempt({
        DB,
        ipAddress,
        username,
        failedAttempts,
        lockoutUntil,
      });

      if (updateResult.isErr()) {
        logger.error({
          message: 'ログイン試行履歴の更新に失敗しました',
          error: updateResult.error,
        });
      }

      // エラーメッセージ
      let message = encodeURIComponent(
        'ユーザー名、またはパスワードが間違っています。',
      );
      if (lockoutSeconds) {
        const timeString =
          lockoutSeconds < 60
            ? `${lockoutSeconds}秒`
            : `${lockoutSeconds / 60}分`;
        message = encodeURIComponent(
          `${failedAttempts}回連続で失敗しました。${timeString}後に再試行してください。`,
        );
      }

      return c.redirect(`/admin/login?status=error&message=${message}`);
    }

    // 認証成功：試行回数リセット
    const resetResult = await resetLoginAttempt({ DB, ipAddress, username });
    if (resetResult.isErr()) {
      logger.error({
        message: 'ログイン試行履歴のリセットに失敗しました',
        error: resetResult.error,
      });
    }

    // JWTトークン生成して管理画面へリダイレクト
    return await createAndSetToken(c, username);
  } catch (error) {
    logger.error({
      message: 'ログインに失敗しました',
      error,
    });
    return c.redirect('/admin/login?error=system');
  }
});

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
  // クエリパラメータからステータスとメッセージを取得
  const status = c.req.query('status') as
    | 'error'
    | 'success'
    | 'info'
    | 'warning'
    | undefined;
  const message = c.req.query('message');

  return c.render(
    <div className='max-w-md mx-auto my-10 bg-gray-800 p-6 rounded-lg shadow-lg'>
      <h1 className='text-2xl font-bold text-center mb-6 text-yellow-300'>
        管理者ログイン
      </h1>
      <form method='post' action='/admin/login'>
        <StatusMessage status={status} message={message} />

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
    {
      title: '管理者ログイン',
      description: '管理者ログイン画面',
      openGraph: {
        title: '管理者ログイン',
        description: '管理者ログイン画面',
        url: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/admin/login' }),
        images: absoluteUrl({
          url: c.env.PUBLIC_APP_URL,
          path: '/ogp.png',
        }),
      },
      twitter: {
        title: '管理者ログイン',
        description: '管理者ログイン画面',
        url: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/admin/login' }),
        images: absoluteUrl({ url: c.env.PUBLIC_APP_URL, path: '/ogp.png' }),
      },
    },
  );
});
