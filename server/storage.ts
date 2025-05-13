import { eq, and, desc, or, sql } from "drizzle-orm";
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
  workflowTemplates,
  nodeTypes,
  appIntegrations,
  userAppCredentials,
  workflowNodeExecutions,
  subscriptionPlans,
  subscriptionHistory,
  featureFlags,
  SubscriptionTier,
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
  type TestUserFlag,
  type WorkflowTemplate, 
  type InsertWorkflowTemplate,
  type NodeType, 
  type InsertNodeType,
  type AppIntegration, 
  type InsertAppIntegration,
  type UserAppCredential, 
  type InsertUserAppCredential,
  type WorkflowNodeExecution,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type SubscriptionHistory,
  type InsertSubscriptionHistory,
  type FeatureFlag,
  type InsertFeatureFlag
} from "@shared/schema";

export interface IStorage {
  // Feature flags methods
  getFeatureFlag(featureName: string): Promise<FeatureFlag | undefined>;
  getFeatureFlags(): Promise<FeatureFlag[]>;
  isFeatureEnabled(featureName: string): Promise<boolean>;
  updateFeatureFlag(featureName: string, isEnabled: boolean): Promise<FeatureFlag | undefined>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deactivateUser(id: number): Promise<boolean>;
  // Replit Auth user method
  upsertUser(user: { id: string, email: string | null, firstName: string | null, lastName: string | null, profileImageUrl: string | null }): Promise<User>;
  
  // Subscription methods
  updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId?: string }): Promise<User | undefined>;
  updateUserSubscription(userId: number, subscriptionData: { 
    tier: string, 
    status: string, 
    subscriptionId?: string, 
    periodEnd?: Date
  }): Promise<User | undefined>;
  getUserActiveSubscription(userId: number): Promise<{ 
    tier: string; 
    status: string;
    planDetails?: SubscriptionPlan;
  } | undefined>;
  getSubscriptionPlans(isActive?: boolean): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanByTier(tier: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionHistory(record: InsertSubscriptionHistory): Promise<SubscriptionHistory>;
  
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

  // Workflow template methods
  getWorkflowTemplate(id: number): Promise<WorkflowTemplate | undefined>;
  getWorkflowTemplates(filters?: {
    category?: string;
    tags?: string[];
    isPublished?: boolean;
    isOfficial?: boolean;
    createdByUserId?: number;
  }): Promise<WorkflowTemplate[]>;
  createWorkflowTemplate(template: InsertWorkflowTemplate): Promise<WorkflowTemplate>;
  updateWorkflowTemplate(id: number, templateData: Partial<InsertWorkflowTemplate>): Promise<WorkflowTemplate | undefined>;
  deleteWorkflowTemplate(id: number): Promise<boolean>;
  incrementTemplatePopularity(id: number): Promise<boolean>;
  
  // Node type methods
  getNodeType(id: number): Promise<NodeType | undefined>;
  getNodeTypeByName(name: string): Promise<NodeType | undefined>;
  getNodeTypes(category?: string): Promise<NodeType[]>;
  createNodeType(nodeType: InsertNodeType): Promise<NodeType>;
  updateNodeType(id: number, nodeTypeData: Partial<InsertNodeType>): Promise<NodeType | undefined>;
  deleteNodeType(id: number): Promise<boolean>;
  
  // App integration methods
  getAppIntegration(id: number): Promise<AppIntegration | undefined>;
  getAppIntegrationByName(name: string): Promise<AppIntegration | undefined>;
  getAppIntegrations(category?: string): Promise<AppIntegration[]>;
  createAppIntegration(appIntegration: InsertAppIntegration): Promise<AppIntegration>;
  updateAppIntegration(id: number, appIntegrationData: Partial<InsertAppIntegration>): Promise<AppIntegration | undefined>;
  deleteAppIntegration(id: number): Promise<boolean>;
  
  // User app credentials methods
  getUserAppCredentials(userId: number, appIntegrationId?: number): Promise<UserAppCredential[]>;
  getUserAppCredential(id: number): Promise<UserAppCredential | undefined>;
  createUserAppCredential(credential: InsertUserAppCredential): Promise<UserAppCredential>;
  updateUserAppCredential(id: number, credentialData: Partial<InsertUserAppCredential>): Promise<UserAppCredential | undefined>;
  deleteUserAppCredential(id: number): Promise<boolean>;
  validateUserAppCredential(id: number): Promise<boolean>;
  
  // Workflow node execution methods
  recordNodeExecution(
    workflowRunId: number,
    nodeId: string,
    status: string,
    executionOrder: number,
    startTime?: Date
  ): Promise<WorkflowNodeExecution>;
  completeNodeExecution(
    nodeExecutionId: number,
    status: string,
    endTime: Date,
    outputData?: any,
    errorMessage?: string,
    errorCategory?: string
  ): Promise<WorkflowNodeExecution | undefined>;
  updateNodeExecutionInputData(
    nodeExecutionId: number,
    inputData: any
  ): Promise<boolean>;
  getNodeExecutions(workflowRunId: number): Promise<WorkflowNodeExecution[]>;
  retryNodeExecution(
    nodeExecutionId: number,
    startTime: Date
  ): Promise<WorkflowNodeExecution | undefined>;
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
      .orderBy(desc(workflowRuns.startTime))
      .limit(limit);
  }
  
  // Workflow template methods
  async getWorkflowTemplate(id: number): Promise<WorkflowTemplate | undefined> {
    const [template] = await db
      .select()
      .from(workflowTemplates)
      .where(eq(workflowTemplates.id, id));
    
    return template;
  }
  
  async getWorkflowTemplates(filters?: {
    category?: string;
    tags?: string[];
    isPublished?: boolean;
    isOfficial?: boolean;
    createdByUserId?: number;
  }): Promise<WorkflowTemplate[]> {
    let query = db.select().from(workflowTemplates);
    
    if (filters) {
      if (filters.category) {
        query = query.where(eq(workflowTemplates.category, filters.category));
      }
      
      if (filters.isPublished !== undefined) {
        query = query.where(eq(workflowTemplates.isPublished, filters.isPublished));
      }
      
      if (filters.isOfficial !== undefined) {
        query = query.where(eq(workflowTemplates.isOfficial, filters.isOfficial));
      }
      
      if (filters.createdByUserId) {
        query = query.where(eq(workflowTemplates.createdByUserId, filters.createdByUserId));
      }
      
      // Note: In a real implementation, we would handle the tags array with a more sophisticated query
      // For PostgreSQL, we could use the array containment operator
    }
    
    return query.orderBy(desc(workflowTemplates.popularity));
  }
  
  async createWorkflowTemplate(template: InsertWorkflowTemplate): Promise<WorkflowTemplate> {
    const [newTemplate] = await db
      .insert(workflowTemplates)
      .values({
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newTemplate;
  }
  
  async updateWorkflowTemplate(id: number, templateData: Partial<InsertWorkflowTemplate>): Promise<WorkflowTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(workflowTemplates)
      .set({
        ...templateData,
        updatedAt: new Date()
      })
      .where(eq(workflowTemplates.id, id))
      .returning();
    
    return updatedTemplate;
  }
  
  async deleteWorkflowTemplate(id: number): Promise<boolean> {
    const result = await db
      .delete(workflowTemplates)
      .where(eq(workflowTemplates.id, id));
    
    return true; // If no error was thrown, the deletion was successful
  }
  
  async incrementTemplatePopularity(id: number): Promise<boolean> {
    const [updatedTemplate] = await db
      .update(workflowTemplates)
      .set({
        popularity: sql`${workflowTemplates.popularity} + 1`,
        updatedAt: new Date()
      })
      .where(eq(workflowTemplates.id, id))
      .returning();
    
    return !!updatedTemplate;
  }
  
  // Node type methods
  async getNodeType(id: number): Promise<NodeType | undefined> {
    const [nodeType] = await db
      .select()
      .from(nodeTypes)
      .where(eq(nodeTypes.id, id));
    
    return nodeType;
  }
  
  async getNodeTypeByName(name: string): Promise<NodeType | undefined> {
    const [nodeType] = await db
      .select()
      .from(nodeTypes)
      .where(eq(nodeTypes.name, name));
    
    return nodeType;
  }
  
  async getNodeTypes(category?: string): Promise<NodeType[]> {
    let query = db.select().from(nodeTypes);
    
    if (category) {
      query = query.where(eq(nodeTypes.category, category));
    }
    
    return query.orderBy(nodeTypes.displayName);
  }
  
  async createNodeType(nodeType: InsertNodeType): Promise<NodeType> {
    const [newNodeType] = await db
      .insert(nodeTypes)
      .values({
        ...nodeType,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newNodeType;
  }
  
  async updateNodeType(id: number, nodeTypeData: Partial<InsertNodeType>): Promise<NodeType | undefined> {
    const [updatedNodeType] = await db
      .update(nodeTypes)
      .set({
        ...nodeTypeData,
        updatedAt: new Date()
      })
      .where(eq(nodeTypes.id, id))
      .returning();
    
    return updatedNodeType;
  }
  
  async deleteNodeType(id: number): Promise<boolean> {
    const result = await db
      .delete(nodeTypes)
      .where(eq(nodeTypes.id, id));
    
    return true; // If no error was thrown, the deletion was successful
  }
  
  // App integration methods
  async getAppIntegration(id: number): Promise<AppIntegration | undefined> {
    const [appIntegration] = await db
      .select()
      .from(appIntegrations)
      .where(eq(appIntegrations.id, id));
    
    return appIntegration;
  }
  
  async getAppIntegrationByName(name: string): Promise<AppIntegration | undefined> {
    const [appIntegration] = await db
      .select()
      .from(appIntegrations)
      .where(eq(appIntegrations.name, name));
    
    return appIntegration;
  }
  
  async getAppIntegrations(category?: string): Promise<AppIntegration[]> {
    let query = db.select().from(appIntegrations).where(eq(appIntegrations.isActive, true));
    
    if (category) {
      query = query.where(eq(appIntegrations.category, category));
    }
    
    return query.orderBy(appIntegrations.displayName);
  }
  
  async createAppIntegration(appIntegration: InsertAppIntegration): Promise<AppIntegration> {
    const [newAppIntegration] = await db
      .insert(appIntegrations)
      .values({
        ...appIntegration,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newAppIntegration;
  }
  
  async updateAppIntegration(id: number, appIntegrationData: Partial<InsertAppIntegration>): Promise<AppIntegration | undefined> {
    const [updatedAppIntegration] = await db
      .update(appIntegrations)
      .set({
        ...appIntegrationData,
        updatedAt: new Date()
      })
      .where(eq(appIntegrations.id, id))
      .returning();
    
    return updatedAppIntegration;
  }
  
  async deleteAppIntegration(id: number): Promise<boolean> {
    const result = await db
      .delete(appIntegrations)
      .where(eq(appIntegrations.id, id));
    
    return true; // If no error was thrown, the deletion was successful
  }
  
  // User app credentials methods
  async getUserAppCredentials(userId: number, appIntegrationId?: number): Promise<UserAppCredential[]> {
    let query = db.select().from(userAppCredentials)
      .where(eq(userAppCredentials.userId, userId));
    
    if (appIntegrationId) {
      query = query.where(eq(userAppCredentials.appIntegrationId, appIntegrationId));
    }
    
    return query.orderBy(userAppCredentials.createdAt);
  }
  
  async getUserAppCredential(id: number): Promise<UserAppCredential | undefined> {
    const [credential] = await db
      .select()
      .from(userAppCredentials)
      .where(eq(userAppCredentials.id, id));
    
    return credential;
  }
  
  async createUserAppCredential(credential: InsertUserAppCredential): Promise<UserAppCredential> {
    const [newCredential] = await db
      .insert(userAppCredentials)
      .values({
        ...credential,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newCredential;
  }
  
  async updateUserAppCredential(id: number, credentialData: Partial<InsertUserAppCredential>): Promise<UserAppCredential | undefined> {
    const [updatedCredential] = await db
      .update(userAppCredentials)
      .set({
        ...credentialData,
        updatedAt: new Date()
      })
      .where(eq(userAppCredentials.id, id))
      .returning();
    
    return updatedCredential;
  }
  
  async deleteUserAppCredential(id: number): Promise<boolean> {
    const result = await db
      .delete(userAppCredentials)
      .where(eq(userAppCredentials.id, id));
    
    return true; // If no error was thrown, the deletion was successful
  }
  
  async validateUserAppCredential(id: number): Promise<boolean> {
    // This method would contain real validation logic in a production environment
    // For now, we just mark the credential as valid
    const [updatedCredential] = await db
      .update(userAppCredentials)
      .set({
        isValid: true,
        lastValidatedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(userAppCredentials.id, id))
      .returning();
    
    return !!updatedCredential;
  }
  
  // Workflow node execution methods
  async recordNodeExecution(
    workflowRunId: number,
    nodeId: string,
    status: string,
    executionOrder: number,
    startTime: Date = new Date()
  ): Promise<WorkflowNodeExecution> {
    const [nodeExecution] = await db
      .insert(workflowNodeExecutions)
      .values({
        workflowRunId,
        nodeId,
        status,
        executionOrder,
        startTime,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return nodeExecution;
  }
  
  async completeNodeExecution(
    nodeExecutionId: number,
    status: string,
    endTime: Date,
    outputData?: any,
    errorMessage?: string,
    errorCategory?: string
  ): Promise<WorkflowNodeExecution | undefined> {
    const [updatedNodeExecution] = await db
      .update(workflowNodeExecutions)
      .set({
        status,
        endTime,
        outputData,
        errorMessage,
        errorCategory,
        updatedAt: new Date()
      })
      .where(eq(workflowNodeExecutions.id, nodeExecutionId))
      .returning();
    
    return updatedNodeExecution;
  }
  
  async updateNodeExecutionInputData(
    nodeExecutionId: number,
    inputData: any
  ): Promise<boolean> {
    const [updatedNodeExecution] = await db
      .update(workflowNodeExecutions)
      .set({
        inputData,
        updatedAt: new Date()
      })
      .where(eq(workflowNodeExecutions.id, nodeExecutionId))
      .returning();
    
    return !!updatedNodeExecution;
  }
  
  async getNodeExecutions(workflowRunId: number): Promise<WorkflowNodeExecution[]> {
    return db
      .select()
      .from(workflowNodeExecutions)
      .where(eq(workflowNodeExecutions.workflowRunId, workflowRunId))
      .orderBy(workflowNodeExecutions.executionOrder);
  }
  
  async retryNodeExecution(
    nodeExecutionId: number,
    startTime: Date
  ): Promise<WorkflowNodeExecution | undefined> {
    const [updatedNodeExecution] = await db
      .update(workflowNodeExecutions)
      .set({
        status: 'pending',
        startTime,
        endTime: null,
        outputData: null,
        errorMessage: null,
        errorCategory: null,
        retryCount: sql`${workflowNodeExecutions.retryCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(workflowNodeExecutions.id, nodeExecutionId))
      .returning();
    
    return updatedNodeExecution;
  }

  // Subscription methods
  async updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId?: string }): Promise<User | undefined> {
    const updateData: Partial<User> = {
      stripeCustomerId: stripeInfo.customerId,
      updatedAt: new Date()
    };
    
    if (stripeInfo.subscriptionId) {
      updateData.stripeSubscriptionId = stripeInfo.subscriptionId;
    }
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
  
  async updateUserSubscription(userId: number, subscriptionData: { 
    tier: string, 
    status: string, 
    subscriptionId?: string, 
    periodEnd?: Date
  }): Promise<User | undefined> {
    const updateData: Partial<User> = {
      subscriptionTier: subscriptionData.tier,
      subscriptionStatus: subscriptionData.status,
      updatedAt: new Date()
    };
    
    if (subscriptionData.subscriptionId) {
      updateData.stripeSubscriptionId = subscriptionData.subscriptionId;
    }
    
    if (subscriptionData.periodEnd) {
      updateData.subscriptionPeriodEnd = subscriptionData.periodEnd;
    }
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
  
  async getSubscriptionPlans(isActive?: boolean): Promise<SubscriptionPlan[]> {
    let query = db.select().from(subscriptionPlans);
    
    if (isActive !== undefined) {
      query = query.where(eq(subscriptionPlans.isActive, isActive));
    }
    
    return await query.orderBy(subscriptionPlans.priceMonthly);
  }
  
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));
    
    return plan;
  }
  
  async getSubscriptionPlanByTier(tier: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.tier, tier));
    
    return plan;
  }
  
  // Get user's active subscription information
  async getUserActiveSubscription(userId: number): Promise<{ 
    tier: string; 
    status: string;
    planDetails?: SubscriptionPlan;
  } | undefined> {
    // First, get the user to check their subscription status
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user || !user.subscriptionTier) {
      return undefined;
    }
    
    // If the subscription is no longer active, return undefined
    if (user.subscriptionStatus === 'canceled' || user.subscriptionStatus === 'unpaid') {
      // If it's canceled but the period hasn't ended, it's still active until the end date
      if (user.subscriptionStatus === 'canceled' && 
          user.subscriptionPeriodEnd && 
          new Date(user.subscriptionPeriodEnd) > new Date()) {
        // Subscription is canceled but still active until the end date
      } else {
        // For other inactive statuses, or if the canceled subscription period has ended, return undefined
        return undefined;
      }
    }
    
    // Get the subscription plan details
    const plan = await this.getSubscriptionPlanByTier(user.subscriptionTier);
    
    return {
      tier: user.subscriptionTier,
      status: user.subscriptionStatus || 'active',
      planDetails: plan
    };
  }
  
  async createSubscriptionHistory(record: InsertSubscriptionHistory): Promise<SubscriptionHistory> {
    const [historyRecord] = await db
      .insert(subscriptionHistory)
      .values(record)
      .returning();
    
    return historyRecord;
  }
}

export const storage = new DatabaseStorage();
