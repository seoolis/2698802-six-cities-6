import { PipelineStage, Types } from 'mongoose';

export type OfferStats = {
  commentsCount: number;
  rating: number;
};

export function buildOfferStatsPipeline(offerId: string): PipelineStage[] {
  const id = new Types.ObjectId(offerId);

  return [
    { $match: { offerId: id } },
    {
      $group: {
        _id: '$offerId',
        commentsCount: { $sum: 1 },
        rating: { $avg: '$rating' },
      },
    },
    {
      $project: {
        _id: 0,
        commentsCount: 1,
        rating: { $round: ['$rating', 1] },
      },
    },
  ];
}

