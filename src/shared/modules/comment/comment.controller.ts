import { BaseController, HttpError, HttpMethod, ValidateDtoMiddleware } from '../../libs/rest/index.js';

this.addRoute({
  path: '/',
  method: HttpMethod.Post,
  handler: this.create,
  middlewares: [
    new ValidateDtoMiddleware(CreateCommentDto)
  ]
});
