export class LoginInfoAdministratorDto {
  constructor(
    public administartorId: number,
    public username: string,
    public token: string,
  ) {}
}
