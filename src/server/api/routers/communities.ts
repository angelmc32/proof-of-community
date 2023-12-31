import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const communitiesRouter = createTRPCRouter({
  getUserDeployedCommunities: publicProcedure
    .input(z.object({ address: z.string().trim().length(42) }))
    .query(async ({ ctx, input }) => {
      const { address } = input;
      const allUserDeployedCommunities = await ctx.prisma.community.findMany({
        where: {
          deployedByAddress: address,
        },
      });
      return allUserDeployedCommunities;
    }),
  getOneCommunity: publicProcedure
    .input(z.object({ communityId: z.string().trim() }))
    .query(async ({ ctx, input }) => {
      const { communityId } = input;
      const community = await ctx.prisma.community.findUnique({
        where: {
          id: communityId,
        },
        select: {
          address: true,
          communityAddress: true,
          name: true,
          description: true,
          members: true,
          imageUri: true,
        },
      });
      return community;
    }),
  create: publicProcedure
    .input(
      z.object({
        deployedByAddress: z.string().trim().length(42),
        name: z.string().trim().min(1).max(32),
        symbol: z.string().trim().min(3).max(6),
        description: z.string().trim().min(20).max(140),
        imageUri: z.string().trim().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { deployedByAddress, name, symbol, description, imageUri } = input;

      const newCommunity = await ctx.prisma.community.create({
        data: {
          deployedByAddress,
          name,
          symbol,
          description,
          imageUri,
        },
      });

      return { newCommunity };
    }),
  addDeployedWallet: publicProcedure
    .input(
      z.object({
        address: z.string().trim().length(42),
        communityId: z.string().trim(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { address, communityId } = input;

      const updatedCommunity = await ctx.prisma.community.update({
        where: {
          id: communityId,
        },
        data: {
          address,
        },
      });

      return { updatedCommunity };
    }),
  addCommunityMember: publicProcedure
    .input(
      z.object({
        newMemberAddress: z.string().trim().length(42),
        communityId: z.string().trim(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { newMemberAddress, communityId } = input;

      const updatedCommunity = await ctx.prisma.community.update({
        where: {
          id: communityId,
        },
        data: {
          members: {
            push: newMemberAddress,
          },
        },
      });

      return { updatedCommunity };
    }),
});
