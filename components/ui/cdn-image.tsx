// components/ui/cdn-image.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { imageUrl } from '@/lib/utils/cdn';
import { cn } from '@/lib/utils/helpers';
import { Skeleton } from '@/components/ui/skeleton';

interface CDNImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export function CDNImage({
  src,
  alt,
  width,
  height,
  className,
  objectFit = 'cover',
  quality = 80,
  priority = false,
  onLoad,
  onError,
  fallbackSrc,
}: CDNImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Convert the src to a CDN URL
  const imageSource = error && fallbackSrc ? imageUrl(fallbackSrc) : imageUrl(src, { quality });
  
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };
  
  const handleError = () => {
    setIsLoading(false);
    
    // Only set error state if we don't have a fallback or if the current src is already the fallback
    if (!fallbackSrc || error) {
      setError(true);
      onError?.();
    } else {
      setError(true);
    }
  };
  
  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {isLoading && (
        <Skeleton
          className="absolute inset-0 z-10 w-full h-full"
          style={{ width, height }}
        />
      )}
      
      <Image
        src={imageSource}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill', 
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        style={{ 
          width: width || '100%', 
          height: height || '100%' 
        }}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}

export function Avatar({
  src,
  alt,
  size = 40,
  className,
  fallbackSrc,
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  fallbackSrc?: string;
}) {
  return (
    <CDNImage
      src={src || (fallbackSrc || 'default-avatar.png')}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      objectFit="cover"
      fallbackSrc={src ? (fallbackSrc || 'default-avatar.png') : undefined}
    />
  );
}