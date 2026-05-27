import { HouseType } from './enums/house.type.enum.js';
import { AmenitiesType } from './enums/amenities.type.enum.js';
import { User } from './user.type.js';
import { City } from './city.type.js';
import { CoordinatesType } from './coordinates.type.js';

export type OfferType = {
  title: string;
  description: string;
  publishedDate: Date;
  city: City;
  previewImage: string;
  photos: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: HouseType;
  rooms: number;
  guests: number;
  price: number;
  amenities: AmenitiesType[];
  author: User;
  commentsCount: number;
  coordinates: CoordinatesType;
};
