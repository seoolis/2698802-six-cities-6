import { UserType } from './enums/user.type.enum';

export type User = {
  name: string;
  email: string;
  avatar?: string;
  type: UserType;
}
