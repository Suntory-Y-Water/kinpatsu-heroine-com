// TODO: local endpoint

import { createRoute } from 'honox/factory';
import fs from 'fs/promises'; // Node.js 'fs/promises' を Hono の nodejs-compat で利用
import path from 'path';
import { GraphQLClient, gql, ClientError } from 'graphql-request';
import type { Context } from 'hono'; // Context 型をインポート
import type { CharacterInfo } from '@/types/character';
import { createRegistrationCharacter } from '@/lib/db/createRegistrationCharacter';
import { uploadImageFile } from '@/lib/storage/uploadImageFile';

// --- 型定義 (Annict APIレスポンス用) ---
interface DmlData {
  workId: string;
  characterId: string;
  imageUrl: string;
}

interface AnnictWorkResponse {
  searchWorks: {
    nodes: {
      annictId: number;
      title: string;
    }[];
  };
}

interface AnnictCharacterResponse {
  searchCharacters: {
    nodes: {
      annictId: number;
      name: string;
    }[];
  };
}

// --- Helper Functions (Simplified) ---
// (scripts/initDb.ts からコピー、Context(c) を使わないようにそのまま流用)

/** 画像URLから画像を取得 (ArrayBuffer) */
async function fetchImage(
  imageUrl: string,
): Promise<{ arrayBuffer: ArrayBuffer; contentType: string | null }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image: ${response.statusText} from ${imageUrl}`,
    );
  }
  const contentType = response.headers.get('content-type');
  const arrayBuffer = await response.arrayBuffer();
  return { arrayBuffer, contentType };
}

/** 画像をR2にアップロードし、公開URLを返す */
async function uploadImageToR2(
  c: Context, // Context を受け取るように変更
  workId: string,
  characterId: string,
  imageData: { arrayBuffer: ArrayBuffer; contentType: string | null },
): Promise<string> {
  const bucket = c.env.R2_BUCKET; // c.env から取得
  const publicDomain = c.env.R2_ENDPOINT; // c.env から取得

  if (!publicDomain) {
    throw new Error('R2_ENDPOINT environment variable is not set.');
  }
  if (!bucket) {
    throw new Error('R2_BUCKET binding is not available.');
  }

  const extension = imageData.contentType?.split('/')[1] || 'jpg';
  // ファイル名を /images/ ディレクトリ以下に、UUIDとIDを含めて生成
  const fileName = `/images/${workId}-${characterId}-${crypto.randomUUID()}.${extension}`; // 修正箇所

  // uploadImageFile を呼び出す部分は変更なし
  const uploadedObject = await uploadImageFile({
    bucket,
    // Fileオブジェクトは uploadImageFile のために形式的に作成
    file: new File([imageData.arrayBuffer], fileName, {
      type: imageData.contentType ?? 'image/jpeg',
    }),
    fileName: fileName, // R2に保存するキー（パス含む）
    arrayBuffer: imageData.arrayBuffer,
  });

  if (!uploadedObject?.key) {
    throw new Error(
      `Failed to upload image to R2. No key returned for ${fileName}.`,
    );
  }

  // 公開URLの組み立て (キーには /images/ が含まれている)
  const publicUrl = `${publicDomain}${uploadedObject.key}`; // keyは /images/ から始まるパス
  console.log(`Uploaded ${fileName} to R2: ${publicUrl}`);
  return publicUrl;
}

/** Annict APIから作品名を取得 */
async function getWorkName(
  client: GraphQLClient,
  workId: number,
): Promise<string> {
  const query = gql`
    query ($annictIds: [Int!]) {
      searchWorks(annictIds: $annictIds, first: 1) {
        nodes { annictId title }
      }
    }
  `;
  const data = await client.request<AnnictWorkResponse>(query, {
    annictIds: [workId],
  });
  const work = data?.searchWorks?.nodes?.[0];
  if (!work?.title) {
    throw new Error(`Work title not found for ID: ${workId}`);
  }
  return work.title;
}

/** Annict APIからキャラクター名を取得 */
async function getCharacterName(
  client: GraphQLClient,
  characterId: number,
): Promise<string> {
  const query = gql`
    query ($annictIds: [Int!]) {
      searchCharacters(annictIds: $annictIds, first: 1) {
        nodes { annictId name }
      }
    }
  `;
  const data = await client.request<AnnictCharacterResponse>(query, {
    annictIds: [characterId],
  });
  const character = data?.searchCharacters?.nodes?.[0];
  if (!character?.name) {
    throw new Error(`Character name not found for ID: ${characterId}`);
  }
  return character.name;
}

// --- Route Handler ---

export default createRoute(async (c) => {
  console.log('Received request to /local endpoint.'); // リクエスト受信ログ

  // --- 環境変数とBindingsの取得 ---
  const ANNICT_CLIENT_ID = c.env.ANNICT_CLIENT_ID;
  const DB = c.env.DB;
  // R2_BUCKET と R2_ENDPOINT は uploadImageToR2 内で c.env から取得

  // --- 事前チェック ---
  if (!ANNICT_CLIENT_ID) {
    return c.json({ error: 'ANNICT_CLIENT_ID is not configured.' }, 500);
  }
  if (!DB) {
    return c.json({ error: 'DB binding is not available.' }, 500);
  }
  // R2関連のチェックはupload関数内で行う

  // --- Annict GraphQL Client 初期化 ---
  let annictClient: GraphQLClient;
  try {
    annictClient = new GraphQLClient('https://api.annict.com/graphql', {
      // エンドポイントを直接指定
      headers: {
        Authorization: `Bearer ${ANNICT_CLIENT_ID}`,
      },
    });
  } catch (error) {
    console.error('Failed to initialize Annict client:', error);
    return c.json({ error: 'Failed to initialize Annict client.' }, 500);
  }

  // --- data/initializer.json 読み込み ---
  const dmlPath = path.join(process.cwd(), 'data', 'initializer.json');
  let dmlJsonData: DmlData[];
  try {
    // 注意: Honox/HonoのNode.js互換モードが有効である必要あり
    const fileContent = await fs.readFile(dmlPath, 'utf-8');
    dmlJsonData = JSON.parse(fileContent);
    console.log(`Loaded ${dmlJsonData.length} records from ${dmlPath}`);
  } catch (error) {
    console.error(`Failed to read or parse ${dmlPath}:`, error);
    return c.json({ error: `Failed to read or parse ${dmlPath}` }, 500);
  }

  const characterInfos: CharacterInfo[] = [];
  const processingErrors: { item: DmlData; error: string }[] = [];
  const registrationErrors: { character: CharacterInfo; error: string }[] = [];
  let dbSuccessCount = 0;

  // --- データ処理ループ ---
  console.log('Processing records...');
  for (const item of dmlJsonData) {
    try {
      console.log(
        `Processing workId: ${item.workId}, characterId: ${item.characterId}...`,
      );
      const workIdNum = Number.parseInt(item.workId, 10);
      const characterIdNum = Number.parseInt(item.characterId, 10);

      // 画像取得＆R2アップロード
      const imageData = await fetchImage(item.imageUrl);
      // Context(c) を渡すように変更
      const newImageUrl = await uploadImageToR2(
        c,
        item.workId,
        item.characterId,
        imageData,
      );

      // Annictデータ取得
      const workName = await getWorkName(annictClient, workIdNum);
      const characterName = await getCharacterName(
        annictClient,
        characterIdNum,
      );

      // CharacterInfo作成
      characterInfos.push({
        workId: workIdNum,
        characterId: characterIdNum,
        imageUrl: newImageUrl,
        workName: workName,
        characterName: characterName,
      });
      console.log(
        `Successfully processed item: ${characterName} (${workName})`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `Error processing item (workId: ${item.workId}, characterId: ${item.characterId}):`,
        errorMessage,
      );
      processingErrors.push({ item, error: errorMessage });
      if (error instanceof ClientError) {
        console.error(
          'GraphQL Error Details:',
          JSON.stringify(error.response, null, 2),
        );
      }
      // エラーが発生しても次のアイテムへ (ループは継続)
    }
    // APIレート制限避けの待機 (適宜調整)
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log(
    `\nItem Processing finished. Total: ${dmlJsonData.length}, Success: ${characterInfos.length}, Failed: ${processingErrors.length}`,
  );

  // --- D1へ登録 ---
  if (characterInfos.length > 0) {
    console.log(
      `\nRegistering ${characterInfos.length} characters to the database...`,
    );

    for (const charInfo of characterInfos) {
      try {
        const registrationResult = await createRegistrationCharacter({
          DB: DB, // c.env.DB を使用
          character: charInfo,
        });
        if (registrationResult.isOk()) {
          console.log(
            `Registered: ${charInfo.characterName} (ID: ${charInfo.characterId})`,
          );
          dbSuccessCount++;
        } else {
          // createRegistrationCharacter 内のエラーを捕捉
          throw registrationResult.error;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `Failed to register character (ID: ${charInfo.characterId}):`,
          errorMessage,
        );
        registrationErrors.push({ character: charInfo, error: errorMessage });
      }
      // DB負荷軽減の待機 (適宜調整)
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    console.log(
      `\nDatabase registration finished. Success: ${dbSuccessCount}, Failed: ${registrationErrors.length}`,
    );
  } else {
    console.log(
      '\nNo characters processed successfully, skipping database registration.',
    );
  }

  console.log('/local endpoint processing finished.');

  // --- 結果をJSONで返す ---
  return c.json({
    message: 'Initialization process finished.',
    processedItems: characterInfos.length,
    itemProcessingErrors: processingErrors.length,
    databaseRegistrations: dbSuccessCount,
    databaseRegistrationErrors: registrationErrors.length,
    itemErrors: processingErrors, // 詳細なエラー情報 (任意)
    dbErrors: registrationErrors, // 詳細なエラー情報 (任意)
  });
});
