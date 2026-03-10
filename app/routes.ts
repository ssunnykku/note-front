import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  route('login', 'routes/login.tsx'),
  route('signup', 'routes/signup.tsx'),
  layout('routes/layouts/default.tsx', [index('routes/home.tsx')]),
  route('*', 'routes/catch-all.tsx'),
] satisfies RouteConfig;
