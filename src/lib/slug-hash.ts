import { createHash } from 'node:crypto';

/**
 * 对真实路径生成16位MD5哈希
 * @param realSlug 真实文件路径slug，如 "0002-coding/0001-python/0001-基础语法"
 * @returns 16位十六进制哈希，如 "a3f8b2c1d4e5f6a7"
 */
export function hashSlug(realSlug: string): string {
  return createHash('md5')
    .update(realSlug)
    .digest('hex')
    .substring(0, 16);
}

// 哈希到真实路径的映射表
const hashToSlug = new Map<string, string>();
const slugToHash = new Map<string, string>();

/**
 * 注册一个slug并返回其哈希值
 * 如果已注册，返回缓存的哈希值
 */
export function registerSlug(realSlug: string): string {
  // 检查缓存
  if (slugToHash.has(realSlug)) {
    return slugToHash.get(realSlug)!;
  }

  const hash = hashSlug(realSlug);
  hashToSlug.set(hash, realSlug);
  slugToHash.set(realSlug, hash);
  return hash;
}

/**
 * 根据哈希值获取真实路径
 */
export function resolveHash(hash: string): string | undefined {
  return hashToSlug.get(hash);
}

/**
 * 获取所有注册的映射（用于调试）
 */
export function getSlugMap(): Map<string, string> {
  return new Map(hashToSlug);
}