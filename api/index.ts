import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from '../apps/api-gateway/dist/apps/api-gateway/src/app.module';
import { AllExceptionsFilter } from '../apps/api-gateway/dist/libs/common/src/filters/all-exceptions.filter';
import { TransformInterceptor } from '../apps/api-gateway/dist/libs/common/src/interceptors/transform.interceptor';
import { LoggingInterceptor } from '../apps/api-gateway/dist/libs/common/src/interceptors/logging.interceptor';
import { TimeoutInterceptor } from '../apps/api-gateway/dist/libs/common/src/interceptors/timeout.interceptor';
import type { Express } from 'express';

const API_DOCS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio API Documentation</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0d1117;color:#e6edf3;line-height:1.6}
  .container{max-width:1100px;margin:0 auto;padding:2rem}
  h1{font-size:2rem;margin-bottom:.25rem;color:#fff}
  .subtitle{color:#8b949e;margin-bottom:2rem}
  .base-url{background:#161b22;padding:.5rem 1rem;border-radius:6px;margin-bottom:2rem;border:1px solid #30363d;font-family:monospace;color:#58a6ff}
  h2{font-size:1.3rem;margin:2rem 0 1rem;padding-bottom:.5rem;border-bottom:1px solid #21262d;color:#f0f6fc}
  .endpoint{background:#161b22;border:1px solid #30363d;border-radius:8px;margin-bottom:.75rem;overflow:hidden}
  .endpoint-header{padding:.75rem 1rem;display:flex;align-items:center;gap:.75rem;cursor:pointer;user-select:none}
  .endpoint-header:hover{background:#1c2128}
  .method{display:inline-block;padding:2px 8px;border-radius:4px;font-size:.75rem;font-weight:700;font-family:monospace;text-transform:uppercase;min-width:56px;text-align:center}
  .get{background:#1f6feb22;color:#58a6ff;border:1px solid #1f6feb44}
  .post{background:#23863622;color:#3fb950;border:1px solid #23863644}
  .put{background:#9e6a0322;color:#d29922;border:1px solid #9e6a0344}
  .patch{background:#8b5cf622;color:#a78bfa;border:1px solid #8b5cf644}
  .delete{background:#da363322;color:#f85149;border:1px solid #da363344}
  .path{font-family:monospace;font-size:.9rem;color:#e6edf3;flex:1}
  .auth-badge{font-size:.7rem;padding:2px 6px;border-radius:4px;font-weight:600}
  .public{background:#23863622;color:#3fb950}
  .private{background:#da363322;color:#f85149}
  .chevron{color:#8b949e;font-size:.8rem;transition:transform .2s}
  .expanded .chevron{transform:rotate(90deg)}
  .endpoint-body{display:none;padding:0 1rem 1rem;border-top:1px solid #21262d}
  .expanded .endpoint-body{display:block}
  .section-label{color:#8b949e;font-size:.75rem;text-transform:uppercase;font-weight:600;margin:.75rem 0 .25rem}
  .desc{color:#e6edf3;margin-bottom:.5rem}
  code,pre{font-family:'JetBrains Mono','Fira Code',monospace}
  pre{background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:.75rem;overflow-x:auto;font-size:.8rem;color:#8b949e;margin-bottom:.5rem}
  .param-table{width:100%;border-collapse:collapse;margin-bottom:.5rem;font-size:.85rem}
  .param-table th,.param-table td{padding:.4rem .6rem;text-align:left;border-bottom:1px solid #21262d}
  .param-table th{color:#8b949e;font-weight:600;font-size:.75rem;text-transform:uppercase}
  .param-table td{color:#e6edf3}
  .param-table tr:last-child td{border-bottom:none}
  .required{color:#f85149;font-size:.7rem;font-weight:600}
  .tag{display:inline-block;background:#1f6feb22;color:#58a6ff;border:1px solid #1f6feb44;padding:1px 6px;border-radius:4px;font-size:.7rem;margin:0 2px;font-family:monospace}
  @media(max-width:768px){.container{padding:1rem}.endpoint-header{flex-wrap:wrap}}
</style>
</head>
<body>
<div class="container">
  <h1>Portfolio API</h1>
  <p class="subtitle">REST API documentation for Portfolio Backend</p>
  <div class="base-url">Base URL: https://portfosin.vercel.app</div>

  <h2>Health</h2>
  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method get">GET</span>
      <span class="path">/api/v1/health</span>
      <span class="auth-badge public">Public</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Health check endpoint. Returns server status and timestamp.</div>
      <div class="section-label">Response 200</div>
      <pre>{"success":true,"message":"Success","data":{"status":"ok","timestamp":"2026-01-01T00:00:00.000Z","service":"api-gateway"},"statusCode":200,"timestamp":"2026-01-01T00:00:00.000Z"}</pre>
    </div>
  </div>

  <h2>Authentication</h2>
  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method post">POST</span>
      <span class="path">/api/v1/auth/register</span>
      <span class="auth-badge public">Public</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Register a new user account.</div>
      <div class="section-label">Request Body</div>
      <pre>{"email":"user@example.com","name":"John Doe","password":"secure123"}</pre>
      <div class="section-label">Constraints</div>
      <table class="param-table">
        <tr><th>Field</th><th>Type</th><th>Required</th></tr>
        <tr><td>email</td><td>string (email)</td><td><span class="required">required</span></td></tr>
        <tr><td>name</td><td>string (min 2)</td><td><span class="required">required</span></td></tr>
        <tr><td>password</td><td>string (min 6)</td><td><span class="required">required</span></td></tr>
      </table>
      <div class="section-label">Response 201</div>
      <pre>{"success":true,"message":"User registered successfully","data":{"id":"uuid","email":"user@example.com","name":"John Doe"},"statusCode":201,"timestamp":"..."}</pre>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method post">POST</span>
      <span class="path">/api/v1/auth/login</span>
      <span class="auth-badge public">Public</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Authenticate user and receive JWT token.</div>
      <div class="section-label">Request Body</div>
      <pre>{"email":"user@example.com","password":"secure123"}</pre>
      <table class="param-table">
        <tr><th>Field</th><th>Type</th><th>Required</th></tr>
        <tr><td>email</td><td>string (email)</td><td><span class="required">required</span></td></tr>
        <tr><td>password</td><td>string</td><td><span class="required">required</span></td></tr>
      </table>
      <div class="section-label">Response 200</div>
      <pre>{"success":true,"message":"Login successful","data":{"access_token":"eyJhbGciOiJIUzI1NiIs...","user":{"id":"uuid","email":"user@example.com","name":"John Doe"}},"statusCode":200,"timestamp":"..."}</pre>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method get">GET</span>
      <span class="path">/api/v1/auth/profile</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Get current authenticated user's profile.</div>
      <div class="section-label">Headers</div>
      <pre>Authorization: Bearer &lt;JWT_TOKEN&gt;</pre>
      <div class="section-label">Response 200</div>
      <pre>{"success":true,"message":"Success","data":{"id":"uuid","email":"user@example.com","name":"John Doe","created_at":"..."},"statusCode":200,"timestamp":"..."}</pre>
    </div>
  </div>

  <h2>Projects</h2>
  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method get">GET</span>
      <span class="path">/api/v1/projects</span>
      <span class="auth-badge public">Public</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Get all projects with pagination and filtering.</div>
      <div class="section-label">Query Parameters</div>
      <table class="param-table">
        <tr><th>Parameter</th><th>Type</th><th>Required</th></tr>
        <tr><td>page</td><td>number</td><td>Optional (default: 1)</td></tr>
        <tr><td>limit</td><td>number</td><td>Optional</td></tr>
        <tr><td>status</td><td>string</td><td>Optional</td></tr>
        <tr><td>techId</td><td>string (uuid)</td><td>Optional</td></tr>
      </table>
      <div class="section-label">Response 200</div>
      <pre>{"success":true,"message":"Success","data":{"data":[],"pagination":{"page":1,"limit":10,"total":0}},"statusCode":200,"timestamp":"..."}</pre>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method get">GET</span>
      <span class="path">/api/v1/projects/:id</span>
      <span class="auth-badge public">Public</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Get a single project by ID.</div>
      <div class="section-label">Path Parameters</div>
      <table class="param-table">
        <tr><th>Parameter</th><th>Type</th></tr>
        <tr><td>id</td><td>string (uuid)</td></tr>
      </table>
      <div class="section-label">Response 200</div>
      <pre>{"success":true,"message":"Success","data":{"id":"uuid","title":"My Project","description":"...","status":"active","images":[],"techs":[],"created_at":"...","updated_at":"..."},"statusCode":200,"timestamp":"..."}</pre>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method post">POST</span>
      <span class="path">/api/v1/projects</span>
      <span class="auth-badge public">Public</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Create a new project.</div>
      <div class="section-label">Request Body</div>
      <pre>{"title":"My Project","description":"Project description","status":"active"}</pre>
      <div class="section-label">Response 201</div>
      <pre>{"success":true,"message":"Created","data":{"id":"uuid","title":"My Project","status":"active"},"statusCode":201,"timestamp":"..."}</pre>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method put">PUT</span>
      <span class="path">/api/v1/projects/:id</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Update an entire project.</div>
      <div class="section-label">Response 200</div>
      <pre>{"success":true,"message":"Updated","data":{...},"statusCode":200,"timestamp":"..."}</pre>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method patch">PATCH</span>
      <span class="path">/api/v1/projects/:id</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Partially update a project.</div>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method delete">DELETE</span>
      <span class="path">/api/v1/projects/:id</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Delete a project (returns 204 No Content).</div>
    </div>
  </div>

  <h2>Technologies</h2>
  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method get">GET</span>
      <span class="path">/api/v1/techs</span>
      <span class="auth-badge public">Public</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Get all technologies.</div>
      <div class="section-label">Response 200</div>
      <pre>{"success":true,"message":"Success","data":{"data":[{"id":"uuid","name":"React","icon":"react-icon.svg","category":"frontend"}],...},"statusCode":200,"timestamp":"..."}</pre>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method get">GET</span>
      <span class="path">/api/v1/techs/:id</span>
      <span class="auth-badge public">Public</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Get a single technology by ID.</div>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method post">POST</span>
      <span class="path">/api/v1/techs</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Create a new technology entry.</div>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method put">PUT</span>
      <span class="path">/api/v1/techs/:id</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Update a technology.</div>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method delete">DELETE</span>
      <span class="path">/api/v1/techs/:id</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Delete a technology (204 No Content).</div>
    </div>
  </div>

  <h2>Users</h2>
  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method get">GET</span>
      <span class="path">/api/v1/users</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Get paginated list of users (admin).</div>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method get">GET</span>
      <span class="path">/api/v1/users/:id</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Get a user by ID.</div>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method post">POST</span>
      <span class="path">/api/v1/users</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Create a new user (admin).</div>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method put">PUT</span>
      <span class="path">/api/v1/users/:id</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Update a user.</div>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method delete">DELETE</span>
      <span class="path">/api/v1/users/:id</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Delete a user (204 No Content).</div>
    </div>
  </div>

  <h2>Uploads</h2>
  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method post">POST</span>
      <span class="path">/api/v1/uploads/:projectId/:type</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Upload an image for a project. Supported types: <span class="tag">mockup</span> or <span class="tag">post</span></div>
      <div class="section-label">Content-Type</div>
      <pre>multipart/form-data</pre>
      <div class="section-label">Form Data</div>
      <table class="param-table">
        <tr><th>Field</th><th>Type</th><th>Details</th></tr>
        <tr><td>file</td><td>file</td><td>Max 10MB. Formats: JPEG, PNG, WEBP, GIF, SVG</td></tr>
      </table>
      <div class="section-label">Response 201</div>
      <pre>{"success":true,"message":"Uploaded","data":{"url":"https://r2.cloudflare.com/...","type":"mockup"},"statusCode":201,"timestamp":"..."}</pre>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method get">GET</span>
      <span class="path">/api/v1/uploads/:projectId</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Get all images for a project.</div>
    </div>
  </div>

  <div class="endpoint">
    <div class="endpoint-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="method delete">DELETE</span>
      <span class="path">/api/v1/uploads/:id</span>
      <span class="auth-badge private">Auth</span>
      <span class="chevron">&#9654;</span>
    </div>
    <div class="endpoint-body">
      <div class="desc">Delete an image (204 No Content).</div>
    </div>
  </div>

  <h2>Authentication</h2>
  <div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:1rem;margin-bottom:2rem">
    <p>Endpoints marked <span class="auth-badge private">Auth</span> require a JWT token in the <code style="color:#58a6ff">Authorization</code> header:</p>
    <pre style="margin-top:.5rem">Authorization: Bearer eyJhbGciOiJIUzI1NiIs...</pre>
    <p style="margin-top:.75rem">To get a token, call <code style="color:#3fb950">POST /api/v1/auth/login</code> with valid credentials.</p>
  </div>

  <div style="text-align:center;color:#8b949e;padding:2rem 0;font-size:.85rem">
    Portfolio API &mdash; Built with NestJS, Neon PostgreSQL, and Cloudflare R2
  </div>
</div>
</body>
</html>`;

let cachedApp: Express;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix(configService.get('GATEWAY_PREFIX', 'api/v1'));

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(30000),
  );

  await app.init();
  cachedApp = app.getHttpAdapter().getInstance();
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    await bootstrap();
  }
  if (req.url === '/' || req.url === '') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(API_DOCS_HTML);
  }
  cachedApp(req, res);
}
