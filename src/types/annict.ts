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
  readonly name: string;
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

// ----DTO----

export interface AnnictWorksDTO {
  annictInfo: {
    annictId: number;
    name: string;
  }[];
}
