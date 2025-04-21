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
   * @description キャラクター名
   */
  characterName: string;

  /**
   * @description キャラクター画像URL
   */
  imageUrl: string;
}

export interface RegistrationCharacter extends Character {
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
