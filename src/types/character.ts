/**
 * @description キャラクター情報
 */
export interface Character {
  /**
   * @description キャラクターID
   */
  characterId: number;

  /**
   * @description キャラクター名
   */
  characterName: string;

  /**
   * @description キャラクター画像URL
   */
  imageUrl: string;
}

export interface Work {
  /**
   * @description 作品ID
   */
  workId: number;

  /**
   * @description 作品名
   */
  workName: string;
}

export interface RegistrationCharacter extends Character, Work {
  /**
   * @description 登録日
   */
  registrationDate: string;

  /**
   * @description 登録済みかどうか
   */
  isRegistered: boolean;

  /**
   * @description 削除済みかどうか
   */
  isDeleted: boolean;
}

export interface CharacterInfo extends Character, Work {}

export interface WorkInfo extends Work {
  /**
   * @description 公式サイトURL
   */
  officialSiteUrl: string;

  /**
   * @description Wikipedia URL
   */
  wikipediaUrl: string;
}

export interface WorkStreamingSiteInfo {
  /**
   * @description 作品ID
   */
  workId: number;

  /**
   * @description 配信サイトID
   */
  streamingSiteId: string;

  /**
   * @description 配信サイトURL
   */
  streamingSiteUrl: string;
}

// 画面に表示するキャラクター一覧の型
export interface CharacterList extends Character {
  /**
   * @description 作品名
   */
  workName: string;

  /**
   * @description いいね数
   */
  likes: number;
}
