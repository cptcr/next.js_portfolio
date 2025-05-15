// lib/utils/cdn.ts
/**
 * CDN utility for managing asset URLs
 * This provides a centralized way to generate asset URLs
 * and can be easily configured to use different CDN providers
 */

// CDN configuration
type CDNConfig = {
  baseUrl: string;
  enabled: boolean;
  imagePath: string;
  assetPath: string;
};

// Default CDN configuration
const defaultConfig: CDNConfig = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || '',
  enabled: !!process.env.NEXT_PUBLIC_CDN_URL,
  imagePath: '/images',
  assetPath: '/assets',
};

// Current configuration (initialized with defaults)
let cdnConfig: CDNConfig = { ...defaultConfig };

/**
 * Initialize the CDN configuration
 * @param config Partial configuration to override defaults
 */
export function initCDN(config: Partial<CDNConfig> = {}) {
  cdnConfig = { ...defaultConfig, ...config };
  
  // Ensure baseUrl doesn't end with a slash
  if (cdnConfig.baseUrl.endsWith('/')) {
    cdnConfig.baseUrl = cdnConfig.baseUrl.slice(0, -1);
  }
  
  // Ensure paths start with a slash
  if (!cdnConfig.imagePath.startsWith('/')) {
    cdnConfig.imagePath = '/' + cdnConfig.imagePath;
  }
  
  if (!cdnConfig.assetPath.startsWith('/')) {
    cdnConfig.assetPath = '/' + cdnConfig.assetPath;
  }
}

/**
 * Get the current CDN configuration
 */
export function getCDNConfig(): CDNConfig {
  return { ...cdnConfig };
}

/**
 * Generate an image URL
 * @param path Relative path to the image
 * @param opts Options for image transformation
 * @returns Full URL to the image
 */
export function imageUrl(path: string, opts: { width?: number; height?: number; quality?: number } = {}) {
  if (!path) return '';
  
  // Handle absolute URLs
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Handle local images when CDN is disabled
  if (!cdnConfig.enabled) {
    const localPath = path.startsWith('/') ? path : `${cdnConfig.imagePath}/${path}`;
    return localPath;
  }
  
  // Ensure path doesn't start with a slash for concatenation
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct the base URL
  let url = `${cdnConfig.baseUrl}${cdnConfig.imagePath}/${normalizedPath}`;
  
  // Add image transformation parameters if CDN supports it
  // This is an example for a generic CDN - customize for your specific provider
  const params = new URLSearchParams();
  
  if (opts.width) params.append('w', opts.width.toString());
  if (opts.height) params.append('h', opts.height.toString());
  if (opts.quality) params.append('q', opts.quality.toString());
  
  const paramsString = params.toString();
  if (paramsString) {
    url += `?${paramsString}`;
  }
  
  return url;
}

/**
 * Generate an asset URL (JS, CSS, fonts, etc.)
 * @param path Relative path to the asset
 * @returns Full URL to the asset
 */
export function assetUrl(path: string) {
  if (!path) return '';
  
  // Handle absolute URLs
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Handle local assets when CDN is disabled
  if (!cdnConfig.enabled) {
    const localPath = path.startsWith('/') ? path : `${cdnConfig.assetPath}/${path}`;
    return localPath;
  }
  
  // Ensure path doesn't start with a slash for concatenation
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${cdnConfig.baseUrl}${cdnConfig.assetPath}/${normalizedPath}`;
}

/**
 * Generate an avatar URL with proper sizing
 * @param path Path to the avatar image
 * @param size Size of the avatar in pixels
 * @returns Full URL to the avatar image
 */
export function avatarUrl(path: string | null | undefined, size = 64) {
  if (!path) {
    // Return default avatar if no path provided
    return imageUrl('default-avatar.png', { width: size, height: size });
  }
  
  return imageUrl(path, { width: size, height: size });
}

// Initialize CDN with default configuration
initCDN();