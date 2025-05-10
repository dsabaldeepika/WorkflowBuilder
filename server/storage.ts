import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  workflows, 
  workspaces, 
  workspaceMembers,
  workflowPermissions,
  userOauth,
  oauthProviders,
  testUserFlags,
  invitations,
  workflowRuns,
  UserRole,
  WorkspacePermission,
  type User, 
  type InsertUser, 
  type Workflow, 
  type InsertWorkflow,
  type Workspace,
  type InsertWorkspace,
  type WorkspaceMember,
  type OAuthProvider,
  type WorkflowRun,
  type Invitation,
  type TestUserFlag
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deactivateUser(id: number): Promise<boolean>;
  // Replit Auth user method
  upsertUser(user: { id: string, email: string | null, firstName: string | null, lastName: string | null, profileImageUrl: string | null }): Promise<User>;
  
  // Test user methods
  createTestUser(username: string, email: string): Promise<{user: User, testFlag: TestUserFlag}>;
  getTestUserByToken(token: string): Promise<{user: User, testFlag: TestUserFlag} | undefined>;
  
  // OAuth methods
  getOAuthProviders(): Promise<OAuthProvider[]>;
  getOAuthProviderByName(name: string): Promise<OAuthProvider | undefined>;
  linkUserToOAuthProvider(
    userId: number, 
    providerId: number, 
    providerUserId: string, 
    accessToken: string, 
    refreshToken?: string,
    expiry?: Date
  ): Promise<boolean>;
  
  // Invitation methods
  createInvitation(
    email: string, 
    role: string, 
    token: string, 
    invitedByUserId: number,
    expiresAt: Date
  ): Promise<Invitation>;
  getInvitationByToken(token: string): Promise<Invitation | undefined>;
  acceptInvitation(token: string): Promise<boolean>;
  
  // Workspace methods
  getWorkspace(id: number): Promise<Workspace | undefined>;
  getWorkspacesByUser(userId: number): Promise<Workspace[]>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  updateWorkspace(id: number, workspaceData: Partial<InsertWorkspace>): Promise<Workspace | undefined>;
  deleteWorkspace(id: number): Promise<boolean>;
  
  // Workspace membership methods
  addUserToWorkspace(
    workspaceId: number,
    userId: number,
    permission: WorkspacePermission,
    addedByUserId: number
  ): Promise<WorkspaceMember>;
  updateWorkspaceMemberPermission(
    workspaceId: number,
    userId: number,
    permission: WorkspacePermission
  ): Promise<boolean>;
  removeUserFromWorkspace(workspaceId: number, userId: number): Promise<boolean>;
  getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]>;
  
  // Workflow methods
  getWorkflow(id: number): Promise<Workflow | undefined>;
  getWorkflowsByWorkspace(workspaceId: number): Promise<Workflow[]>;
  getWorkflowsByCreator(userId: number): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflowData: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
  
  // Workflow permission methods
  grantWorkflowPermission(
    workflowId: number,
    userId: number,
    permission: string,
    grantedByUserId: number
  ): Promise<boolean>;
  removeWorkflowPermission(workflowId: number, userId: number): Promise<boolean>;
  
  // Workflow execution methods
  recordWorkflowRun(
    workflowId: number,
    startedByUserId: number | null,
    status: string,
    startTime: Date
  ): Promise<WorkflowRun>;
  completeWorkflowRun(
    runId: number,
    status: string,
    endTime: Date,
    errorMessage?: string,
    errorCategory?: string
  ): Promise<WorkflowRun | undefined>;
  getWorkflowRuns(workflowId: number, limit?: number): Promise<WorkflowRun[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string | number): Promise<User | undefined> {
    try {
      // If id is a string but can be converted to a number, convert it
      const userId = typeof id === 'string' && !isNaN(parseInt(id)) ? parseInt(id) : id;
      const [user] = await db.select().from(users).where(eq(users.id, userId as number));
      return user;
    } catch (error) {
      console.error("Error in getUser:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }
  
  // Replit Auth user method
  async upsertUser(userData: { id: string, email: string | null, firstName: string | null, lastName: string | null, profileImageUrl: string | null }): Promise<User> {
    // Generate a username from the ID if no email is provided
    const username = userData.email ? userData.email.split('@')[0] : `user${userData.id}`;
    const email = userData.email || `${username}@pumpflux.temp`;
    
    // Check if user exists by Replit ID (stored in username field)
    const existingUser = await this.getUserByUsername(userData.id);
    
    if (existingUser) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          email: userData.email || existingUser.email,
          updatedAt: new Date()
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      
      return updatedUser;
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          username: userData.id, // Store Replit ID as username for lookup
          email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          role: UserRole.CREATOR
        })
        .returning();
      
      return newUser;
    }
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deactivateUser(id: number): Promise<boolean> {
    const [result] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return !!result;
  }
  
  // Test user methods
  async createTestUser(username: string, email: string): Promise<{user: User, testFlag: TestUserFlag}> {
    // Generate a random token for the test user
    const testToken = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    
    // Create user
    const [user] = await db
      .insert(users)
      .values({
        username,
        email,
        role: UserRole.ADMIN, // Test user gets admin access
        firstName: 'Test',
        lastName: 'User'
      })
      .returning();
    
    // Add test flag
    const [testFlag] = await db
      .insert(testUserFlags)
      .values({
        userId: user.id,
        isTestUser: true,
        testUserToken: testToken
      })
      .returning();
    
    return { user, testFlag };
  }
  
  async getTestUserByToken(token: string): Promise<{user: User, testFlag: TestUserFlag} | undefined> {
    const [testFlag] = await db
      .select()
      .from(testUserFlags)
      .where(eq(testUserFlags.testUserToken, token));
    
    if (!testFlag) return undefined;
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, testFlag.userId));
    
    if (!user) return undefined;
    
    return { user, testFlag };
  }
  
  // OAuth methods
  async getOAuthProviders(): Promise<OAuthProvider[]> {
    return db.select().from(oauthProviders);
  }
  
  async getOAuthProviderByName(name: string): Promise<OAuthProvider | undefined> {
    const [provider] = await db
      .select()
      .from(oauthProviders)
      .where(eq(oauthProviders.name, name));
    return provider;
  }

  async createOAuthProvider(provider: { name: string, displayName: string, enabled: boolean }): Promise<OAuthProvider> {
    const [newProvider] = await db
      .insert(oauthProviders)
      .values({
        name: provider.name,
        displayName: provider.displayName,
        enabled: provider.enabled
      })
      .returning();
    
    return newProvider;
  }
  
  async updateOAuthProvider(id: number, data: Partial<{ name: string, displayName: string, enabled: boolean }>): Promise<OAuthProvider | undefined> {
    const [updatedProvider] = await db
      .update(oauthProviders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(oauthProviders.id, id))
      .returning();
    
    return updatedProvider;
  }
  
  async linkUserToOAuthProvider(
    userId: number,
    providerId: number,
    providerUserId: string,
    accessToken: string,
    refreshToken?: string,
    expiry?: Date
  ): Promise<boolean> {
    // Check if link already exists
    const [existingLink] = await db
      .select()
      .from(userOauth)
      .where(
        and(
          eq(userOauth.userId, userId),
          eq(userOauth.providerId, providerId)
        )
      );
    
    if (existingLink) {
      // Update existing link
      const [result] = await db
        .update(userOauth)
        .set({
          providerUserId,
          accessToken,
          refreshToken,
          tokenExpiry: expiry,
          updatedAt: new Date()
        })
        .where(eq(userOauth.id, existingLink.id))
        .returning({ id: userOauth.id });
      
      return !!result;
    } else {
      // Create new link
      const [result] = await db
        .insert(userOauth)
        .values({
          userId,
          providerId,
          providerUserId,
          accessToken,
          refreshToken,
          tokenExpiry: expiry
        })
        .returning({ id: userOauth.id });
      
      return !!result;
    }
  }
  
  // Invitation methods
  async createInvitation(
    email: string,
    role: string,
    token: string,
    invitedByUserId: number,
    expiresAt: Date
  ): Promise<Invitation> {
    const [invitation] = await db
      .insert(invitations)
      .values({
        email,
        role,
        token,
        invitedByUserId,
        expiresAt
      })
      .returning();
    
    return invitation;
  }
  
  async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, token));
    
    return invitation;
  }
  
  async acceptInvitation(token: string): Promise<boolean> {
    const [result] = await db
      .update(invitations)
      .set({ accepted: true, updatedAt: new Date() })
      .where(eq(invitations.token, token))
      .returning({ id: invitations.id });
    
    return !!result;
  }
  
  // Workspace methods
  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));
    
    return workspace;
  }
  
  async getWorkspacesByUser(userId: number): Promise<Workspace[]> {
    // Get workspaces the user is a member of
    const members = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId));
    
    if (members.length === 0) return [];
    
    // Get the workspaces
    const workspaceIds = members.map(m => m.workspaceId);
    const workspaceList = await db
      .select()
      .from(workspaces)
      .where(workspaces.id.in(workspaceIds));
    
    return workspaceList;
  }
  
  async createWorkspace(workspaceData: InsertWorkspace): Promise<Workspace> {
    const [workspace] = await db
      .insert(workspaces)
      .values(workspaceData)
      .returning();
    
    // Add the creator as an admin member
    await db
      .insert(workspaceMembers)
      .values({
        workspaceId: workspace.id,
        userId: workspaceData.createdByUserId,
        permission: WorkspacePermission.ADMIN,
        addedByUserId: workspaceData.createdByUserId
      });
    
    return workspace;
  }
  
  async updateWorkspace(id: number, workspaceData: Partial<InsertWorkspace>): Promise<Workspace | undefined> {
    const [updatedWorkspace] = await db
      .update(workspaces)
      .set({ ...workspaceData, updatedAt: new Date() })
      .where(eq(workspaces.id, id))
      .returning();
    
    return updatedWorkspace;
  }
  
  async deleteWorkspace(id: number): Promise<boolean> {
    const [result] = await db
      .delete(workspaces)
      .where(eq(workspaces.id, id))
      .returning({ id: workspaces.id });
    
    return !!result;
  }
  
  // Workspace membership methods
  async addUserToWorkspace(
    workspaceId: number,
    userId: number,
    permission: WorkspacePermission,
    addedByUserId: number
  ): Promise<WorkspaceMember> {
    const [member] = await db
      .insert(workspaceMembers)
      .values({
        workspaceId,
        userId,
        permission,
        addedByUserId
      })
      .returning();
    
    return member;
  }
  
  async updateWorkspaceMemberPermission(
    workspaceId: number,
    userId: number,
    permission: WorkspacePermission
  ): Promise<boolean> {
    const [result] = await db
      .update(workspaceMembers)
      .set({ 
        permission,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      )
      .returning({ id: workspaceMembers.id });
    
    return !!result;
  }
  
  async removeUserFromWorkspace(workspaceId: number, userId: number): Promise<boolean> {
    const [result] = await db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      )
      .returning({ id: workspaceMembers.id });
    
    return !!result;
  }
  
  async getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
    return db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId));
  }
  
  // Workflow methods
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const [workflow] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, id));
    
    return workflow;
  }
  
  async getWorkflowsByWorkspace(workspaceId: number): Promise<Workflow[]> {
    return db
      .select()
      .from(workflows)
      .where(eq(workflows.workspaceId, workspaceId));
  }
  
  async getWorkflowsByCreator(userId: number): Promise<Workflow[]> {
    return db
      .select()
      .from(workflows)
      .where(eq(workflows.createdByUserId, userId));
  }
  
  async createWorkflow(workflowData: InsertWorkflow): Promise<Workflow> {
    const [workflow] = await db
      .insert(workflows)
      .values(workflowData)
      .returning();
    
    return workflow;
  }
  
  async updateWorkflow(id: number, workflowData: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const [updatedWorkflow] = await db
      .update(workflows)
      .set({ ...workflowData, updatedAt: new Date() })
      .where(eq(workflows.id, id))
      .returning();
    
    return updatedWorkflow;
  }
  
  async deleteWorkflow(id: number): Promise<boolean> {
    const [result] = await db
      .delete(workflows)
      .where(eq(workflows.id, id))
      .returning({ id: workflows.id });
    
    return !!result;
  }
  
  // Workflow permission methods
  async grantWorkflowPermission(
    workflowId: number,
    userId: number,
    permission: string,
    grantedByUserId: number
  ): Promise<boolean> {
    // Check if permission already exists
    const [existingPermission] = await db
      .select()
      .from(workflowPermissions)
      .where(
        and(
          eq(workflowPermissions.workflowId, workflowId),
          eq(workflowPermissions.userId, userId)
        )
      );
    
    if (existingPermission) {
      // Update existing permission
      const [result] = await db
        .update(workflowPermissions)
        .set({
          permission,
          grantedByUserId,
          updatedAt: new Date()
        })
        .where(eq(workflowPermissions.id, existingPermission.id))
        .returning({ id: workflowPermissions.id });
      
      return !!result;
    } else {
      // Create new permission
      const [result] = await db
        .insert(workflowPermissions)
        .values({
          workflowId,
          userId,
          permission,
          grantedByUserId
        })
        .returning({ id: workflowPermissions.id });
      
      return !!result;
    }
  }
  
  async removeWorkflowPermission(workflowId: number, userId: number): Promise<boolean> {
    const [result] = await db
      .delete(workflowPermissions)
      .where(
        and(
          eq(workflowPermissions.workflowId, workflowId),
          eq(workflowPermissions.userId, userId)
        )
      )
      .returning({ id: workflowPermissions.id });
    
    return !!result;
  }
  
  // Workflow execution methods
  async recordWorkflowRun(
    workflowId: number,
    startedByUserId: number | null,
    status: string,
    startTime: Date
  ): Promise<WorkflowRun> {
    const [run] = await db
      .insert(workflowRuns)
      .values({
        workflowId,
        startedByUserId,
        status,
        startTime
      })
      .returning();
    
    // Update workflow run count and last run time
    await db
      .update(workflows)
      .set({ 
        runCount: db.raw('run_count + 1'),
        lastRunAt: startTime,
        updatedAt: new Date()
      })
      .where(eq(workflows.id, workflowId));
    
    return run;
  }
  
  async completeWorkflowRun(
    runId: number,
    status: string,
    endTime: Date,
    errorMessage?: string,
    errorCategory?: string
  ): Promise<WorkflowRun | undefined> {
    const [updatedRun] = await db
      .update(workflowRuns)
      .set({
        status,
        endTime,
        errorMessage,
        errorCategory
      })
      .where(eq(workflowRuns.id, runId))
      .returning();
    
    return updatedRun;
  }
  
  async getWorkflowRuns(workflowId: number, limit: number = 10): Promise<WorkflowRun[]> {
    return db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.workflowId, workflowId))
      .orderBy(workflowRuns.startTime)
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
