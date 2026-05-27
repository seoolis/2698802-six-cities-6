export const CreateUpdateOfferMessage = {
  title: {
    minLength: 'minimum title length is 10',
    maxLength: 'maximum title length is 100'
  },
  description: {
    minLength: 'minimum description length is 20',
    maxLength: 'maximum description length is 1024',
  },
  publishedDate: {
    invalidFormat: 'postData must be a valid ISO date',
  },
  image: {
    invalidFormat: 'image is required',
    maxLength: 'too long for field image. Maximum length is 256'
  },
  price: {
    invalidFormat: 'price must be an integer',
    min: 'minimum price is 100',
    max: 'maximum price is 100000'
  }
} as const;
