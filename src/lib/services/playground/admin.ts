import { PlaygroundRequestCategory, Status } from '@prisma/client';
import { TRPCError } from '@trpc/server';

import { bold, codeBlock, roleMention, underscore } from 'discord.js';

import prisma from 'lib/db/prisma';
import withDiscordClient, {
  ROLE_ID_BY_CATEGORY,
  sendDiscordMessage,
} from 'lib/discord';

import emailClient, { OUR_EMAIL } from 'lib/mail';

import type { Message } from 'discord.js';

import type { PlaygroundRequest } from '@prisma/client';

import type { z } from 'zod';
import type {
  getPendingApplicationsSchema,
  getPendingRequestsSchema,
  setApplicationStatusSchema,
  setRequestStatusSchema,
} from './schemas';

export const getPendingApplications = async (
  params: z.infer<typeof getPendingApplicationsSchema>
) => {
  const applications = await prisma.playgroundApplication.findMany({
    where: {
      ...params,
      status: Status.Pending,
    },
    include: {
      request: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return applications;
};

export const getPendingRequests = async (
  params: z.infer<typeof getPendingRequestsSchema>
) => {
  const requestsWithApplications = await prisma.playgroundRequest.findMany({
    where: {
      ...params,
      status: Status.Pending,
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return requestsWithApplications;
};

export const setApplicationStatus = ({
  id,
  status,
}: z.infer<typeof setApplicationStatusSchema>) =>
  prisma.$transaction(async (prisma) => {
    const application = await prisma.playgroundApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'The application was not found',
      });
    }

    const updatedApplication = await prisma.playgroundApplication.update({
      where: {
        id,
      },
      data: {
        status,
      },
      include: {
        request: true,
      },
    });

    const shouldNotifyBoth =
      application.status === Status.Pending &&
      updatedApplication.status === Status.Accepted;

    const shouldNotifyDenialToApplicant =
      application.status === Status.Pending &&
      updatedApplication.status === Status.Rejected;

    if (shouldNotifyBoth) {
      const optionalMessageParts = (
        (
          [
            ['Website / Portfolio', updatedApplication.portfolioLink],
            ['Twitter', updatedApplication.twitterUrl],
            ['Instagram', updatedApplication.instagramUrl],
            ['LinkedIn', updatedApplication.linkedinUrl],
            ['Message', updatedApplication.moreInfo],
          ] as [string, string | null][]
        ).filter(([, value]) => !!value) as [string, string][]
      )
        .map(([name, value]) => `<b>${name}:</b> ${value}`)
        .join('<br />');

      await emailClient.sendMail({
        to: [
          updatedApplication.providedEmail,
          updatedApplication.request.providedEmail,
        ],
        cc: OUR_EMAIL,
        subject: `We'd like to introduce ${updatedApplication.name}, from VH: Playground!`,

        html: `Hi ${updatedApplication.request.name},
<br />
<br />
We&apos;re excited to let you know that we&apos;ve been able to find someone to help you with &ldquo;${
          updatedApplication.request.title
        }&rdquo;!
<br />
<br />
Meet the person (cc&apos;ed to this email, just reply all!) below that applied to help with your request!
<br />
<br />
<b>Name:</b> ${updatedApplication.name}
<br />
${optionalMessageParts}
<br />
<br />
They have agreed that if selected to help with this project that they will commit a reasonable amount of time that would be needed to help with this project, communicate any status updates and progress, and do their best to meet any deadlines you might have.
<br />
<br />
<b>What&apos;s next?</b>
<br />
<br />
We highly recommend either of you to schedule a call with the other as soon as possible to talk about expectations, needs, and the project. Both of you can do so by scheduling a call using ${
          updatedApplication.request.name
        }&apos;s Calendy link <a href="${
          // TODO: sanitize this and all the other data?
          updatedApplication.request.calendlyUrl
        }">here</a>${
          updatedApplication.calendlyUrl
            ? ` or ${updatedApplication.name}&apos;s Calendy link <a href="${updatedApplication.calendlyUrl}">here</a>`
            : ''
        }.
<br />
<br />
Is someone not responding at all? Or are you having any other issues? Email us to let us know!
<br />
<br />
Thank you so much everyone for helping the animals, and for using Playground.
<br />
<br />
<b>Vegan Hacktivists</b>
`,
      });
    } else if (shouldNotifyDenialToApplicant) {
      await emailClient.sendMail({
        to: updatedApplication.providedEmail,
        subject:
          'Thanks so much for submitting your request to support with Playground!',
        html: `Thanks so much for submitting your request to support with Playground!
<br />
<br />
Unfortunately someone else who applied to help with this request was chosen. Usually this just means that someone else who applied had more time to contribute or had more relevant qualifications for this specific request.
<br />
<br />
To help improve your chances to volunteer for future tasks, make sure that your application, resume/portfolio, and other materials are both up-to-date and has enough details to help us make an informed decision.
<br />
<br />
If you have any specific questions feel free to contact us here. In the meantime, check out <a href="https://veganhacktivists.org/playground/requests">other pending requests</a>!
<br />
<br />
Thank you so much for considering VH: Playground for your activism!`,
      });
    }

    return updatedApplication;
  });

const requestMessage = (request: PlaygroundRequest) => {
  const DESCRIPTION_CHAR_LIMIT = 1200;

  const truncatedDescription = request.description.slice(
    0,
    DESCRIPTION_CHAR_LIMIT
  );
  const description =
    truncatedDescription.length < request.description.length
      ? `${truncatedDescription}...`
      : truncatedDescription;

  return `${
    request.organization || request.name
  } needs help, if you're interested in taking on this job, please apply to help with your resume, website, or linkedin, your email, and a little bit about you - thanks for your activism! 🐤 💕

${underscore(bold(request.title))}

${bold('Website:')} ${request.website || 'None'}

${bold('Compensation:')} ${
    request.isFree
      ? 'This request is for volunteer work only, not paid. Please help the animals! 🐓'
      : 'Paid'
  }

${bold(
  "What's next:"
)} Read the request, if interested, apply on the Playground website to be introduced 👉 ${`https://veganhacktivists.org/playground/request/${request.id}`}

${codeBlock(description)}`;
};

const playgroundChannelIdByCategory = (request: PlaygroundRequest) => {
  if (!request.isFree) {
    return process.env.DISCORD_PLAYGROUND_PAID_CHANNEL_ID!;
  }

  switch (request.category) {
    case PlaygroundRequestCategory.Developer:
      return process.env.DISCORD_PLAYGROUND_CODE_CHANNEL_ID!;
    case PlaygroundRequestCategory.Designer:
      return process.env.DISCORD_PLAYGROUND_DESIGN_CHANNEL_ID!;
    case PlaygroundRequestCategory.Writer:
      return process.env.DISCORD_PLAYGROUND_WRITER_CHANNEL_ID!;
    case PlaygroundRequestCategory.Editor:
      return process.env.DISCORD_PLAYGROUND_EDITOR_CHANNEL_ID!;
    case PlaygroundRequestCategory.Researcher:
      return process.env.DISCORD_PLAYGROUND_RESEARCH_CHANNEL_ID!;
    case PlaygroundRequestCategory.Marketer:
      return process.env.DISCORD_PLAYGROUND_MARKETER_CHANNEL_ID!;
    case PlaygroundRequestCategory.Social:
      return process.env.DISCORD_PLAYGROUND_SOCIAL_CHANNEL_ID!;
    case PlaygroundRequestCategory.DataScientist:
      return process.env.DISCORD_PLAYGROUND_DATA_CHANNEL_ID!;
    case PlaygroundRequestCategory.Security:
      return process.env.DISCORD_PLAYGROUND_SECURITY_CHANNEL_ID!;
    default:
      return process.env.DISCORD_PLAYGROUND_OTHER_CHANNEL_ID!;
  }
};

const postRequestOnDiscord = async (request: PlaygroundRequest) => {
  const playgroundChannelId = playgroundChannelIdByCategory(request);
  const araChannelId = process.env.DISCORD_ARA_CHANNEL_ID!;
  const rVeganChannelId = process.env.DISCORD_R_VEGAN_CHANNEL_ID!;

  const roleToMention = ROLE_ID_BY_CATEGORY[request.category];

  return await withDiscordClient(async () => {
    const playgroundMessage = await sendDiscordMessage(
      playgroundChannelId,
      `Hi ${
        roleToMention ? roleMention(roleToMention) : 'everyone'
      }! ${requestMessage(request)}`
    ).catch((err) => {
      throw new Error('Failed to send Playground message', { cause: err });
    });

    const rVeganAraMessageText = `Hi everyone! ${requestMessage(request)}
${bold(
  'Note:'
)} Please only apply if you're 18+, minors are not currently allowed - sorry!`;

    const araMessage = await sendDiscordMessage(
      araChannelId,
      rVeganAraMessageText
    ).catch(async (err) => {
      await playgroundMessage.delete();
      throw new Error('Failed to send ARA message', { cause: err });
    });

    const rVeganMessage = await sendDiscordMessage(
      rVeganChannelId,
      rVeganAraMessageText
    ).catch(async (err) => {
      await playgroundMessage.delete();
      await araMessage.delete();
      throw new Error('Failed to send r/Vegan message', { cause: err });
    });

    return [playgroundMessage, araMessage, rVeganMessage];
  });
};

export const setRequestStatus = ({
  id,
  status,
}: z.infer<typeof setRequestStatusSchema>) =>
  prisma.$transaction(async (transactionPrisma) => {
    const request = await transactionPrisma.playgroundRequest.findUnique({
      where: { id },
      include: {
        discordMessages: true,
      },
    });

    if (!request) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    const shouldPost =
      request.discordMessages.length === 0 &&
      request.status === Status.Pending &&
      status === Status.Accepted;

    const shouldNotifyDenial =
      request.status === Status.Pending && status === Status.Rejected;

    let updatedRequest = await transactionPrisma.playgroundRequest.update({
      where: { id },
      data: { status },
    });

    if (shouldPost) {
      try {
        const discordMessages = await postRequestOnDiscord(updatedRequest);
        updatedRequest = await prisma.playgroundRequest.update({
          where: { id },

          data: {
            discordMessages: {
              create: discordMessages.map((msg) => ({
                channelId: msg.channelId,
                messageId: msg.id,
              })),
            },
          },
        });
      } catch (e) {
        try {
          if (Array.isArray(e)) {
            await withDiscordClient(() => {
              (
                (e as Message[]).filter((msg) => !!msg) as Message<true>[]
              ).forEach(async (msg) => {
                try {
                  await msg.delete();
                } catch {}
              });
            });
          }
        } finally {
          throw e;
        }
      }
      await emailClient.sendMail({
        to: updatedRequest.providedEmail,
        subject: 'Your request is now live on Playground!',
        html: `Your request is now live on Playground!
<br /><br />
Hey ${updatedRequest.name}!
<br /><br />
Thanks for submitting your request to VH: Playground! We're happy to let you know that our team has reviewed and accepted your request to go live, which means you can now view and share it online by <a href="https://veganhacktivists.org/playground/request/${updatedRequest.id}">clicking this link</a>.
<br /><br />
Note that Playground has just launched and is still growing, it may take longer than usual for requests to be fulfilled by our volunteer community - your patience is appreciated! If you have any questions, feel free to reply to this email for help, or visit our FAQ <a href="https://veganhacktivists.org/playground#faq">in this page</a>.
<br /><br />
Thank you so much!`,
      });
    } else if (shouldNotifyDenial) {
      await emailClient.sendMail({
        to: updatedRequest.providedEmail,
        subject: 'Thanks so much for submitting your request to Playground!',
        html: `Thanks so much for submitting your request to Playground!
<br />
<br />
Unfortunately your request did not meet the relevant or quality standards needed to go live. Usually this means you didn't include enough details, but can also include other factors such as not being specifically a vegan request, being for-profit, etc.
<br />
<br />
If you have any specific questions, or believe this was a mistake, feel free to contact us here.
<br />
<br />
Thank you so much for considering VH: Playground for your request!`,
      });
    }
    return updatedRequest;
  });
