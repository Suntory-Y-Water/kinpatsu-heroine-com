import type { Hono } from 'hono';
import { inspectRoutes } from 'hono/dev';
import { getAllCharacters } from '@/lib/db/getAllCharacters';

interface RouteData {
  path: string;
  method: string;
  name: string;
  isMiddleware: boolean;
}

export interface SitemapOptions {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  app: Hono<any, any, string>;
  hostname?: string;
  exclude?: string[];
  frequency?: Record<string, Frequency>;
  priority?: Record<string, string>;
  DB?: D1Database;
}

interface SitemapResponse {
  data: string;
  headers: Record<string, string>;
}
type Frequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

const DEFAULT_CONFIG = {
  hostname: 'http://localhost:5173',
  exclude: ['/sitemap.xml'],
  defaultFrequency: 'weekly' as Frequency,
  defaultPriority: '0.5',
};

/**
 * Generates a sitemap for the given Hono app.
 * @param options - The options for generating the sitemap.
 * @returns A promise that resolves to a SitemapResponse.
 * @throws Error if options are invalid.
 */
const sitemap = async (options: SitemapOptions): Promise<SitemapResponse> => {
  try {
    validateOptions({ options });

    const config = { ...DEFAULT_CONFIG, ...options };
    const routesData: RouteData[] = inspectRoutes(config.app);

    const filteredRoutes = sortRoutesByDepth({ routes: routesData }).filter(
      (route) =>
        !config.exclude.includes(route.path) &&
        route.method === 'GET' &&
        !route.isMiddleware &&
        route.path !== '/*',
    );

    // 動的ルートを実際のURLに展開
    const expandedRoutes = await expandDynamicRoutes({
      routes: filteredRoutes,
      config,
    });

    const sitemapXml = await generateSitemapXml({
      routes: expandedRoutes,
      config,
    });

    return {
      data: sitemapXml,
      headers: {
        'Content-Type': 'application/xml',
      },
    };
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
};

/**
 * Validates the provided options.
 * @param params - バリデーション用パラメータ
 * @throws Error if options are invalid.
 */
function validateOptions({ options }: { options: SitemapOptions }): void {
  if (options.priority) {
    for (const [key, value] of Object.entries(options.priority)) {
      const priority = Number.parseFloat(value);
      if (Number.isNaN(priority) || priority < 0 || priority > 1) {
        throw new Error(
          `Invalid priority value for ${key}: ${value}. Must be between 0.0 and 1.0`,
        );
      }
    }
  }

  if (options.frequency) {
    const validFrequencies: Frequency[] = [
      'always',
      'hourly',
      'daily',
      'weekly',
      'monthly',
      'yearly',
      'never',
    ];
    for (const [key, value] of Object.entries(options.frequency)) {
      if (!validFrequencies.includes(value)) {
        throw new Error(`Invalid frequency value for ${key}: ${value}`);
      }
    }
  }
}

/**
 * Sorts routes by the depth of their paths.
 * @param params - ソート用パラメータ
 * @returns Sorted array of routes.
 */
function sortRoutesByDepth({ routes }: { routes: RouteData[] }): RouteData[] {
  return routes.sort((a, b) => {
    const aDepth = a.path === '/' ? 0 : a.path.split('/').length;
    const bDepth = b.path === '/' ? 0 : b.path.split('/').length;
    return aDepth - bDepth;
  });
}

/**
 * 動的ルートを実際のURLに展開する関数
 * @param params - 展開用パラメータ
 * @returns 展開されたルート
 */
async function expandDynamicRoutes({
  routes,
  config,
}: {
  routes: RouteData[];
  config: SitemapOptions & typeof DEFAULT_CONFIG;
}): Promise<RouteData[]> {
  const expandedRoutes: RouteData[] = [];

  for (const route of routes) {
    if (route.path !== '/character/:id' || !config.DB) {
      expandedRoutes.push(route);
      continue;
    }

    const charactersResult = await getAllCharacters({ DB: config.DB });
    if (!charactersResult.isOk()) {
      continue;
    }

    const characters = charactersResult.value;
    for (const character of characters) {
      expandedRoutes.push({
        ...route,
        path: `/character/${character.characterId}`,
      });
    }
  }

  return expandedRoutes;
}

/**
 * Generates the XML content for the sitemap.
 * @param params - XML生成用パラメータ
 * @returns A promise that resolves to the XML string.
 */
async function generateSitemapXml({
  routes,
  config,
}: {
  routes: RouteData[];
  config: SitemapOptions & typeof DEFAULT_CONFIG;
}): Promise<string> {
  const lastMod = new Date().toISOString().split('T')[0];
  const getChangeFreq = (path: string) =>
    config.frequency?.[path] || config.defaultFrequency;
  const getPriority = (path: string) =>
    config.priority?.[path] || config.defaultPriority;

  const urlEntries = routes.map(
    (route) => `
    <url>
      <loc>${
        route.path === '/' ? config.hostname : `${config.hostname}${route.path}`
      }</loc>
      <lastmod>${lastMod}</lastmod>
      <changefreq>${getChangeFreq(route.path)}</changefreq>
      <priority>${getPriority(route.path)}</priority>
    </url>
  `,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${urlEntries.join('')}
  </urlset>`;
}

export default sitemap;
