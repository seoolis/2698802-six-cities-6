export class CreateUserDto {
  public name!: string;
  public email!: string;
  public avatarPath?: string;
  public type!: string;
  public password!: string;
}
