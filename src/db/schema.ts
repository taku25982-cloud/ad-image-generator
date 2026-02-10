
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
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

export const generations = sqliteTable("generation", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
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
