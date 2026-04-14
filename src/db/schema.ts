
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
    image: text("image"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    // Custom fields
    credits: integer("credits").default(3),
    plan: text("plan").default("free"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    subscriptionStatus: text("subscription_status"),
    currentPeriodStart: integer("current_period_start", { mode: "timestamp" }),
    currentPeriodEnd: integer("current_period_end", { mode: "timestamp" }),
    cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" }).default(false),

    // Usage stats
    usageTotalGenerations: integer("usage_total_generations").default(0),
    usageMonthlyGenerations: integer("usage_monthly_generations").default(0),
    usageLastGenerationAt: integer("usage_last_generation_at", { mode: "timestamp" }),
    usageResetAt: integer("usage_reset_at", { mode: "timestamp" }),
});

export const sessions = sqliteTable("session", {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => users.id),
});

export const accounts = sqliteTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => users.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verifications = sqliteTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const brandKits = sqliteTable("brand_kit", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    name: text("name").notNull(),
    description: text("description"),
    logoUrl: text("logo_url"),
    primaryColor: text("primary_color"),
    secondaryColor: text("secondary_color"),
    accentColor: text("accent_color"),
    preferredTone: text("preferred_tone"),
    defaultCopyRules: text("default_copy_rules", { mode: "json" }),
    negativeRules: text("negative_rules", { mode: "json" }),
    fontPreferences: text("font_preferences", { mode: "json" }),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const projects = sqliteTable("project", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    brandKitId: text("brand_kit_id").references(() => brandKits.id),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull().default("active"),
    tags: text("tags", { mode: "json" }),
    archivedAt: integer("archived_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const generations = sqliteTable("generation", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    projectId: text("project_id").references(() => projects.id),
    brandKitId: text("brand_kit_id").references(() => brandKits.id),
    sourceGenerationId: text("source_generation_id"),
    generationGroupId: text("generation_group_id"),
    variantLabel: text("variant_label"),
    isFavorite: integer("is_favorite", { mode: "boolean" }).notNull().default(false),
    originType: text("origin_type"),
    imageUrl: text("image_url").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    prompt: text("prompt").notNull(),
    templateId: text("template_id").notNull(),
    status: text("status").notNull(), // 'processing' | 'completed' | 'failed'
    creditsUsed: integer("credits_used").notNull(),
    content: text("content", { mode: "json" }).notNull(), // JSON
    format: text("format", { mode: "json" }).notNull(), // JSON
    branding: text("branding", { mode: "json" }), // JSON
    editHistory: text("edit_history", { mode: "json" }), // JSON
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const stripeWebhookEvents = sqliteTable("stripe_webhook_event", {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    processedAt: integer("processed_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});

export const templateLibraryEntries = sqliteTable("template_library_entry", {
    userId: text("user_id").notNull().references(() => users.id),
    templateId: text("template_id").notNull(),
    isFavorite: integer("is_favorite", { mode: "boolean" }).notNull().default(false),
    opens: integer("opens").notNull().default(0),
    creates: integer("creates").notNull().default(0),
    customizations: integer("customizations").notNull().default(0),
    lastOpenedAt: integer("last_opened_at", { mode: "timestamp" }),
    lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.templateId] }),
}));

export const customTemplates = sqliteTable("custom_template", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    baseTemplateId: text("base_template_id"),
    name: text("name").notNull(),
    description: text("description").notNull(),
    templateData: text("template_data", { mode: "json" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`),
});
