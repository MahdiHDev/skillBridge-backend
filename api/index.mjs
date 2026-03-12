var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/mailer.ts
import "dotenv/config";
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD
  }
});

// src/lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \n\nenum UserRole {\n  STUDENT\n  TUTOR\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  BANNED\n}\n\nenum TutorLevel {\n  BEGINNER\n  INTERMEDIATE\n  ADVANCED\n}\n\nenum DayOfWeek {\n  MON\n  TUE\n  WED\n  THU\n  FRI\n  SAT\n  SUN\n}\n\nenum BookingStatus {\n  PENDING\n  CONFIRMED\n  COMPLETED\n  CANCELLED\n}\n\nenum ProfileStatus {\n  PENDING\n  APPROVED\n  REJECTED\n}\n\nmodel User {\n  id            String     @id\n  name          String\n  email         String\n  emailVerified Boolean    @default(false)\n  role          UserRole   @default(STUDENT)\n  status        UserStatus @default(ACTIVE)\n  image         String?\n  createdAt     DateTime   @default(now())\n  updatedAt     DateTime   @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n\n  // Relations\n  tutorProfile TutorProfile?\n  bookings     Booking[]     @relation("StudentBookings")\n  reviews      Review[]\n  adminLogs    AdminLog[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel TutorProfile {\n  id            String        @id @default(uuid())\n  userId        String        @unique\n  bio           String?\n  totalReviews  Int           @default(0)\n  averageRating Float         @default(0)\n  status        ProfileStatus @default(PENDING)\n  isVerified    Boolean       @default(false)\n\n  // Relations \n  user            User               @relation(fields: [userId], references: [id])\n  tutorCategories TutorCategory[]\n  availability    AvailabilitySlot[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  reviews   Review[]\n}\n\nmodel Subject {\n  id   String @id @default(uuid())\n  name String\n  slug String @unique\n\n  //relations\n  tutorCategories TutorCategory[]\n\n  createdAt DateTime @default(now())\n}\n\n// Many to many resolve table\nmodel TutorCategory {\n  id              String     @id @default(uuid())\n  tutorProfileId  String\n  subjectId       String\n  hourlyRate      Float\n  experienceYears Int\n  level           TutorLevel\n  description     String?\n  isPrimary       Boolean    @default(false)\n\n  // Relations\n  tutorProfile TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Cascade)\n  subject      Subject      @relation(fields: [subjectId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime  @default(now())\n  bookings  Booking[]\n\n  @@unique([tutorProfileId, subjectId])\n}\n\nmodel AvailabilitySlot {\n  id             String @id @default(uuid())\n  tutorProfileId String\n\n  dayOfWeek DayOfWeek\n  startTime DateTime\n  endTime   DateTime\n\n  startDate DateTime\n  endDate   DateTime\n\n  isActive Boolean @default(true)\n\n  // Relation\n  tutorProfile TutorProfile @relation(fields: [tutorProfileId], references: [id])\n\n  createdAt DateTime @default(now())\n}\n\nmodel Booking {\n  id              String        @id @default(uuid())\n  studentId       String\n  tutorCategoryId String\n  sessionDate     DateTime\n  startTime       DateTime\n  endTime         DateTime\n  price           Float\n  status          BookingStatus @default(PENDING)\n  meetingLink     String?\n\n  // Relations \n  student       User          @relation("StudentBookings", fields: [studentId], references: [id])\n  tutorCategory TutorCategory @relation(fields: [tutorCategoryId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  review    Review?\n}\n\nmodel Review {\n  id             String  @id @default(uuid())\n  bookingId      String  @unique\n  studentId      String\n  tutorProfileId String\n  rating         Int\n  comment        String?\n\n  // Relations\n  booking      Booking      @relation(fields: [bookingId], references: [id])\n  student      User         @relation(fields: [studentId], references: [id])\n  tutorProfile TutorProfile @relation(fields: [tutorProfileId], references: [id])\n\n  createdAt DateTime @default(now())\n}\n\nmodel AdminLog {\n  id       String  @id @default(uuid())\n  adminId  String\n  action   String\n  targetId String?\n\n  // relations\n  admin User @relation(fields: [adminId], references: [id])\n\n  createdAt DateTime @default(now())\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"bookings","kind":"object","type":"Booking","relationName":"StudentBookings"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"adminLogs","kind":"object","type":"AdminLog","relationName":"AdminLogToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"totalReviews","kind":"scalar","type":"Int"},{"name":"averageRating","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"ProfileStatus"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"tutorCategories","kind":"object","type":"TutorCategory","relationName":"TutorCategoryToTutorProfile"},{"name":"availability","kind":"object","type":"AvailabilitySlot","relationName":"AvailabilitySlotToTutorProfile"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToTutorProfile"}],"dbName":null},"Subject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"tutorCategories","kind":"object","type":"TutorCategory","relationName":"SubjectToTutorCategory"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"TutorCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Float"},{"name":"experienceYears","kind":"scalar","type":"Int"},{"name":"level","kind":"enum","type":"TutorLevel"},{"name":"description","kind":"scalar","type":"String"},{"name":"isPrimary","kind":"scalar","type":"Boolean"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorCategoryToTutorProfile"},{"name":"subject","kind":"object","type":"Subject","relationName":"SubjectToTutorCategory"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToTutorCategory"}],"dbName":null},"AvailabilitySlot":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"dayOfWeek","kind":"enum","type":"DayOfWeek"},{"name":"startTime","kind":"scalar","type":"DateTime"},{"name":"endTime","kind":"scalar","type":"DateTime"},{"name":"startDate","kind":"scalar","type":"DateTime"},{"name":"endDate","kind":"scalar","type":"DateTime"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"AvailabilitySlotToTutorProfile"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorCategoryId","kind":"scalar","type":"String"},{"name":"sessionDate","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"DateTime"},{"name":"endTime","kind":"scalar","type":"DateTime"},{"name":"price","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"meetingLink","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"StudentBookings"},{"name":"tutorCategory","kind":"object","type":"TutorCategory","relationName":"BookingToTutorCategory"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"},{"name":"student","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"ReviewToTutorProfile"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"AdminLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"adminId","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"targetId","kind":"scalar","type":"String"},{"name":"admin","kind":"object","type":"User","relationName":"AdminLogToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AdminLogScalarFieldEnum: () => AdminLogScalarFieldEnum,
  AnyNull: () => AnyNull2,
  AvailabilitySlotScalarFieldEnum: () => AvailabilitySlotScalarFieldEnum,
  BookingScalarFieldEnum: () => BookingScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  SubjectScalarFieldEnum: () => SubjectScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TutorCategoryScalarFieldEnum: () => TutorCategoryScalarFieldEnum,
  TutorProfileScalarFieldEnum: () => TutorProfileScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.3.0",
  engine: "9d6ad21cbbceab97458517b147a6a09ff43aa735"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  TutorProfile: "TutorProfile",
  Subject: "Subject",
  TutorCategory: "TutorCategory",
  AvailabilitySlot: "AvailabilitySlot",
  Booking: "Booking",
  Review: "Review",
  AdminLog: "AdminLog"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  role: "role",
  status: "status",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TutorProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  bio: "bio",
  totalReviews: "totalReviews",
  averageRating: "averageRating",
  status: "status",
  isVerified: "isVerified",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SubjectScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  createdAt: "createdAt"
};
var TutorCategoryScalarFieldEnum = {
  id: "id",
  tutorProfileId: "tutorProfileId",
  subjectId: "subjectId",
  hourlyRate: "hourlyRate",
  experienceYears: "experienceYears",
  level: "level",
  description: "description",
  isPrimary: "isPrimary",
  createdAt: "createdAt"
};
var AvailabilitySlotScalarFieldEnum = {
  id: "id",
  tutorProfileId: "tutorProfileId",
  dayOfWeek: "dayOfWeek",
  startTime: "startTime",
  endTime: "endTime",
  startDate: "startDate",
  endDate: "endDate",
  isActive: "isActive",
  createdAt: "createdAt"
};
var BookingScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  tutorCategoryId: "tutorCategoryId",
  sessionDate: "sessionDate",
  startTime: "startTime",
  endTime: "endTime",
  price: "price",
  status: "status",
  meetingLink: "meetingLink",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  bookingId: "bookingId",
  studentId: "studentId",
  tutorProfileId: "tutorProfileId",
  rating: "rating",
  comment: "comment",
  createdAt: "createdAt"
};
var AdminLogScalarFieldEnum = {
  id: "id",
  adminId: "adminId",
  action: "action",
  targetId: "targetId",
  createdAt: "createdAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var UserStatus = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED"
};
var TutorLevel = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED"
};
var DayOfWeek = {
  MON: "MON",
  TUE: "TUE",
  WED: "WED",
  THU: "THU",
  FRI: "FRI",
  SAT: "SAT",
  SUN: "SUN"
};
var BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: [process.env.APP_URL || "http://localhost:5000"],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
      // 5 minutes
    }
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false
    },
    disableCSRFCheck: true
    // Allow requests without Origin header (Postman, mobile apps, etc.)
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = url || `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"SkillBridge" <prismablog@ph.com>',
          to: user.email,
          subject: "Please verify your email!",
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    }

    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .header {
      background-color: #0f172a;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }

    .header h1 {
      margin: 0;
      font-size: 22px;
    }

    .content {
      padding: 30px;
      color: #334155;
      line-height: 1.6;
    }

    .content h2 {
      margin-top: 0;
      font-size: 20px;
      color: #0f172a;
    }

    .button-wrapper {
      text-align: center;
      margin: 30px 0;
    }

    .verify-button {
      background-color: #2563eb;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      font-weight: bold;
      border-radius: 6px;
      display: inline-block;
    }

    .verify-button:hover {
      background-color: #1d4ed8;
    }

    .footer {
      background-color: #f1f5f9;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #64748b;
    }

    .link {
      word-break: break-all;
      font-size: 13px;
      color: #2563eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Prisma Blog</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Verify Your Email Address</h2>
      <p>
        Hello ${user.name} <br /><br />
        Thank you for registering on <strong>Prisma Blog</strong>.
        Please confirm your email address to activate your account.
      </p>

      <div class="button-wrapper">
        <a href="${verificationUrl}" class="verify-button">
          Verify Email
        </a>
      </div>

      <p>
        If the button doesn\u2019t work, copy and paste the link below into your browser:
      </p>

      <p class="link">
        ${url}
      </p>

      <p>
        This verification link will expire soon for security reasons.
        If you did not create an account, you can safely ignore this email.
      </p>

      <p>
        Regards, <br />
        <strong>Skill Bridge Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      \xA9 2025 SkillBridge. All rights reserved.
    </div>
  </div>
</body>
</html>
`
        });
        console.log("Message sent:", info.messageId);
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  }
});

// src/middleware/globalErrorHandler.ts
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let errorMessage = "Internal Server error";
  let errorDetails = err;
  const validLevels = Object.values(TutorLevel);
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields!";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    } else if (err.code === "P2002") {
      statusCode = 400;
      errorMessage = "Duplicate key error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Error occured during query execution";
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      errorMessage = "Authentication failed. Please check your creditials!";
    } else if (err.errorCode === "P1001") {
      statusCode = 400;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof Error) {
    statusCode = err.statusCode || 500;
    errorMessage = err.message;
  }
  res.status(statusCode);
  res.json({
    message: errorMessage,
    error: errorDetails
  });
}
var globalErrorHandler_default = errorHandler;

// src/middleware/notFound.ts
function notFound(req, res) {
  res.status(404).json({
    message: "Route not found!",
    path: req.originalUrl,
    date: Date()
  });
}

// src/routes/index.ts
import { Router as Router7 } from "express";

// src/modules/admin/admin.routes.ts
import { Router } from "express";

// src/middleware/auth.ts
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!"
        });
      }
      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email verification required. Please verify your email"
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified
      };
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You don't have permission to access this resource"
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth2;

// src/helpers/paginationSortingHelper.ts
var paginationSortingHelper = (options) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = options.skip !== void 0 ? Number(options.skip) : (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder || "desc";
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder
  };
};
var paginationSortingHelper_default = paginationSortingHelper;

// src/modules/admin/admin.service.ts
var getAllUsers = async ({
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
  search
}) => {
  const andConditions = [];
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    });
  }
  const users = await prisma.user.findMany({
    where: {
      AND: andConditions
    },
    take: limit,
    skip,
    orderBy: {
      [sortBy]: sortOrder
    }
  });
  const totalUsers = await users.length;
  return {
    users,
    total: totalUsers,
    page,
    limit
  };
};
var updateUserStatus = async (id, status) => {
  if (!Object.values(UserStatus).includes(status)) {
    throw new Error("Invalid status. Status must be ACTIVE or BANNED.");
  }
  return await prisma.user.update({
    where: { id },
    data: { status }
  });
};
var adminService = { getAllUsers, updateUserStatus };

// src/modules/admin/admin.controller.ts
var getAllUsers2 = async (req, res, next) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper_default(
    req.query
  );
  const { search } = req.query;
  const searchString = typeof search === "string" ? search : void 0;
  try {
    const result = await adminService.getAllUsers({
      search: searchString,
      limit,
      page,
      skip,
      sortBy,
      sortOrder
    });
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var updateUserStatus2 = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await adminService.updateUserStatus(
      id,
      status
    );
    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var adminController = { getAllUsers: getAllUsers2, updateUserStatus: updateUserStatus2 };

// src/modules/admin/admin.routes.ts
var adminRoutes = Router();
adminRoutes.get("/users", adminController.getAllUsers);
adminRoutes.patch(
  "/users/:id/status",
  auth_default("ADMIN" /* ADMIN */),
  adminController.updateUserStatus
);
var admin_routes_default = adminRoutes;

// src/modules/availability/availability.routes.ts
import { Router as Router2 } from "express";

// src/middleware/checkBanStatus.ts
var checkUserBanStatus = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please log in to access this resource."
    });
  }
  const userId = user.id;
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true }
  });
  if (userData?.status === "BANNED") {
    return res.status(403).json({
      success: false,
      message: "your account has been been banned by admin."
    });
  }
  next();
};
var checkBanStatus_default = checkUserBanStatus;

// src/modules/availability/availability.service.ts
var createAvailability = async (userId, data) => {
  const { startDate, endDate, slots } = data;
  if (!slots || slots.length === 0) {
    throw new Error("At least one slot is required");
  }
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);
  if (parsedStartDate >= parsedEndDate) {
    throw new Error("Invalid date range");
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor Profile not found");
  }
  const tutorProfileId = tutorProfile.id;
  const existingSlots = await prisma.availabilitySlot.findMany({
    where: {
      tutorProfileId,
      isActive: true
    }
  });
  const availabilityData = [];
  const validWeeks = Object.values(DayOfWeek);
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  for (const slot of slots) {
    if (slot.dayOfWeek && !validWeeks.includes(slot.dayOfWeek)) {
      throw new Error(
        `DayOfWeek must be one of: ${validWeeks.join(", ")}`
      );
    }
    if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
      throw new Error("Invalid time format. Use HH:MM (24-hour format)");
    }
    const startTime = /* @__PURE__ */ new Date(`1970-01-01T${slot.startTime}:00`);
    const endTime = /* @__PURE__ */ new Date(`1970-01-01T${slot.endTime}:00`);
    if (startTime >= endTime) {
      throw new Error("Start time must be before end time");
    }
    const sameDaySlots = existingSlots.filter(
      (s) => s.dayOfWeek === slot.dayOfWeek
    );
    const isOverlap = sameDaySlots.some((s) => {
      const timeOverlop = startTime < s.endTime && endTime > s.startTime;
      const dateOverlop = parsedStartDate <= s.endDate && parsedEndDate >= s.startDate;
      return timeOverlop && dateOverlop;
    });
    if (isOverlap) {
      throw new Error(`Time slot overlaps on ${slot.dayOfWeek}`);
    }
    availabilityData.push({
      tutorProfileId,
      dayOfWeek: slot.dayOfWeek,
      startTime,
      endTime,
      startDate: parsedStartDate,
      endDate: parsedEndDate
    });
  }
  return await prisma.availabilitySlot.createMany({
    data: availabilityData,
    skipDuplicates: true
  });
};
var getAvailability = async (userId) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor Profile not found");
  }
  const tutorProfileId = tutorProfile.id;
  console.log("tutor profle id", tutorProfileId);
  const availability = await prisma.availabilitySlot.findMany({
    where: { tutorProfileId }
  });
  return availability;
};
var getAvailibilityByTutorId = async (tutorProfileId) => {
  const result = await prisma.availabilitySlot.findMany({
    where: { tutorProfileId }
  });
  return result;
};
var updateAvailability = async (userId, availabilityId, data) => {
  const validWeeks = Object.values(DayOfWeek);
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor Profile not found");
  }
  const tutorProfileId = tutorProfile.id;
  const existingSlot = await prisma.availabilitySlot.findFirst({
    where: {
      id: availabilityId,
      tutorProfileId,
      isActive: true
    }
  });
  if (!existingSlot) {
    throw new Error("Availability Slot not found");
  }
  if (data.dayOfWeek && !validWeeks.includes(data.dayOfWeek)) {
    throw new Error(`DayOfWeek must be one of: ${validWeeks.join(", ")}`);
  }
  const updatedDay = data.dayOfWeek ?? existingSlot.dayOfWeek;
  const parsedStartDate = data.startDate ? new Date(data.startDate) : existingSlot.startDate;
  const parsedEndDate = data.endDate ? new Date(data.endDate) : existingSlot.endDate;
  if (parsedStartDate >= parsedEndDate) {
    throw new Error("Invalid date range");
  }
  if (data.startTime && !timeRegex.test(data.startTime) || data.endTime && !timeRegex.test(data.endTime)) {
    throw new Error("Invalid time format. Use HH:MM (24-hour format)");
  }
  const startTime = data.startTime ? /* @__PURE__ */ new Date(`1970-01-01T${data.startTime}:00`) : existingSlot.startTime;
  const endTime = data.endTime ? /* @__PURE__ */ new Date(`1970-01-01T${data.endTime}:00`) : existingSlot.endTime;
  if (startTime >= endTime) {
    throw new Error("Start time must be before end time");
  }
  const overlappingSlot = await prisma.availabilitySlot.findFirst({
    where: {
      tutorProfileId,
      dayOfWeek: updatedDay,
      isActive: true,
      id: { not: availabilityId },
      // Date overlap
      startDate: { lte: parsedEndDate },
      endDate: { gte: parsedStartDate },
      // Time overlap
      startTime: { lt: endTime },
      endTime: { gt: startTime }
    }
  });
  if (overlappingSlot) {
    throw new Error("Updated slot overlaps with existing availability");
  }
  return await prisma.availabilitySlot.update({
    where: { id: availabilityId },
    data: {
      dayOfWeek: updatedDay,
      startTime,
      endTime,
      startDate: parsedStartDate,
      endDate: parsedEndDate
    }
  });
};
var deleteAvailability = async (slotId) => {
  const result = await prisma.availabilitySlot.delete({
    where: { id: slotId }
  });
  return result;
};
var AvailabilityService = {
  createAvailability,
  getAvailability,
  getAvailibilityByTutorId,
  updateAvailability,
  deleteAvailability
};

// src/modules/availability/availability.controller.ts
var createAvailability2 = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  try {
    const result = await AvailabilityService.createAvailability(
      userId,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "create availability slots created!",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getOwnAvailability = async (req, res, next) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new Error("User not found");
  }
  try {
    const result = await AvailabilityService.getAvailability(userId);
    res.status(200).json({
      success: true,
      message: "Availability Slot Retrived Successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getAvailibilityByTutorId2 = async (req, res, next) => {
  const tutorProfileId = req.params.tutorId;
  try {
    const result = await AvailabilityService.getAvailibilityByTutorId(
      tutorProfileId
    );
    res.status(200).json({
      success: true,
      message: "Availability Slot Retrived Successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var updateAvailability2 = async (req, res, next) => {
  const userId = req.user?.id;
  const slotId = req.params.slotId;
  if (!userId) {
    throw new Error("User Id not found");
  }
  const { dayOfWeek, startTime, endTime, startDate, endDate } = req.body;
  try {
    const result = await AvailabilityService.updateAvailability(
      userId,
      slotId,
      { dayOfWeek, startTime, endTime, startDate, endDate }
    );
    res.status(200).json({
      success: true,
      message: "Availability Slot updated Successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var deleteAvailability2 = async (req, res, next) => {
  const slotId = req.params.slotId;
  try {
    const result = await AvailabilityService.deleteAvailability(
      slotId
    );
    res.status(200).json({
      success: true,
      message: "Availability Slot deleted Successfully!",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var availabilityController = {
  createAvailability: createAvailability2,
  getOwnAvailability,
  getAvailibilityByTutorId: getAvailibilityByTutorId2,
  updateAvailability: updateAvailability2,
  deleteAvailability: deleteAvailability2
};

// src/modules/availability/availability.routes.ts
var availabilityRoutes = Router2();
availabilityRoutes.post(
  "/create",
  auth_default("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  checkBanStatus_default,
  availabilityController.createAvailability
);
availabilityRoutes.get(
  "/me",
  auth_default("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  availabilityController.getOwnAvailability
);
availabilityRoutes.get(
  "/:tutorId",
  availabilityController.getAvailibilityByTutorId
);
availabilityRoutes.patch(
  "/update/:slotId",
  auth_default("ADMIN" /* ADMIN */, "TUTOR" /* TUTOR */),
  availabilityController.updateAvailability
);
availabilityRoutes.delete(
  "/delete/:slotId",
  auth_default("ADMIN" /* ADMIN */, "TUTOR" /* TUTOR */),
  availabilityController.deleteAvailability
);
var availability_routes_default = availabilityRoutes;

// src/modules/booking/booking.routes.ts
import { Router as Router3 } from "express";

// src/modules/booking/booking.service.ts
var createBooking = async (studentId, data) => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!data.sessionDate) {
    throw new Error("Session date is required");
  }
  const sessionDate = /* @__PURE__ */ new Date(`${data.sessionDate}T00:00:00.000`);
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  if (sessionDate < today) {
    throw new Error("Session date cannot be in the past");
  }
  if (!data.startTime || !data.endTime) {
    throw new Error("Start time and end time are required");
  }
  if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
    throw new Error("Invalid time format. Use HH:MM");
  }
  const startTime = /* @__PURE__ */ new Date(`1970-01-01T${data.startTime}:00`);
  const endTime = /* @__PURE__ */ new Date(`1970-01-01T${data.endTime}:00`);
  if (startTime >= endTime) {
    throw new Error("Start time must be before end time");
  }
  if (!data.tutorCategoryId) {
    throw new Error("Tutor category is required");
  }
  return await prisma.$transaction(
    async (tx) => {
      const tutorCategory = await tx.tutorCategory.findUnique({
        where: { id: data.tutorCategoryId },
        include: { tutorProfile: true }
      });
      if (!tutorCategory) {
        throw new Error("Tutor Category not found");
      }
      const tutorProfileId = tutorCategory.tutorProfileId;
      if (tutorCategory.tutorProfile.status !== "APPROVED") {
        throw new Error("Tutor is not approved");
      }
      const dayOfWeek = await sessionDate.toLocaleDateString("en-US", {
        weekday: "short"
      }).toUpperCase();
      const availability = await tx.availabilitySlot.findFirst({
        where: {
          tutorProfileId,
          dayOfWeek,
          isActive: true,
          startDate: { lte: sessionDate },
          endDate: { gte: sessionDate },
          startTime: { lte: startTime },
          endTime: { gte: endTime }
        }
      });
      if (!availability) {
        throw new Error("Selected time is not available");
      }
      const overLappingBooking = await tx.booking.findFirst({
        where: {
          tutorCategoryId: data.tutorCategoryId,
          sessionDate,
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: { lt: endTime },
          endTime: { gt: startTime }
        }
      });
      if (overLappingBooking) {
        throw new Error("This time slot is already booked");
      }
      const durationInMs = endTime.getTime() - startTime.getTime();
      const durationInHours = durationInMs / (1e3 * 60 * 60);
      const totalPrice = Number(
        tutorCategory.hourlyRate * durationInHours
      ).toFixed(2);
      const booking = await tx.booking.create({
        data: {
          studentId,
          tutorCategoryId: data.tutorCategoryId,
          sessionDate,
          startTime,
          endTime,
          price: parseFloat(totalPrice),
          status: "PENDING"
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      return booking;
    },
    {
      timeout: 15e3
    }
  );
};
var mySessions = async (studentId) => {
  return await prisma.booking.findMany({
    where: { studentId },
    include: {
      tutorCategory: {
        include: {
          subject: true,
          tutorProfile: {
            select: {
              id: true,
              userId: true,
              bio: true,
              totalReviews: true,
              averageRating: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });
};
var upCommingSession = async () => {
  const today = /* @__PURE__ */ new Date();
  return await prisma.booking.findMany({
    where: {
      sessionDate: {
        gte: today
      },
      status: "CONFIRMED"
    },
    include: {
      tutorCategory: {
        include: {
          tutorProfile: true,
          subject: true
        }
      }
    }
  });
};
var teachingSession = async (userId, {
  status,
  startDate,
  endDate,
  page,
  limit,
  skip,
  sortBy,
  sortOrder
}) => {
  const andConditions = [];
  if (status) {
    andConditions.push({
      status
    });
  }
  if (startDate || endDate) {
    andConditions.push({
      sessionDate: {
        ...startDate && { gte: new Date(startDate) },
        ...endDate && { lte: new Date(endDate) }
      }
    });
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  const booking = await prisma.booking.findMany({
    take: limit,
    skip,
    where: {
      tutorCategory: {
        tutorProfileId: tutorProfile.id
      },
      AND: andConditions
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      tutorCategory: {
        include: {
          subject: true
        }
      }
    },
    orderBy: {
      [sortBy]: sortOrder
    }
  });
  const total = await prisma.booking.count({
    where: {
      tutorCategory: {
        tutorProfileId: tutorProfile.id
      },
      AND: andConditions
    }
  });
  return {
    data: booking,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getAllBooking = async ({
  status,
  studentId,
  tutorId,
  subjectSlug,
  startDate,
  endDate,
  minPrice,
  maxPrice,
  page,
  limit,
  skip,
  sortBy,
  sortOrder
}) => {
  const andConditions = [];
  if (status) {
    andConditions.push({
      status
    });
  }
  if (studentId) {
    andConditions.push({
      studentId
    });
  }
  if (tutorId) {
    andConditions.push({
      tutorCategory: {
        tutorProfileId: tutorId
      }
    });
  }
  if (subjectSlug) {
    andConditions.push({
      tutorCategory: {
        subject: {
          slug: subjectSlug
        }
      }
    });
  }
  if (startDate || endDate) {
    andConditions.push({
      sessionDate: {
        ...startDate && { gte: new Date(startDate) },
        ...endDate && { lte: new Date(endDate) }
      }
    });
  }
  if (minPrice || maxPrice) {
    andConditions.push({
      price: {
        gte: minPrice ?? 0,
        lte: maxPrice ?? 999999
      }
    });
  }
  const booking = await prisma.booking.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    include: {
      student: true,
      tutorCategory: {
        include: {
          subject: true,
          tutorProfile: {
            include: {
              user: true
            }
          }
        }
      }
    }
  });
  const total = await prisma.booking.count({
    where: {
      AND: andConditions
    }
  });
  return {
    data: booking,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var bookingStatus = async (bookingId, data) => {
  const validStatus = Object.values(BookingStatus);
  if (!validStatus.includes(data.status)) {
    throw new Error(
      `Invalid status. Status must be one of: ${validStatus.join(", ")}`
    );
  }
  const updateData = { status: data.status };
  if (data.meetingLink !== void 0) {
    updateData.meetingLink = data.meetingLink;
  }
  return await prisma.booking.update({
    where: { id: bookingId },
    data: updateData
  });
};
var BookingService = {
  createBooking,
  mySessions,
  upCommingSession,
  teachingSession,
  getAllBooking,
  bookingStatus
};

// src/modules/booking/booking.controller.ts
var createBooking2 = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  const studentId = user?.id;
  try {
    const result = await BookingService.createBooking(studentId, req.body);
    res.status(200).json({
      success: true,
      message: "Booking created successfully",
      data: result
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
var mySessions2 = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  const studentId = user?.id;
  try {
    const result = await BookingService.mySessions(studentId);
    res.status(200).json({
      success: true,
      message: "My Sessions are retrived successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var upcomingSession = async (req, res, next) => {
  try {
    const result = await BookingService.upCommingSession();
    res.status(200).json({
      success: true,
      message: "Upcoming Sessions are retrived successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var teachingSession2 = async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  const userId = user?.id;
  try {
    const { status, startDate, endDate } = req.query;
    const bookingStatus3 = status;
    const startDateQuery = startDate;
    const endDateQuery = endDate;
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper_default(req.query);
    const result = await BookingService.teachingSession(userId, {
      status: bookingStatus3,
      startDate: startDateQuery,
      endDate: endDateQuery,
      page,
      limit,
      skip,
      sortBy,
      sortOrder
    });
    res.status(200).json({
      success: true,
      message: "Teaching Sessions retrived successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getAllBooking2 = async (req, res, next) => {
  try {
    const {
      status,
      studentId,
      tutorId,
      subject,
      startDate,
      endDate,
      minPrice,
      maxPrice
    } = req.query;
    const bookingStatus3 = status;
    const studentIdQuery = studentId;
    const tutorIdQuery = tutorId;
    const subjectQuery = subject;
    const startDateQuery = startDate;
    const endDateQuery = endDate;
    const minPriceQuery = minPrice ? parseFloat(minPrice) : void 0;
    const maxPriceQuery = maxPrice ? parseFloat(maxPrice) : void 0;
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper_default(req.query);
    const result = await BookingService.getAllBooking({
      status: bookingStatus3,
      studentId: studentIdQuery,
      tutorId: tutorIdQuery,
      subjectSlug: subjectQuery,
      startDate: startDateQuery,
      endDate: endDateQuery,
      minPrice: minPriceQuery,
      maxPrice: maxPriceQuery,
      page,
      limit,
      skip,
      sortBy,
      sortOrder
    });
    res.status(200).json({
      success: true,
      message: "All booking retrived successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var bookingStatus2 = async (req, res, next) => {
  const { id } = req.params;
  const { status, meetingLink } = req.body;
  try {
    const result = await BookingService.bookingStatus(id, {
      status,
      meetingLink
    });
    res.status(200).json({
      success: true,
      message: "Booking Status Updated Successfully!",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var bookingController = {
  createBooking: createBooking2,
  mySessions: mySessions2,
  upcomingSession,
  teachingSession: teachingSession2,
  getAllBooking: getAllBooking2,
  bookingStatus: bookingStatus2
};

// src/modules/booking/booking.routes.ts
var bookingRoutes = Router3();
bookingRoutes.post(
  "/create",
  auth_default("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  checkBanStatus_default,
  bookingController.createBooking
);
bookingRoutes.get(
  "/my-sessions",
  auth_default("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  bookingController.mySessions
);
bookingRoutes.get("/upcoming", bookingController.upcomingSession);
bookingRoutes.get(
  "/teaching",
  auth_default("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  bookingController.teachingSession
);
bookingRoutes.get(
  "/getAllBooking",
  auth_default("ADMIN" /* ADMIN */),
  bookingController.getAllBooking
);
bookingRoutes.patch(
  "/:id/status",
  auth_default("ADMIN" /* ADMIN */, "TUTOR" /* TUTOR */),
  bookingController.bookingStatus
);
var booking_routes_default = bookingRoutes;

// src/modules/review/review.routes.ts
import { Router as Router4 } from "express";

// src/modules/review/review.service.ts
var createReview = async (studentId, reviewData) => {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: reviewData.bookingId },
      include: {
        tutorCategory: {
          include: { tutorProfile: true }
        }
      }
    });
    if (!booking) {
      throw new Error("Booking not found");
    }
    if (booking?.studentId !== studentId) {
      throw new Error("You are not allowed to review this booking");
    }
    if (booking.status !== "COMPLETED") {
      throw new Error("You can only review completed sessions");
    }
    const tutorProfileId = booking.tutorCategory.tutorProfileId;
    const review = await tx.review.create({
      data: {
        bookingId: reviewData.bookingId,
        studentId,
        tutorProfileId,
        rating: reviewData.rating,
        comment: reviewData.comment
      }
    });
    const stats = await tx.review.aggregate({
      where: { tutorProfileId },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    });
    await tx.tutorProfile.update({
      where: { id: tutorProfileId },
      data: {
        totalReviews: stats._count.rating,
        averageRating: stats._avg.rating ?? 0
      }
    });
    const reviewWithRelations = await tx.review.findUnique({
      where: { id: review.id },
      include: {
        student: {
          select: {
            id: true,
            name: true
          }
        },
        tutorProfile: true,
        booking: true
      }
    });
    return reviewWithRelations;
  });
};
var getTutorReviews = async (tutorProfileId) => {
  return await prisma.review.findMany({
    where: { tutorProfileId },
    include: {
      student: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};
var getMyReviews = async (studentId) => {
  return prisma.review.findMany({
    where: { studentId },
    include: {
      tutorProfile: true,
      booking: true
    }
  });
};
var reviewService = {
  createReview,
  getTutorReviews,
  getMyReviews
};

// src/modules/review/review.controller.ts
var createReview2 = async (req, res, next) => {
  const { bookingId, rating, comment } = req.body;
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
  const studentId = user?.id;
  try {
    const result = await reviewService.createReview(studentId, {
      bookingId,
      rating,
      comment
    });
    res.status(200).json({
      success: true,
      message: "Review Created Successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getReviewsByTutorProfileId = async (req, res, next) => {
  try {
    const { tutorProfileId } = req.params;
    if (!tutorProfileId) {
      return res.status(400).json({
        success: false,
        message: "Tutor Profile ID is required"
      });
    }
    const result = await reviewService.getTutorReviews(
      tutorProfileId
    );
    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getMyReviews2 = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const studentId = user?.id;
    const result = await reviewService.getMyReviews(studentId);
    res.status(200).json({
      success: true,
      message: "My reviews retrived successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var reviewController = {
  createReview: createReview2,
  getReviewsByTutorProfileId,
  getMyReviews: getMyReviews2
};

// src/modules/review/review.routes.ts
var reviewRoutes = Router4();
reviewRoutes.post(
  "/create",
  auth_default("STUDENT" /* STUDENT */, "ADMIN" /* ADMIN */),
  checkBanStatus_default,
  reviewController.createReview
);
reviewRoutes.get(
  "/my",
  auth_default("STUDENT" /* STUDENT */, "ADMIN" /* ADMIN */),
  reviewController.getMyReviews
);
reviewRoutes.get(
  "/:tutorProfileId",
  reviewController.getReviewsByTutorProfileId
);
var review_routes_default = reviewRoutes;

// src/modules/subject/subject.routes.ts
import { Router as Router5 } from "express";

// src/modules/subject/subject.service.ts
var createSubject = async (subject) => {
  const subjectSlug = subject.toLowerCase().replace(/\s+/g, "-");
  return await prisma.subject.create({
    data: {
      name: subject,
      slug: subjectSlug
    }
  });
};
var getAllSubjects = async () => {
  return await prisma.subject.findMany();
};
var updateSubject = async (id, subject) => {
  const subjectSlug = subject.toLowerCase().replace(/\s+/g, "-");
  return await prisma.subject.update({
    where: {
      id
    },
    data: {
      name: subject,
      slug: subjectSlug
    }
  });
};
var deleteSubject = async (id) => {
  return await prisma.subject.delete({
    where: { id }
  });
};
var SubjectService = {
  createSubject,
  getAllSubjects,
  updateSubject,
  deleteSubject
};

// src/modules/subject/subject.controller.ts
var createSubject2 = async (req, res, next) => {
  try {
    const { subject } = req.body;
    const result = await SubjectService.createSubject(subject);
    res.status(200).json({
      success: true,
      message: "Subject Created Successfully!",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getAllSubjects2 = async (req, res, next) => {
  try {
    const result = await SubjectService.getAllSubjects();
    res.status(200).json({
      success: true,
      message: "Subjects Retrived Successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var updateSubject2 = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { subject } = req.body;
    if (!subject) {
      throw new Error("Subject field must be required");
    }
    const result = await SubjectService.updateSubject(
      id,
      subject
    );
    res.status(200).json({
      success: true,
      message: "Subject Updated Successfully",
      data: result
    });
  } catch (error) {
    if (error instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(
          `Subject with ID '${id}' not found. Cannot update non-existent record.`
        );
      }
    }
    next(error);
  }
};
var deleteSubject2 = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await SubjectService.deleteSubject(id);
    res.status(200).json({
      success: true,
      message: "Subject deleted Successfully!",
      data: result
    });
  } catch (error) {
    if (error instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new Error(
          `Subject with ID '${id}' not found. Cannot delete non-existent record.`
        );
      }
    }
    next(error);
  }
};
var SubjectController = {
  createSubject: createSubject2,
  getAllSubjects: getAllSubjects2,
  updateSubject: updateSubject2,
  deleteSubject: deleteSubject2
};

// src/modules/subject/subject.routes.ts
var subjectRoutes = Router5();
subjectRoutes.post(
  "/create",
  auth_default("ADMIN" /* ADMIN */),
  SubjectController.createSubject
);
subjectRoutes.get("/getAllSubjects", SubjectController.getAllSubjects);
subjectRoutes.patch(
  "/update/:id",
  auth_default("ADMIN" /* ADMIN */),
  SubjectController.updateSubject
);
subjectRoutes.delete(
  "/delete/:id",
  auth_default("ADMIN" /* ADMIN */),
  SubjectController.deleteSubject
);
var subject_routes_default = subjectRoutes;

// src/modules/tutor/tutor.routes.ts
import { Router as Router6 } from "express";

// src/modules/tutor/tutor.service.ts
var createTutorProfile = async (data, userId) => {
  const profile = await prisma.tutorProfile.create({
    data: {
      ...data,
      userId,
      status: "PENDING"
    },
    include: {
      user: true
    }
  });
  return profile;
};
var createTeachingSession = async (userId, data) => {
  const validLevels = Object.values(TutorLevel);
  if (!validLevels.includes(data.level)) {
    const error = new Error(
      `Level must be one of: ${validLevels.join(", ")}`
    );
    throw error;
  }
  const slug = data.subjectName.toLowerCase().trim().replace(/\s+/g, "-");
  return await prisma.$transaction(async (tx) => {
    const subject = await tx.subject.upsert({
      where: { slug },
      update: {},
      create: {
        name: data.subjectName,
        slug
      }
    });
    const getTutorProfile = await tx.tutorProfile.findUnique({
      where: {
        userId
      }
    });
    if (!getTutorProfile) {
      throw new Error("Tutor profile not found for the user");
    }
    const TutorCategory = await tx.tutorCategory.create({
      data: {
        tutorProfileId: getTutorProfile.id,
        subjectId: subject.id,
        hourlyRate: data.hourlyRate,
        experienceYears: data.experienceYears,
        level: data.level,
        description: data.bio || "",
        isPrimary: data.isPrimary || false
      },
      include: {
        subject: true,
        tutorProfile: {
          include: {
            user: true
          }
        }
      }
    });
    return TutorCategory;
  });
};
var getTeachingSession = async (userId) => {
  const tutorid = await prisma.tutorProfile.findUnique({
    where: {
      userId
    }
  });
  if (!tutorid) {
    throw new Error("Tutor profile not found for the user");
  }
  const result = await prisma.tutorCategory.findMany({
    where: {
      tutorProfileId: tutorid?.id
    },
    include: {
      subject: true
    }
  });
  return result;
};
var getAllTutors = async ({
  search,
  subjectSlug,
  minPrice,
  maxPrice,
  minRating,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
  status,
  role,
  isVerified
}) => {
  const andConditions = [];
  if (role === "ADMIN") {
    if (status) {
      andConditions.push({
        status
      });
    }
    if (typeof isVerified === "boolean") {
      andConditions.push({
        isVerified
      });
    }
  } else {
    andConditions.push({
      status: "APPROVED",
      isVerified: true
    });
  }
  if (search) {
    andConditions.push({
      OR: [
        {
          bio: {
            contains: search,
            mode: "insensitive"
          }
        },
        {
          user: {
            name: {
              contains: search,
              mode: "insensitive"
            }
          }
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive"
            }
          }
        }
      ]
    });
  }
  if (subjectSlug) {
    andConditions.push({
      tutorCategories: {
        some: {
          subject: {
            slug: subjectSlug
          }
        }
      }
    });
  }
  if (minPrice || maxPrice) {
    andConditions.push({
      tutorCategories: {
        some: {
          hourlyRate: {
            gte: minPrice ?? 0,
            lte: maxPrice ?? 999999
          }
        }
      }
    });
  }
  if (minRating) {
    andConditions.push({
      averageRating: {
        gte: minRating
      }
    });
  }
  const tutors = await prisma.tutorProfile.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    include: {
      user: true,
      tutorCategories: {
        include: {
          subject: true
        }
      }
    }
  });
  const total = await prisma.tutorProfile.count({
    where: {
      AND: andConditions
    }
  });
  return {
    data: tutors,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var approveTutorProfile = async (status, tutorProfileId, adminId) => {
  const updatedProfile = await prisma.$transaction(async (tx) => {
    const profile = await tx.tutorProfile.update({
      where: { id: tutorProfileId },
      data: {
        status,
        isVerified: status === "APPROVED"
      },
      include: {
        user: true
      }
    });
    if (status === "APPROVED" && profile.user.role !== "ADMIN") {
      await tx.user.update({
        where: { id: profile.userId },
        data: {
          role: "TUTOR"
        }
      });
    }
    await tx.adminLog.create({
      data: {
        adminId,
        action: "APPROVE_TUTOR",
        targetId: tutorProfileId
      }
    });
    if (status === "APPROVED" && profile.user.role !== "ADMIN") {
      profile.user.role = "TUTOR";
    }
    return profile;
  });
  return updatedProfile;
};
var getTutorProfileByUserId = async (userId) => {
  const profile = await prisma.tutorProfile.findUnique({
    where: { userId },
    include: {
      tutorCategories: {
        include: {
          subject: true
        }
      },
      user: true
    }
  });
  return profile;
};
var getTutorProfileById = async (id) => {
  return prisma.tutorProfile.findUnique({
    where: { id },
    include: {
      tutorCategories: {
        include: {
          subject: true
        }
      },
      reviews: {
        include: {
          student: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });
};
var updateTutorProfile = async (tutorProfileId, bio) => {
  const updatedProfile = await prisma.tutorProfile.update({
    where: { id: tutorProfileId },
    data: {
      ...bio !== void 0 && { bio }
    }
  });
  return updatedProfile;
};
var updateTeachingSession = async (tutorSessionId, data) => {
  return await prisma.tutorCategory.update({
    where: { id: tutorSessionId },
    data: {
      ...data.hourlyRate !== void 0 && {
        hourlyRate: data.hourlyRate
      },
      ...data.experienceYears !== void 0 && {
        experienceYears: data.experienceYears
      },
      ...data.level !== void 0 && { level: data.level },
      ...data.description !== void 0 && {
        description: data.description
      },
      ...data.isPrimary !== void 0 && { isPrimary: data.isPrimary }
    },
    include: {
      subject: true,
      tutorProfile: {
        include: {
          user: true
        }
      }
    }
  });
};
var deleteTeachingSession = async (tutorSessionId) => {
  return await prisma.tutorCategory.delete({
    where: { id: tutorSessionId }
  });
};
var TutorService = {
  createTutorProfile,
  createTeachingSession,
  approveTutorProfile,
  getAllTutors,
  getTutorProfileByUserId,
  getTutorProfileById,
  getTeachingSession,
  updateTutorProfile,
  updateTeachingSession,
  deleteTeachingSession
};

// src/modules/tutor/tutor.controller.ts
var getAllTutors2 = async (req, res) => {
  try {
    const { search, subject, minPrice, maxPrice, minRating } = req.query;
    const searchString = typeof search === "string" ? search : void 0;
    const status = req.query.status || void 0;
    const isVerified = req.query.isVerified === "true" ? true : req.query.isVerified === "false" ? false : void 0;
    const role = req.user?.role;
    const subjectSlug = typeof subject === "string" ? subject : void 0;
    const minPriceNumber = minPrice ? Number(minPrice) : void 0;
    const maxPriceNumber = maxPrice ? Number(maxPrice) : void 0;
    const minRatingNumber = minRating ? Number(minRating) : void 0;
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper_default(req.query);
    const result = await TutorService.getAllTutors({
      search: searchString,
      subjectSlug,
      minPrice: minPriceNumber,
      maxPrice: maxPriceNumber,
      minRating: minRatingNumber,
      limit,
      page,
      skip,
      sortBy,
      sortOrder,
      status,
      role,
      isVerified
    });
    return res.status(200).json({
      success: true,
      message: "All tutors retrieved successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tutors"
    });
    console.error(error);
  }
};
var getTutorProfileByUserId2 = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({
      error: "Unauthorized"
    });
  }
  try {
    const profile = await TutorService.getTutorProfileByUserId(user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found."
      });
    }
    if (profile.status === "PENDING" && !profile.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Your tutor profile is pending verification."
      });
    }
    if (profile.status === "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Your tutor profile application has been rejected. Please review your profile and reapply."
      });
    }
    return res.status(200).json({
      success: true,
      message: "Tutor profile retrieved successfully",
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tutor profile"
    });
    console.error(error);
  }
};
var getTutorProfileById2 = async (req, res) => {
  const { tutorProfileId } = req.params;
  try {
    const profile = await TutorService.getTutorProfileById(
      tutorProfileId
    );
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found"
      });
    }
    if (profile.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Tutor profile is not publicly available"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Tutor profile retrieved successfully",
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tutor profile"
    });
  }
};
var getTeachingSession2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const result = await TutorService.getTeachingSession(userId);
    return res.status(200).json({
      success: true,
      message: "Teaching session retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var createTutorProfile2 = async (req, res, next) => {
  const user = req.user;
  try {
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized"
      });
    }
    const result = await TutorService.createTutorProfile(
      { bio: req.body.bio },
      user.id
      // {
      //     subjectName: req.body.subjectName,
      //     hourlyRate: req.body.hourlyRate,
      //     experienceYears: req.body.experienceYears,
      //     level: req.body.level,
      // },
    );
    return res.status(200).json({
      success: true,
      message: "Tutor profile created successfully. You will get email once your profile is verified.",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var createTeachingSession2 = async (req, res, next) => {
  try {
    const {
      subjectName,
      hourlyRate,
      experienceYears,
      level,
      bio,
      isPrimary
    } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized"
      });
    }
    const result = await TutorService.createTeachingSession(user.id, {
      subjectName,
      hourlyRate,
      experienceYears,
      level,
      bio,
      isPrimary
    });
    res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var approveTutorProfile2 = async (req, res) => {
  const { tutorProfileId, status } = req.body;
  const profileStatus = status.toUpperCase();
  const adminId = req.user;
  if (!adminId) {
    return res.status(400).json({
      error: "Unauthorized"
    });
  }
  try {
    const updatedProfile = await TutorService.approveTutorProfile(
      status.toUpperCase(),
      tutorProfileId,
      adminId.id
    );
    console.log(updatedProfile.status);
    let subject = "";
    let html = "";
    if (profileStatus === "APPROVED") {
      subject = "Your Tutor Profile Has Been Approved \u{1F389}";
      html = `
                <h1>Hello, ${updatedProfile.user.name}!</h1>
                <p>Congratulations! Your tutor profile has been <b>approved</b>.</p>
                <p>You can now start receiving bookings from students.</p>
                <br />
                <a href="${process.env.FRONTEND_URL}/dashboard">
                Go to Dashboard
                </a>
            `;
    }
    if (profileStatus === "REJECTED") {
      subject = "Your Tutor Profile Application Status";
      html = `
                <h1>Hello, ${updatedProfile.user.name}!</h1>
                <p>We regret to inform you that your tutor profile has been <b>rejected</b>.</p>
                <p>Please review your profile information and reapply.</p>
                <br />
                <a href="${process.env.FRONTEND_URL}/support">
                Contact Support
                </a>
            `;
    }
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: updatedProfile.user.email,
      subject,
      html
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email failed to send:", error);
      } else {
        console.log("Approval email sent: ", info.response);
      }
    });
    res.status(200).json({
      message: `Tutor ${status.toLowerCase()} successfully and notification email sent.`,
      data: updatedProfile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to approve tutor"
    });
  }
};
var updateTutorProfile2 = async (req, res, next) => {
  try {
    const { bio, tutorProfileId } = req.body;
    const updatedProfile = await TutorService.updateTutorProfile(
      tutorProfileId,
      bio
    );
    res.status(200).json({
      success: true,
      message: "Tutor profile updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};
var updateTeachingSession2 = async (req, res, next) => {
  const { tutorSessionId } = req.params;
  try {
    const { hourlyRate, experienceYears, level, description, isPrimary } = req.body;
    if (!tutorSessionId) {
      return res.status(400).json({
        success: false,
        message: "Tutor session ID is required"
      });
    }
    const updatedSession = await TutorService.updateTeachingSession(
      tutorSessionId,
      {
        hourlyRate: hourlyRate ? Number(hourlyRate) : void 0,
        experienceYears: experienceYears ? Number(experienceYears) : void 0,
        level,
        description,
        isPrimary
      }
    );
    res.status(200).json({
      success: true,
      message: "Teaching session updated successfully",
      data: updatedSession
    });
  } catch (error) {
    next(error);
  }
};
var deleteTeachingSession2 = async (req, res) => {
  try {
    const { tutorSessionId } = req.params;
    if (!tutorSessionId) {
      return res.status(400).json({
        success: false,
        message: "Tutor session ID is required"
      });
    }
    await TutorService.deleteTeachingSession(tutorSessionId);
    res.status(200).json({
      success: true,
      message: "Teaching session deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete teaching session"
    });
  }
};
var TutorController = {
  createTutorProfile: createTutorProfile2,
  createTeachingSession: createTeachingSession2,
  getAllTutors: getAllTutors2,
  getTutorProfileById: getTutorProfileById2,
  approveTutorProfile: approveTutorProfile2,
  getTutorProfileByUserId: getTutorProfileByUserId2,
  getTeachingSession: getTeachingSession2,
  updateTutorProfile: updateTutorProfile2,
  updateTeachingSession: updateTeachingSession2,
  deleteTeachingSession: deleteTeachingSession2
};

// src/modules/tutor/tutor.routes.ts
var tutorRoutes = Router6();
tutorRoutes.get("/getAllTutors", TutorController.getAllTutors);
tutorRoutes.get(
  "/getAllTutors/admin",
  auth_default("ADMIN" /* ADMIN */),
  TutorController.getAllTutors
);
tutorRoutes.get(
  "/getMyProfile",
  auth_default("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  TutorController.getTutorProfileByUserId
);
tutorRoutes.get(
  "/getTeachingSession",
  auth_default("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  TutorController.getTeachingSession
);
tutorRoutes.get("/:tutorProfileId", TutorController.getTutorProfileById);
tutorRoutes.post(
  "/create",
  auth_default("ADMIN" /* ADMIN */, "STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  checkBanStatus_default,
  TutorController.createTutorProfile
);
tutorRoutes.post(
  "/createTeachingSession",
  auth_default("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  checkBanStatus_default,
  TutorController.createTeachingSession
);
tutorRoutes.patch(
  "/approve",
  auth_default("ADMIN" /* ADMIN */),
  TutorController.approveTutorProfile
);
tutorRoutes.put(
  "/updateTutorProfile",
  auth_default("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  TutorController.updateTutorProfile
);
tutorRoutes.put(
  "/updateTeachingSession/:tutorSessionId",
  auth_default("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  checkBanStatus_default,
  TutorController.updateTeachingSession
);
tutorRoutes.delete(
  "/deleteTeachingSession/:tutorSessionId",
  auth_default("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  TutorController.deleteTeachingSession
);
var tutor_routes_default = tutorRoutes;

// src/routes/index.ts
var routes = Router7();
var moduleRoutes = [
  {
    path: "/tutor",
    route: tutor_routes_default
  },
  {
    path: "/availability",
    route: availability_routes_default
  },
  {
    path: "/booking",
    route: booking_routes_default
  },
  {
    path: "/subject",
    route: subject_routes_default
  },
  {
    path: "/review",
    route: review_routes_default
  },
  {
    path: "/admin",
    route: admin_routes_default
  }
];
moduleRoutes.forEach((route) => routes.use(route.path, route.route));
var routes_default = routes;

// src/app.ts
var app = express();
var allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL
  // Production frontend URL
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/v1", routes_default);
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use(notFound);
app.use(globalErrorHandler_default);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
