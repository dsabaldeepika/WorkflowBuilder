import { users, type User, type InsertUser, type Workflow, type InsertWorkflow } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workflow methods
  getWorkflow(id: number): Promise<Workflow | undefined>;
  getWorkflowsByUserId(userId: number): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: InsertWorkflow): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workflows: Map<number, Workflow>;
  private userIdCounter: number;
  private workflowIdCounter: number;

  constructor() {
    this.users = new Map();
    this.workflows = new Map();
    this.userIdCounter = 1;
    this.workflowIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Workflow methods
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async getWorkflowsByUserId(userId: number): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(
      (workflow) => workflow.userId === userId
    );
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.workflowIdCounter++;
    const workflow: Workflow = { ...insertWorkflow, id };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id: number, insertWorkflow: InsertWorkflow): Promise<Workflow | undefined> {
    const existingWorkflow = this.workflows.get(id);
    
    if (!existingWorkflow) {
      return undefined;
    }
    
    const updatedWorkflow: Workflow = {
      ...existingWorkflow,
      ...insertWorkflow,
      id
    };
    
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: number): Promise<void> {
    this.workflows.delete(id);
  }
}

export const storage = new MemStorage();
