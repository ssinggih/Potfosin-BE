import { LoggerMiddleware } from './logger.middleware';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;

  beforeEach(() => {
    middleware = new LoggerMiddleware();
  });

  it('should call next() and attach finish listener', () => {
    const next = jest.fn();
    let finishCb: () => void;
    const res = {
      on: jest.fn((event: string, cb: () => void) => { finishCb = cb; }),
      statusCode: 200,
    } as any;
    const req = { method: 'GET', originalUrl: '/health', ip: '127.0.0.1', get: jest.fn().mockReturnValue('test-agent') } as any;

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });
});
