import { CityLocation } from './const';
import { CommentRdo } from './dto/comment/comment-rdo';
import { OfferPreviewRdo } from './dto/offer/offer-preview-rdo';
import { OfferRdo } from './dto/offer/offer-rdo';
import { UserRdo } from './dto/user/user-rdo';
import { Comment, Offer, OfferPreview, User } from './types/types';

export const adaptOfferPreviewToClient = (offer: OfferPreviewRdo): OfferPreview => ({
  id: offer.id,
  title: offer.title,
  previewImage: offer.previewImage,
  isPremium: offer.isPremium,
  isFavorite: offer.isFavorite,
  type: offer.housingType,
  price: offer.price,
  rating: offer.rating,
  cityName: offer.city
});

export const adaptOfferToClient = (offer: OfferRdo): Offer => ({
  id: offer.id,
  title: offer.title,
  description: offer.description,
  city: {
    name: offer.city,
    location: CityLocation[offer.city]
  },
  previewImage: offer.previewImage,
  images: offer.housingImages,
  isFavorite: offer.isFavorite,
  isPremium: offer.isPremium,
  type: offer.housingType,
  price: offer.price,
  goods: offer.amenities,
  bedrooms: offer.roomsCount,
  maxAdults: offer.guestsCount,
  location: offer.coordinates,
  rating: offer.rating,
  host: adaptUserToClient(offer.author)
});

export const adaptCommentToClient = (comment: CommentRdo): Comment => ({
  id: comment.id,
  comment: comment.text,
  date: comment.publishDate.toString(),
  rating: comment.rating,
  user: adaptUserToClient(comment.author)
});

export const adaptUserToClient = (user: UserRdo): User => ({
  name: user.name,
  email: user.email,
  avatarUrl: user.avatar,
  type: user.type
});
