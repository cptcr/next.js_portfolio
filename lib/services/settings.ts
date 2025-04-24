// lib/services/settings.ts
import { eq } from 'drizzle-orm';
import { db } from '../db/postgres';
import { siteSettings, SiteSetting, NewSiteSetting } from '../db/schema';

// Types for settings
export type SiteSettingsKey = 
  | 'site_name' 
  | 'site_description'
  | 'site_logo'
  | 'hero_title'
  | 'hero_subtitle'
  | 'site_theme'
  | 'posts_per_page'
  | 'show_author_info'
  | 'show_featured_posts'
  | 'featured_post_limit'
  | 'social_links'
  | 'seo_settings'
  | 'analytics_code'
  | 'contact_email'
  | 'hero_background_image'
  | 'footer_text'
  | 'allow_comments'
  | 'discord_notifications_enabled'
  | 'discord_webhook_url';

// Default settings
export const DEFAULT_SETTINGS: Record<SiteSettingsKey, any> = {
  site_name: "Tony (cptcr) | Backend Developer",
  site_description: "17-year-old backend developer specializing in Next.js, TypeScript, and TailwindCSS.",
  site_logo: "",
  hero_title: "Hey, I'm Tony",
  hero_subtitle: "A 17-year-old backend developer passionate about creating efficient, scalable applications with Node.js, TypeScript, and Express.",
  site_theme: {
    primaryColor: "#3498db",
    fontFamily: "inter",
    headingStyle: "large",
    textSpacing: "normal",
    darkMode: true,
    showThemeToggle: true
  },
  posts_per_page: 9,
  show_author_info: true,
  show_featured_posts: true,
  featured_post_limit: 3,
  social_links: {
    twitter: "cptcrr",
    github: "cptcr",
    linkedin: "",
    instagram: ""
  },
  seo_settings: {
    titleTemplate: "%s | Tony (cptcr)",
    defaultDescription: "17-year-old backend developer specializing in Next.js, TypeScript, and TailwindCSS.",
    robotsIndex: true,
    generateCanonicalLinks: true
  },
  analytics_code: "",
  contact_email: "contact@cptcr.dev",
  hero_background_image: "",
  footer_text: "© {year} Tony (cptcr). All rights reserved.",
  allow_comments: false,
  discord_notifications_enabled: true,
  discord_webhook_url: ""
};

// Settings service
export const settingsService = {
  // Get a setting by key
  async getSetting<T = any>(key: SiteSettingsKey): Promise<T | null> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    
    if (!setting) {
      // Return default value if exists
      if (key in DEFAULT_SETTINGS) {
        return DEFAULT_SETTINGS[key] as T;
      }
      return null;
    }
    
    return setting.value as T;
  },
  
  // Set a setting value
  async setSetting<T = any>(key: SiteSettingsKey, value: T): Promise<boolean> {
    // Check if setting exists
    const [existing] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    
    if (existing) {
      // Update existing setting
      await db.update(siteSettings)
        .set({
          value: value as any,
          updatedAt: new Date()
        })
        .where(eq(siteSettings.key, key));
    } else {
      // Create new setting
      await db.insert(siteSettings)
        .values({
          key,
          value: value as any
        });
    }
    
    return true;
  },
  
  // Delete a setting
  async deleteSetting(key: SiteSettingsKey): Promise<boolean> {
    await db.delete(siteSettings).where(eq(siteSettings.key, key));
    return true;
  },
  
  // Get all settings as an object
  async getAllSettings(): Promise<Record<string, any>> {
    const allSettings = await db.select().from(siteSettings);
    
    // Start with default settings
    const settings: Record<string, any> = { ...DEFAULT_SETTINGS };
    
    // Override with saved settings
    allSettings.forEach(setting => {
      settings[setting.key] = setting.value;
    });
    
    return settings;
  },
  
  // Set multiple settings at once
  async setMultipleSettings(settings: Record<SiteSettingsKey, any>): Promise<boolean> {
    // Execute in a transaction
    await db.transaction(async (tx) => {
      for (const [key, value] of Object.entries(settings) as [SiteSettingsKey, any][]) {
        const [existing] = await tx.select().from(siteSettings).where(eq(siteSettings.key, key));
        
        if (existing) {
          // Update existing setting
          await tx.update(siteSettings)
            .set({
              value,
              updatedAt: new Date()
            })
            .where(eq(siteSettings.key, key));
        } else {
          // Create new setting
          await tx.insert(siteSettings)
            .values({
              key,
              value
            });
        }
      }
    });
    
    return true;
  },
  
  // Initialize default settings if none exist
  async initializeDefaultSettings(): Promise<void> {
    const existingSettings = await db.select().from(siteSettings);
    
    if (existingSettings.length === 0) {
      // Insert all default settings
      const settingsToInsert = Object.entries(DEFAULT_SETTINGS).map(
        ([key, value]) => ({
          key,
          value
        })
      );
      
      await db.insert(siteSettings).values(settingsToInsert);
      console.log('Default settings initialized');
    }
  }
};