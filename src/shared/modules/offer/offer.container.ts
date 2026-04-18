import { Container } from 'inversify';
import { types } from '@typegoose/typegoose';
import { OfferService } from './offer-service.interface.js';
import { DefaultOfferService } from './default-offer.service.js';
import { OfferEntity, OfferModel } from './offer.entity.js';
import { Component } from '../../types/index.js';
import { Controller } from '../../libs/rest/index.js';
import { OfferController } from './offer.controller.js';

export function createOfferContainer() {
  const container = new Container();

  container
    .bind<OfferService>(Component.OfferService)
    .to(DefaultOfferService)
    .inSingletonScope();

  container
    .bind<types.ModelType<OfferEntity>>(Component.OfferModel)
    .toConstantValue(OfferModel);

  container
    .bind<Controller>(Component.OfferController)
    .to(OfferController)
    .inSingletonScope();

  return container;
}
