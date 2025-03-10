import { Container } from 'inversify';
import 'reflect-metadata';
import {
  type AnnictRepository,
  AnnictRepositoryImpl,
} from './repositories/annict-repository';
import {
  type D1Repository,
  D1RepositoryImpl,
} from './repositories/d1repository';
import {
  type R2Repository,
  R2RepositoryImpl,
} from './repositories/r2repository';
import { TYPES } from './types/symbol-types';
import { AnnictUsecase } from './usecases/annict-usecase';
import { D1usecase } from './usecases/d1usecase';
import { R2usecase } from './usecases/r2usecase';

const container = new Container();

// repository
container.bind<R2Repository>(TYPES.R2Repository).to(R2RepositoryImpl);
container.bind<D1Repository>(TYPES.D1Repository).to(D1RepositoryImpl);
container
  .bind<AnnictRepository>(TYPES.AnnictRepository)
  .to(AnnictRepositoryImpl);

// usecase
// TODO: usecaseはinterfaceを作成していないからこのやり方であっているかは調べる必要あり
container.bind<R2usecase>(TYPES.R2Usecase).to(R2usecase);
container.bind<D1usecase>(TYPES.D1Usecase).to(D1usecase);
container.bind<AnnictUsecase>(TYPES.AnnictUsecase).to(AnnictUsecase);

export { container };
