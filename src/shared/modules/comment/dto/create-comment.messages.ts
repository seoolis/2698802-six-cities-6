export const CreateCommentMessages = {
  text: {
    invalidFormat: 'text is required',
    lengthField: 'min length is 5, max is 1024'
  },
  rating: {
    invalidFormat: 'rating must be an integer',
    minValue: 'rating must be at least 1',
    maxValue: 'rating must be at most 5',
  },
} as const;
