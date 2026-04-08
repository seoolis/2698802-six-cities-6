import { defaultClasses, getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { UserEntity } from '../user/user.entity.js';
import { HouseType } from '../../types/enums/house.type.enum.js';
import { AmenitiesType } from '../../types/enums/amenities.type.enum.js';

export interface OfferEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'offers',
    timestamps: true,
  },
})
export class OfferEntity extends defaultClasses.TimeStamps {
  @prop({ required: true, minlength: 10, maxlength: 100 })
  public title!: string;

  @prop({ required: true, minlength: 20, maxlength: 1024 })
  public description!: string;

  @prop({ required: true })
  public publishedDate!: Date;

  @prop({ required: true, enum: ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'] })
  public city!: string;

  @prop({ required: true })
  public previewImage!: string;

  @prop({ required: true, type: () => [String], maxlength: 255 })
  public photos!: string[];

  @prop({ required: true, default: false })
  public isPremium!: boolean;

  @prop({ required: true, default: false })
  public isFavorite!: boolean;

  @prop({ required: true, min: 1, max: 5 })
  public rating!: number;

  @prop({ required: true, enum: HouseType })
  public type!: HouseType;

  @prop({ required: true, min: 1, max: 8 })
  public rooms!: number;

  @prop({ required: true, min: 1, max: 10 })
  public guests!: number;

  @prop({ required: true, min: 100, max: 100000 })
  public price!: number;

  @prop({ required: true, type: () => [String], enum: AmenitiesType })
  public amenities!: AmenitiesType[];

  @prop({ ref: UserEntity, required: true })
  public author!: Ref<UserEntity>;

  @prop({ default: 0 })
  public commentsCount!: number;

  @prop({ required: true, _id: false })
  public coordinates!: {
    latitude: number;
    longitude: number;
  };
}

export const OfferModel = getModelForClass(OfferEntity);
