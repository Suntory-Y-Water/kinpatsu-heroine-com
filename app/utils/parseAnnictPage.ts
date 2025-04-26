import * as cheerio from 'cheerio';
/**
 * 配信サイト情報を表す型定義
 */
interface StreamingService {
  name: string;
  url: string;
}

/**
 * アニメページの解析結果を表す型定義
 */
interface AnnictPageInfo {
  wikipediaUrl: string | null;
  officialSiteUrl: string | null;
  streamingServices: StreamingService[];
}

/**
 * テキストが配信サイト名を含むかどうかを判定
 * @param {string | null} text - 判定するテキスト
 * @returns {boolean} 配信サイト名を含む場合はtrue
 */
function isStreamingService(text: string | null): boolean {
  if (!text) {
    return false;
  }

  return STREAMING_SERVICE_KEYWORDS.some((keyword) => text.includes(keyword));
}

/**
 * 配信サイト名の判定に使用する特徴的なキーワード
 */
const STREAMING_SERVICE_KEYWORDS = [
  'Netflix',
  'Amazon',
  'dアニメストア',
  'Hulu',
  'ニコニコ',
  'バンダイチャンネル',
  'ABEMA',
  'U-NEXT',
];

/**
 * @description 配信サイト情報、wikipedia、公式サイトの情報を返却する
 * @param {Response} response - ページのレスポンス情報
 * @returns {Promise<AnnictPageInfo>} 解析結果
 */
export async function parseAnnictPage(
  response: Response,
): Promise<AnnictPageInfo> {
  // 結果を格納するオブジェクト
  const result: AnnictPageInfo = {
    wikipediaUrl: null,
    officialSiteUrl: null,
    streamingServices: [],
  };

  // レスポンスのHTMLを取得
  const html = await response.text();

  // cheerioでHTMLを解析
  const $ = cheerio.load(html);

  // Wikipediaリンクを検出
  $('a').each((_, element) => {
    const href = $(element).attr('href');
    const text = $(element).text().trim();

    if (href?.includes('wikipedia.org')) {
      result.wikipediaUrl = href;
    }

    // 公式サイトリンクを検出
    if (text.includes('公式サイト')) {
      result.officialSiteUrl = href || null;
    }
  });

  // 配信サイト情報を検出
  // 配信サイトを含むリスト要素を探す
  let foundStreamingUl = false;
  let streamingUlIndex = -1;

  $('ul').each((index, ul) => {
    const $ul = $(ul);
    let hasStreamingService = false;

    // このulの中にある全てのリンクをチェック
    $ul.find('a').each((_, a) => {
      const text = $(a).text().trim();
      if (isStreamingService(text)) {
        hasStreamingService = true;
        return false;
      }
    });

    if (hasStreamingService) {
      foundStreamingUl = true;
      streamingUlIndex = index;
      return false;
    }
  });

  // 配信サイトを含むul内のリンクを収集
  if (foundStreamingUl && streamingUlIndex >= 0) {
    // インデックスで要素を取得
    const streamingUl = $('ul').eq(streamingUlIndex);

    streamingUl.find('a').each((_, a) => {
      const $a = $(a);
      const text = $a.text().trim();
      const href = $a.attr('href');

      if (isStreamingService(text) && href) {
        result.streamingServices.push({
          name: text,
          url: href,
        });
      }
    });
  }

  return result;
}
