import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);

// ESモジュールでの __dirname の代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// マイグレーションディレクトリのパス
const MIGRATIONS_DIR = path.resolve(__dirname, '../drizzle/migrations');

// メタデータファイルを除外したSQLファイルのみを取得
function getMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql') && !file.includes('meta'))
    .sort();
}

// 環境タイプ定義
type Environment = 'local' | 'preview' | 'production';
type MigrationMode = 'latest' | 'all' | 'specific';

interface MigrationOptions {
  environment: Environment;
  mode: MigrationMode;
  specificFile?: string;
  isRemote?: boolean;
}

/**
 * SQL文字列から"IF NOT EXISTS"を追加したCREATE TABLE文を生成
 * @param sqlContent 元のSQL内容
 * @returns 修正されたSQL内容
 */
function addIfNotExists(sqlContent: string): string {
  // CREATE TABLE文に"IF NOT EXISTS"を追加
  return sqlContent.replace(
    /CREATE\s+TABLE\s+([`"]?\w+[`"]?)/gi,
    'CREATE TABLE IF NOT EXISTS $1',
  );
}

/**
 * 指定された環境にマイグレーションを適用します
 */
async function migrate({
  environment,
  mode,
  specificFile,
  isRemote = false,
}: MigrationOptions) {
  // 環境ごとのデータベースバインディング
  const dbBinding = environment === 'preview' ? 'DB_PREVIEW' : 'DB';
  const localFlag =
    environment === 'local' || !isRemote ? '--local' : '--remote';

  try {
    let filesToApply: string[] = [];

    if (mode === 'specific' && specificFile) {
      // 特定のファイルのみ適用
      filesToApply = [specificFile];
    } else if (mode === 'latest') {
      // 最新のマイグレーションファイルのみ適用
      const files = getMigrationFiles();
      if (files.length === 0) {
        console.error('マイグレーションファイルが見つかりません。');
        process.exit(1);
      }
      filesToApply = [files[files.length - 1]];
    } else if (mode === 'all') {
      // すべてのマイグレーションファイルを適用
      filesToApply = getMigrationFiles();
    }

    if (filesToApply.length === 0) {
      console.error('適用するマイグレーションファイルが見つかりません。');
      process.exit(1);
    }

    // 各マイグレーションファイルを順番に適用
    for (const file of filesToApply) {
      const filePath = path.join(MIGRATIONS_DIR, file);

      // ファイルの存在確認
      if (!fs.existsSync(filePath)) {
        console.error(
          `マイグレーションファイル ${filePath} が見つかりません。`,
        );
        continue; // 次のファイルを試す
      }

      // SQLファイル内容の読み取りと修正
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      const modifiedSql = addIfNotExists(sqlContent);

      // 一時的な修正ファイルを作成
      const tempFilePath = `${filePath}.temp`;
      fs.writeFileSync(tempFilePath, modifiedSql);

      console.log(
        `${environment} 環境${isRemote ? '(リモート)' : '(ローカル)'}に ${file} を適用します...`,
      );

      // マイグレーションの実行
      try {
        const command = `wrangler d1 execute ${dbBinding} ${localFlag} --file=${tempFilePath}`;
        const { stderr } = await execAsync(command);

        if (stderr && !stderr.includes('NOTICE:')) {
          console.error(`警告 (処理は続行): ${stderr}`);
        }

        console.log(`マイグレーション成功: ${file}`);
      } catch (error) {
        // テーブルが既に存在するなどのエラーでも続行
        console.error(`エラー (処理は続行): ${error}`);
      } finally {
        // 一時ファイルの削除
        fs.unlinkSync(tempFilePath);
      }
    }

    console.log('すべてのマイグレーションが完了しました');
  } catch (error) {
    console.error('マイグレーション中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// ESモジュールでのメインモジュール判定
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const args = process.argv.slice(2);
  const environment = (args[0] || 'local') as Environment;
  const mode = (args[1] || 'latest') as MigrationMode;
  const isRemote = args.includes('--remote');
  const specificFile =
    args[2] && !args[2].startsWith('--') ? args[2] : undefined;

  // 'specific'モードで特定のファイルが指定されていない場合はエラー
  if (mode === 'specific' && !specificFile) {
    console.error('specificモードでは、適用するファイル名を指定してください。');
    process.exit(1);
  }

  migrate({ environment, mode, specificFile, isRemote })
    .then(() => console.log('完了'))
    .catch((err) => {
      console.error('エラー:', err);
      process.exit(1);
    });
}

export { migrate };
