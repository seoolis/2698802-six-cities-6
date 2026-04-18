import { Container } from 'inversify';
import { types } from '@typegoose/typegoose';
import { Component } from '../../types/index.js';
import { FavoriteEntity, FavoriteModel } from './favorite.entity.js';
import { FavoriteService } from './favorite-service.interface.js';
import { DefaultFavoriteService } from './default-favorite.service.js';
import { Controller } from '../../libs/rest/index.js';
import { FavoriteController } from './favorite.controller.js';

export function createFavoriteContainer() {
  const container = new Container();

  container
    .bind<FavoriteService>(Component.FavoriteService)
    .to(DefaultFavoriteService)
    .inSingletonScope();

  container
    .bind<types.ModelType<FavoriteEntity>>(Component.FavoriteModel)
    .toConstantValue(FavoriteModel);

  container
    .bind<Controller>(Component.FavoriteController)
    .to(FavoriteController)
    .inSingletonScope();

  return container;
}

