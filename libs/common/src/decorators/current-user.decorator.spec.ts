import { createParamDecorator } from '@nestjs/common';

describe('CurrentUser Decorator', () => {
  const factory = (data: string | undefined, ctx: any) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  };

  it('should return full user when no data key', () => {
    const user = { sub: '1', email: 'test@test.com', role: 'admin' };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    };

    const result = factory(undefined, ctx);
    expect(result).toEqual(user);
  });

  it('should return specific field when data key provided', () => {
    const user = { sub: '1', email: 'test@test.com', role: 'admin' };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    };

    const result = factory('email', ctx);
    expect(result).toBe('test@test.com');
  });

  it('should return undefined when no user', () => {
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: undefined }),
      }),
    };

    const result = factory(undefined, ctx);
    expect(result).toBeUndefined();
  });
});
