/**
 * @description キャラクター情報
 */
export interface Character {
  /**
   * @description 作品ID
   */
  workId: number;
  /**
   * @description キャラクターID
   */
  characterId: number;

  /**
   * @description キャラクター画像URL
   */
  imageUrl: string;
}
