import { Request, Response, NextFunction } from "express";
import { UserRole, WorkspacePermission } from "@shared/schema";
import { storage } from "../storage";
import { TokenService } from "./token.service";
import { isAuthenticated } from "./auth.service";

// Middleware to check if user has access to a workflow
export const canAccessWorkflow = (requiredPermission: "view" | "edit") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const workflowId = parseInt(req.params.id);
      if (isNaN(workflowId)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }

      // Admin users can access all workflows
      if (user.role === UserRole.ADMIN) {
        return next();
      }

      // Get the workflow
      const workflow = await storage.getWorkflow(workflowId);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      // Creator role users can only access their own workflows
      if (
        user.role === UserRole.CREATOR &&
        workflow.createdByUserId !== user.id
      ) {
        // Check if the workflow is in a workspace they have access to
        if (workflow.workspaceId) {
          const workspaces = await storage.getWorkspacesByUser(user.id);
          const userWorkspace = workspaces.find(
            (w) => w.id === workflow.workspaceId
          );

          if (!userWorkspace) {
            return res.status(403).json({ message: "Access denied" });
          }
        } else {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      // Editor role users need explicit workflow permissions or workspace membership
      if (user.role === UserRole.EDITOR) {
        // If the workflow has a workspace, check workspace memberships
        if (workflow.workspaceId) {
          const memberList = await storage.getWorkspaceMembers(
            workflow.workspaceId
          );
          const membership = memberList.find((m) => m.userId === user.id);

          if (membership) {
            // Check if they have sufficient permission in the workspace
            if (
              requiredPermission === "edit" &&
              membership.permission === WorkspacePermission.VIEW
            ) {
              return res
                .status(403)
                .json({ message: "Insufficient workspace permissions" });
            }

            // They have sufficient permission
            return next();
          }
        }

        // No workspace or not a member - check individual workflow permissions
        // This would need a storage method to fetch workflow permissions...
        // Example: const permission = await storage.getWorkflowUserPermission(workflowId, user.id);

        return res.status(403).json({
          message: "No workflow-specific permissions yet implemented",
        });
      }

      // If we get here, the user has access
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user has access to a workspace
export const canAccessWorkspace = (requiredPermission: WorkspacePermission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const workspaceId = parseInt(req.params.id);
      if (isNaN(workspaceId)) {
        return res.status(400).json({ message: "Invalid workspace ID" });
      }

      // Admin users can access all workspaces
      if (user.role === UserRole.ADMIN) {
        return next();
      }

      // Get the workspace
      const workspace = await storage.getWorkspace(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }

      // Get user's membership in the workspace
      const members = await storage.getWorkspaceMembers(workspaceId);
      const membership = members.find((m) => m.userId === user.id);

      if (!membership) {
        return res
          .status(403)
          .json({ message: "Not a member of this workspace" });
      }

      // Check if they have sufficient permission
      const permissionLevel = getPermissionLevel(membership.permission);
      const requiredLevel = getPermissionLevel(requiredPermission);

      if (permissionLevel < requiredLevel) {
        return res
          .status(403)
          .json({ message: "Insufficient workspace permissions" });
      }

      // User has sufficient permission
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Helper to determine permission levels
function getPermissionLevel(permission: string): number {
  switch (permission) {
    case WorkspacePermission.VIEW:
      return 1;
    case WorkspacePermission.EDIT:
      return 2;
    case WorkspacePermission.MANAGE:
      return 3;
    case WorkspacePermission.ADMIN:
      return 4;
    default:
      return 0;
  }
}

// Workspace membership check for POST operations
export const canCreateInWorkspace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { workspaceId } = req.body;

    // If no workspace specified, proceed (item will be created without workspace)
    if (!workspaceId) {
      return next();
    }

    // Admin users can create in any workspace
    if (user.role === UserRole.ADMIN) {
      return next();
    }

    // For other users, check workspace membership
    const members = await storage.getWorkspaceMembers(workspaceId);
    const membership = members.find((m) => m.userId === user.id);

    if (!membership) {
      return res
        .status(403)
        .json({ message: "Not a member of this workspace" });
    }

    // Need at least EDIT permission to create items in a workspace
    if (membership.permission === WorkspacePermission.VIEW) {
      return res
        .status(403)
        .json({ message: "Insufficient workspace permissions" });
    }

    // User has sufficient permission
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to authenticate requests using JWT access tokens
 *
 * This middleware:
 * 1. Extracts the token from the Authorization header
 * 2. Verifies the token's validity
 * 3. Attaches the decoded user information to the request object
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extract token from Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Verify the token
  const decoded = TokenService.verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ message: "Invalid token" });
  }

  // Attach user information to request object
  req.user = decoded;
  next();
};

/**
 * Middleware to handle refresh token rotation
 *
 * This middleware:
 * 1. Accepts a refresh token in the request body
 * 2. Attempts to rotate the token
 * 3. Returns a new token pair if successful
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  // Attempt to rotate the refresh token
  const newTokens = await TokenService.rotateRefreshToken(refreshToken);
  if (!newTokens) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  // Return new token pair
  res.json(newTokens);
};

// Bypass authentication for test users in development

// Remove or disable this bypass in all environments:
export function bypassAuthForTestUsers(req: any, res: any, next: any) {
  if (
    req.body &&
    typeof req.body.email === "string" &&
    req.body.email.toLowerCase().includes("test")
  ) {
    // Allow all users with "test" in their email/username to authenticate
    // You can attach a test user object here or call next() if already authenticated
    req.user = {
      id: "test-user-id",
      email: req.body.email,
      role: "TEST",
      // ...add any other fields needed for your app
    };
    return next();
  }
  // Otherwise, use normal authentication
  return isAuthenticated(req, res, next);
}
