import { CorrelationIdMiddleware } from './correlation-id.middleware';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
  });

  it('should generate a correlation ID if header is missing', () => {
    const req = { headers: {}, correlationId: undefined } as any;
    const res = { setHeader: jest.fn() } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.correlationId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', req.correlationId);
    expect(next).toHaveBeenCalled();
  });

  it('should use existing x-correlation-id header', () => {
    const req = { headers: { 'x-correlation-id': 'existing-id' }, correlationId: undefined } as any;
    const res = { setHeader: jest.fn() } as any;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(req.correlationId).toBe('existing-id');
    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', 'existing-id');
  });
});
