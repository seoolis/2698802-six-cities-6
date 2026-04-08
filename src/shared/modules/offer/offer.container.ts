import { Container } from 'inversify';
import { types } from '@typegoose/typegoose';
import { OfferService } from './offer-service.interface.js';
import { DefaultOfferService } from './default-offer.service.js';
import { OfferEntity, OfferModel } from './offer.entity.js';
import { Component } from '../../types/index.js';

export function createOfferContainer() {
  const container = new Container();

  container
    .bind<OfferService>(Component.OfferService)
    .to(DefaultOfferService)
    .inSingletonScope();

  container
    .bind<types.ModelType<OfferEntity>>(Component.OfferModel)
    .toConstantValue(OfferModel);

  return container;
}
