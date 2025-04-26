export interface AnnictWorks {
  readonly data: Data;
}

interface Data {
  readonly searchWorks: SearchWorks;
}

interface SearchWorks {
  readonly nodes: Node[];
}

interface Node {
  readonly annictId: number;
  readonly title: string;
}

export interface AnnictWorkCharacters {
  readonly data: WorkCharactersData;
}

interface WorkCharactersData {
  readonly searchWorks: SearchWorksCharacter;
}

interface SearchWorksCharacter {
  readonly edges: SearchWorksEdge[];
}

interface SearchWorksEdge {
  readonly node: PurpleNode;
}

interface PurpleNode {
  readonly casts: Casts;
}

interface Casts {
  readonly edges: CastsEdge[];
}

interface CastsEdge {
  readonly node: FluffyNode;
}

interface FluffyNode {
  readonly character: Character;
}

interface Character {
  readonly annictId: number;
  readonly name: string;
}

/**
 * 配信サイト情報を表す型定義
 */
interface StreamingService {
  name: string | null;
  url: string | null;
}

/**
 * アニメページの解析結果を表す型定義
 */
export interface AnnictPageInfo {
  wikipediaUrl: string | null;
  officialSiteUrl: string | null;
  streamingServices: StreamingService[];
}

// ----DTO----

export interface AnnictWorksDTO {
  annictInfo: {
    annictId: number;
    title: string;
  }[];
}
