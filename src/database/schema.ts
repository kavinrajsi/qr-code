import {
  bigserial,
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    emailHash: text("email_hash").notNull().unique(),
    name: text("name"),
    role: text("role").notNull().default("user"),
    isSuperAdmin: boolean("is_super_admin").notNull().default(false),
    suspended: boolean("suspended").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("users_role_check", sql`${table.role} in ('user','admin','super_admin')`),
    // Only one super admin row can ever exist.
    uniqueIndex("users_single_super_admin").on(table.isSuperAdmin).where(sql`${table.isSuperAdmin}`),
  ],
);

export const stores = pgTable(
  "stores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    gstin: text("gstin"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("stores_admin_idx").on(table.adminId)],
);

// Members are keyed by email hash so an invite works before the person signs in.
export const storeMembers = pgTable(
  "store_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    emailHash: text("email_hash").notNull(),
    userId: uuid("user_id").references(() => users.id),
    role: text("role").notNull(), // manager | employee
    displayName: text("display_name"), // typed by the inviter; shown until the member signs in
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("store_members_store_email").on(table.storeId, table.emailHash),
    check("store_members_role_check", sql`${table.role} in ('manager','employee')`),
    index("store_members_email_idx").on(table.emailHash),
  ],
);

export const qrCodes = pgTable(
  "qr_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(), // url | map | vcard
    title: text("title").notNull(),
    payload: jsonb("payload").notNull(),
    isDynamic: boolean("is_dynamic").notNull(),
    shortCode: text("short_code").unique(),
    status: text("status").notNull().default("active"), // active | disabled
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("qr_codes_type_check", sql`${table.type} in ('url','map','vcard')`),
    index("qr_codes_store_idx").on(table.storeId, table.createdAt),
    check("qr_codes_dynamic_has_code", sql`(${table.isDynamic} = false) or (${table.shortCode} is not null)`),
  ],
);

export const qrScans = pgTable(
  "qr_scans",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    qrCodeId: uuid("qr_code_id")
      .notNull()
      .references(() => qrCodes.id, { onDelete: "cascade" }),
    scannedAt: timestamp("scanned_at", { withTimezone: true }).notNull().defaultNow(),
    ipAddressHash: text("ip_address_hash"),
    country: text("country"),
    device: text("device"),
  },
  (table) => [index("qr_scans_code_time_idx").on(table.qrCodeId, table.scannedAt)],
);

// Prepaid credit ledger. Balance = SUM(delta) for the store.
export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(), // purchase | qr_create | adjustment
    reference: text("reference"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("credit_ledger_store_idx").on(table.storeId),
    // A Razorpay payment can credit a store only once.
    uniqueIndex("credit_ledger_purchase_reference")
      .on(table.reference)
      .where(sql`${table.reason} = 'purchase'`),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    credits: integer("credits").notNull(),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    razorpayOrderId: text("razorpay_order_id").notNull().unique(),
    razorpayPaymentId: text("razorpay_payment_id").unique(),
    status: text("status").notNull().default("created"), // created | paid | failed
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [check("payments_status_check", sql`${table.status} in ('created','paid','failed')`)],
);

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id")
    .notNull()
    .unique()
    .references(() => payments.id),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  number: text("number").notNull().unique(),
  amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
  credits: integer("credits").notNull(),
  gstin: text("gstin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  actorId: uuid("actor_id").references(() => users.id),
  action: text("action").notNull(),
  target: text("target"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
