import fs from 'node:fs';
import path from 'node:path';

const CACHE_DIR = path.resolve('.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'stars.json');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  stars: number;
  timestamp: number;
}

interface CacheData {
  [repo: string]: CacheEntry;
}

function readCache(): CacheData {
  try {
    if (!fs.existsSync(CACHE_FILE)) return {};
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeCache(data: CacheData): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // silently fail — caching is best-effort
  }
}

/** Extract "owner/repo" from a GitHub URL */
export function extractRepo(githubUrl?: string): string | null {
  if (!githubUrl) return null;
  const match = githubUrl.match(/github\.com\/([^/]+\/[^/]+)/);
  return match ? match[1] : null;
}

/**
 * Fetch star count for a GitHub repo, with local disk cache (24h TTL).
 * Falls back to `gh` CLI if the API request fails.
 */
export async function fetchStars(repo: string): Promise<number> {
  // Check cache first
  const cache = readCache();
  const entry = cache[repo];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.stars;
  }

  let stars = 0;

  // Try GitHub API
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (res.ok) {
      const data = await res.json();
      stars = data.stargazers_count ?? 0;
    }
  } catch {
    // Fall through to gh CLI
  }

  // Fallback: gh CLI
  if (stars === 0) {
    try {
      const { execSync } = await import('node:child_process');
      const result = execSync(`gh api repos/${repo} --jq .stargazers_count`, {
        encoding: 'utf-8',
        timeout: 10000,
      });
      stars = parseInt(result.trim(), 10) || 0;
    } catch {
      // no-op
    }
  }

  // Update cache
  cache[repo] = { stars, timestamp: Date.now() };
  writeCache(cache);

  return stars;
}

/**
 * Enrich a list of projects with their GitHub star counts.
 * Runs all fetches concurrently and uses the shared cache.
 */
export async function enrichWithStars<T extends { data: { github?: string } }>(
  projects: T[]
): Promise<(T & { stars: number })[]> {
  return Promise.all(
    projects.map(async (project) => {
      const repo = extractRepo(project.data.github);
      const stars = repo ? await fetchStars(repo) : 0;
      return { ...project, stars };
    })
  );
}
