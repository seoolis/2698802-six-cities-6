import {inject, injectable} from 'inversify';
import {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {BaseController, HttpError, HttpMethod} from '../../libs/rest/index.js';
import {Logger} from '../../libs/logger/index.js';
import {Component} from '../../types/index.js';
import {CreateUserRequest} from './create-user-request.type.js';
import {UserService} from './user-service.interface.js';
import {Config, RestSchema} from '../../libs/config/index.js';
import {fillDTO} from '../../helpers/index.js';
import {UserRdo} from './rdo/user.rdo.js';
import {LoginUserRequest} from './login-user-request.type.js';
import { createSHA256 } from '../../helpers/hash.js';
import { TokenService } from '../../libs/token/token-service.interface.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly configService: Config<RestSchema>,
    @inject(Component.TokenService) private readonly tokenService: TokenService,
  ) {
    super(logger);
    this.logger.info('Register routes for UserController…');

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create
    });

    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login
    });

    this.addRoute({
      path: '/login',
      method: HttpMethod.Get,
      handler: this.checkAuth
    });
  }

  public async create(
    {body}: CreateUserRequest,
    res: Response,
  ): Promise<void> {
    const existsUser = await this.userService.findByEmail(body.email);

    if (existsUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `User with email «${body.email}» exists.`,
        'UserController'
      );
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));
    this.created(res, fillDTO(UserRdo, result));
  }

  public async login(
    { body }: LoginUserRequest,
    res: Response,
  ): Promise<void> {
    const existsUser = await this.userService.findByEmail(body.email);

    if (! existsUser) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        `User with email ${body.email} not found.`,
        'UserController',
      );
    }

    const passwordHash = createSHA256(body.password, this.configService.get('SALT'));
    if (existsUser.getPassword() !== passwordHash) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Invalid password.',
        'UserController',
      );
    }

    const token = this.tokenService.sign(existsUser.id);
    this.ok(res, { token });
  }

  public async checkAuth(req: Request, res: Response): Promise<void> {
    const raw = req.headers.authorization ?? '';
    const match = raw.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1];

    if (!token) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Authorization required', 'UserController');
    }

    const userId = this.tokenService.getUserId(token);
    if (!userId) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Invalid token', 'UserController');
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'User not found', 'UserController');
    }

    this.ok(res, fillDTO(UserRdo, user));
  }
}
