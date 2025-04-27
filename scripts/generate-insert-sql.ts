import fs from 'fs';
import path from 'path';

/**
 * ワークテーブルのデータ型
 */
interface WorkData {
  work_id: number;
  work_name: string;
  official_site_url: string;
  wikipedia_url: string;
}

/**
 * ストリーミングサイトテーブルのデータ型
 */
interface StreamingSiteData {
  streaming_site_id: string;
  streaming_site_name: string;
  streaming_site_url: string;
}

/**
 * ワークストリーミングサイトテーブルのデータ型
 */
interface WorkStreamingSiteData {
  work_id: number;
  streaming_site_id: string;
  streaming_site_url: string;
}

/**
 * キャラクターテーブルのデータ型
 */
interface CharacterData {
  character_id: number;
  character_name: string;
  character_image_url: string;
  registration_date: string;
  work_id: number;
}

/**
 * 登録キューテーブルのデータ型
 */
interface RegistrationQueueData {
  character_id: number;
  work_id: number;
  character_name: string;
  work_name: string;
  character_image_url: string;
  registration_date: string;
  is_registered: number;
  is_deleted: number;
}

/**
 * エスケープ処理用関数
 */
function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * ワークテーブル用のINSERT文を生成
 */
function generateWorkTableInserts(jsonFilePath: string): string {
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
  const works = jsonData[0].results as WorkData[];

  let sql = '-- work_tableの初期データ\n';

  const chunkSize = 20;
  for (let i = 0; i < works.length; i += chunkSize) {
    const chunk = works.slice(i, i + chunkSize);

    sql +=
      'INSERT INTO work_table (work_id, work_name, official_site_url, wikipedia_url) VALUES\n';

    const values = chunk
      .map((work) => {
        return `(${work.work_id}, '${escapeSql(work.work_name)}', '${escapeSql(work.official_site_url)}', '${escapeSql(work.wikipedia_url)}')`;
      })
      .join(',\n');

    sql += values + ';\n\n';
  }

  return sql;
}

/**
 * ストリーミングサイトテーブル用のINSERT文を生成
 */
function generateStreamingSiteTableInserts(jsonFilePath: string): string {
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
  const sites = jsonData[0].results as StreamingSiteData[];

  let sql = '-- streaming_site_tableの初期データ\n';
  sql +=
    'INSERT INTO streaming_site_table (streaming_site_id, streaming_site_name, streaming_site_url) VALUES\n';

  const values = sites
    .map((site) => {
      return `('${escapeSql(site.streaming_site_id)}', '${escapeSql(site.streaming_site_name)}', '${escapeSql(site.streaming_site_url)}')`;
    })
    .join(',\n');

  sql += values + ';\n\n';

  return sql;
}

/**
 * ワークストリーミングサイトテーブル用のINSERT文を生成
 */
function generateWorkStreamingSiteTableInserts(jsonFilePath: string): string {
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
  const relations = jsonData[0].results as WorkStreamingSiteData[];

  let sql = '-- work_streaming_site_tableの初期データ\n';

  const chunkSize = 50;
  for (let i = 0; i < relations.length; i += chunkSize) {
    const chunk = relations.slice(i, i + chunkSize);

    sql +=
      'INSERT INTO work_streaming_site_table (work_id, streaming_site_id, streaming_site_url) VALUES\n';

    const values = chunk
      .map((relation) => {
        return `(${relation.work_id}, '${escapeSql(relation.streaming_site_id)}', '${escapeSql(relation.streaming_site_url)}')`;
      })
      .join(',\n');

    sql += values + ';\n\n';
  }

  return sql;
}

/**
 * キャラクターテーブル用のINSERT文を生成
 */
function generateCharacterTableInserts(jsonFilePath: string): string {
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
  const characters = jsonData[0].results as CharacterData[];

  let sql = '-- character_tableの初期データ\n';

  const chunkSize = 20;
  for (let i = 0; i < characters.length; i += chunkSize) {
    const chunk = characters.slice(i, i + chunkSize);

    sql +=
      'INSERT INTO character_table (character_id, character_name, character_image_url, registration_date, work_id) VALUES\n';

    const values = chunk
      .map((character) => {
        return `(${character.character_id}, '${escapeSql(character.character_name)}', '${escapeSql(character.character_image_url)}', '${character.registration_date}', ${character.work_id})`;
      })
      .join(',\n');

    sql += values + ';\n\n';
  }

  return sql;
}

/**
 * 登録キューテーブル用のINSERT文を生成
 */
function generateRegistrationQueueTableInserts(jsonFilePath: string): string {
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
  const queue = jsonData[0].results as RegistrationQueueData[];

  let sql = '-- registration_queue_tableの初期データ\n';

  const chunkSize = 20;
  for (let i = 0; i < queue.length; i += chunkSize) {
    const chunk = queue.slice(i, i + chunkSize);

    sql +=
      'INSERT INTO registration_queue_table (character_id, work_id, character_name, work_name, character_image_url, registration_date, is_registered, is_deleted) VALUES\n';

    const values = chunk
      .map((item) => {
        return `(${item.character_id}, ${item.work_id}, '${escapeSql(item.character_name)}', '${escapeSql(item.work_name)}', '${escapeSql(item.character_image_url)}', '${item.registration_date}', ${item.is_registered}, ${item.is_deleted})`;
      })
      .join(',\n');

    sql += values + ';\n\n';
  }

  return sql;
}

/**
 * 全テーブル用のINSERT文を生成して出力
 */
function generateAllTableInserts() {
  const workTablePath = path.resolve(process.cwd(), 'work_table.json');
  const streamingSiteTablePath = path.resolve(
    process.cwd(),
    'streaming_site_table.json',
  );
  const workStreamingSiteTablePath = path.resolve(
    process.cwd(),
    'work_streaming_site_table.json',
  );
  const characterTablePath = path.resolve(
    process.cwd(),
    'character_table.json',
  );
  const registrationQueueTablePath = path.resolve(
    process.cwd(),
    'registration_queue_table.json',
  );

  const outputDir = path.resolve(process.cwd(), 'data');

  // 出力ディレクトリが存在しない場合は作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // ワークテーブル
  console.log('work_tableのINSERT文を生成中...');
  const workSql = generateWorkTableInserts(workTablePath);
  fs.writeFileSync(
    path.join(outputDir, 'work_table_inserts.sql'),
    workSql,
    'utf-8',
  );

  // ストリーミングサイトテーブル
  console.log('streaming_site_tableのINSERT文を生成中...');
  const siteSql = generateStreamingSiteTableInserts(streamingSiteTablePath);
  fs.writeFileSync(
    path.join(outputDir, 'streaming_site_table_inserts.sql'),
    siteSql,
    'utf-8',
  );

  // ワークストリーミングサイトテーブル
  console.log('work_streaming_site_tableのINSERT文を生成中...');
  const workSiteSql = generateWorkStreamingSiteTableInserts(
    workStreamingSiteTablePath,
  );
  fs.writeFileSync(
    path.join(outputDir, 'work_streaming_site_table_inserts.sql'),
    workSiteSql,
    'utf-8',
  );

  // キャラクターテーブル
  console.log('character_tableのINSERT文を生成中...');
  const characterSql = generateCharacterTableInserts(characterTablePath);
  fs.writeFileSync(
    path.join(outputDir, 'character_table_inserts.sql'),
    characterSql,
    'utf-8',
  );

  // 登録キューテーブル
  console.log('registration_queue_tableのINSERT文を生成中...');
  const queueSql = generateRegistrationQueueTableInserts(
    registrationQueueTablePath,
  );
  fs.writeFileSync(
    path.join(outputDir, 'registration_queue_table_inserts.sql'),
    queueSql,
    'utf-8',
  );

  // 全てのSQLを結合したファイルも生成
  console.log('全てのINSERT文を結合中...');
  const allSql = [workSql, siteSql, workSiteSql, characterSql, queueSql].join(
    '\n',
  );
  fs.writeFileSync(path.join(outputDir, 'all_inserts.sql'), allSql, 'utf-8');

  console.log('全てのSQLファイルが data/ ディレクトリに生成されました。');
}

/**
 * メイン処理
 */
function main() {
  console.log('JSONファイルからSQLを生成します...');
  generateAllTableInserts();
}

main();

export {
  generateWorkTableInserts,
  generateStreamingSiteTableInserts,
  generateWorkStreamingSiteTableInserts,
  generateCharacterTableInserts,
  generateRegistrationQueueTableInserts,
  generateAllTableInserts,
};
