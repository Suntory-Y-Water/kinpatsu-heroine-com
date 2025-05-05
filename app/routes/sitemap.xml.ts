import app from '@/server';
import sitemap from '@/lib/sitemap';
import { createRoute } from 'honox/factory';

export default createRoute(async (c) => {
  const hostname = c.env.PUBLIC_APP_URL;
  const { data, headers } = await sitemap({
    app,
    hostname,
    exclude: ['/admin', '/admin/login', '/local-bucket/images/:filename'],
    priority: {
      '/': '1.0',
      '/character/:id': '0.8',
      '/register/work': '0.5',
      '/register/character': '0.5',
      '/about': '0.3',
      '/contact': '0.3',
      '/privacy': '0.2',
      '/terms': '0.2',
    },
    frequency: {
      '/': 'daily',
      '/character/:id': 'weekly',
      '/register/work': 'monthly',
      '/register/character': 'monthly',
      '/about': 'yearly',
      '/contact': 'yearly',
      '/privacy': 'yearly',
      '/terms': 'yearly',
    },
  });
  return c.body(data, headers);
});
