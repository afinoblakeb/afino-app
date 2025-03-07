import { Prisma } from '@prisma/client';

// Re-export types from Prisma
export type User = Prisma.UserGetPayload<{ select: null }>;
export type Organization = Prisma.OrganizationGetPayload<{ select: null }>;
export type Role = Prisma.RoleGetPayload<{ select: null }>;
export type UserOrganization = Prisma.UserOrganizationGetPayload<{ select: null }>;

// Define input types for create operations
export type RoleCreateInput = Prisma.RoleCreateInput;
export type OrganizationCreateInput = Prisma.OrganizationCreateInput;
export type UserCreateInput = Prisma.UserCreateInput;
export type UserOrganizationCreateInput = Prisma.UserOrganizationCreateInput;

// Define input types for update operations
export type RoleUpdateInput = Prisma.RoleUpdateInput;
export type OrganizationUpdateInput = Prisma.OrganizationUpdateInput;
export type UserUpdateInput = Prisma.UserUpdateInput;
export type UserOrganizationUpdateInput = Prisma.UserOrganizationUpdateInput;

// Define where input types for queries
export type RoleWhereUniqueInput = Prisma.RoleWhereUniqueInput;
export type OrganizationWhereUniqueInput = Prisma.OrganizationWhereUniqueInput;
export type UserWhereUniqueInput = Prisma.UserWhereUniqueInput;
export type UserOrganizationWhereUniqueInput = Prisma.UserOrganizationWhereUniqueInput;

// Define where input types for filtering
export type RoleWhereInput = Prisma.RoleWhereInput;
export type OrganizationWhereInput = Prisma.OrganizationWhereInput;
export type UserWhereInput = Prisma.UserWhereInput;
export type UserOrganizationWhereInput = Prisma.UserOrganizationWhereInput; 