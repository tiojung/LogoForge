import {
  users,
  logoProjects,
  logoAssets,
  creditTransactions,
  type User,
  type UpsertUser,
  type LogoProject,
  type InsertLogoProject,
  type LogoAsset,
  type InsertLogoAsset,
  type CreditTransaction,
  type InsertCreditTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sum } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserCredits(userId: string, credits: number): Promise<User>;

  // Logo project operations
  createLogoProject(project: InsertLogoProject): Promise<LogoProject>;
  getLogoProject(id: string): Promise<LogoProject | undefined>;
  getUserLogoProjects(userId: string): Promise<LogoProject[]>;
  updateLogoProject(id: string, updates: Partial<InsertLogoProject>): Promise<LogoProject>;

  // Logo asset operations
  createLogoAsset(asset: InsertLogoAsset): Promise<LogoAsset>;
  getLogoAsset(id: string): Promise<LogoAsset | undefined>;
  getProjectAssets(projectId: string): Promise<LogoAsset[]>;

  // Credit transaction operations
  createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction>;
  getUserCreditTransactions(userId: string): Promise<CreditTransaction[]>;
  getUserCreditBalance(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserCredits(userId: string, credits: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ credits, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Logo project operations
  async createLogoProject(project: InsertLogoProject): Promise<LogoProject> {
    const [newProject] = await db
      .insert(logoProjects)
      .values(project)
      .returning();
    return newProject;
  }

  async getLogoProject(id: string): Promise<LogoProject | undefined> {
    const [project] = await db
      .select()
      .from(logoProjects)
      .where(eq(logoProjects.id, id));
    return project;
  }

  async getUserLogoProjects(userId: string): Promise<LogoProject[]> {
    return await db
      .select()
      .from(logoProjects)
      .where(eq(logoProjects.userId, userId))
      .orderBy(desc(logoProjects.updatedAt));
  }

  async updateLogoProject(id: string, updates: Partial<InsertLogoProject>): Promise<LogoProject> {
    const [project] = await db
      .update(logoProjects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(logoProjects.id, id))
      .returning();
    return project;
  }

  // Logo asset operations
  async createLogoAsset(asset: InsertLogoAsset): Promise<LogoAsset> {
    const [newAsset] = await db
      .insert(logoAssets)
      .values(asset)
      .returning();
    return newAsset;
  }

  async getLogoAsset(id: string): Promise<LogoAsset | undefined> {
    const [asset] = await db
      .select()
      .from(logoAssets)
      .where(eq(logoAssets.id, id));
    return asset;
  }

  async getProjectAssets(projectId: string): Promise<LogoAsset[]> {
    return await db
      .select()
      .from(logoAssets)
      .where(eq(logoAssets.projectId, projectId))
      .orderBy(desc(logoAssets.createdAt));
  }

  // Credit transaction operations
  async createCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction> {
    const [newTransaction] = await db
      .insert(creditTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserCreditTransactions(userId: string): Promise<CreditTransaction[]> {
    return await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt));
  }

  async getUserCreditBalance(userId: string): Promise<number> {
    const result = await db
      .select({ total: sum(creditTransactions.amount) })
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId));
    
    return Number(result[0]?.total || 0);
  }
}

export const storage = new DatabaseStorage();
