import axios from 'axios';
import type { NextApiResponse } from 'next';

import { type NextApiRequestWithUser, withAuth } from '@/features/auth';
import { sendEmailNotification } from '@/features/emails';
import { shouldSendEmailForListing } from '@/features/listing-builder';
import { prisma } from '@/prisma';
import { fetchTokenUSDValue } from '@/utils/fetchTokenUSDValue';

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  const userId = req.userId;

  const user = await prisma.user.findUnique({
    where: {
      id: userId as string,
    },
  });

  if (!user || !user.currentSponsorId) {
    return res
      .status(403)
      .json({ error: 'User does not have a current sponsor.' });
  }

  const { title, ...data } = req.body;
  try {
    let usdValue = 0;
    if (data.isPublished === true && data.publishedAt) {
      const tokenUsdValue = await fetchTokenUSDValue(
        data.token,
        data.publishedAt,
      );
      usdValue = tokenUsdValue * data.rewardAmount;
    }
    const finalData = {
      sponsorId: user.currentSponsorId,
      title,
      usdValue,
      ...data,
    };
    const result = await prisma.bounties.create({
      data: finalData,
      include: {
        sponsor: true,
      },
    });

    const shouldSendEmail = await shouldSendEmailForListing(result);

    if (shouldSendEmail) {
      await sendEmailNotification({
        type: 'createListing',
        id: result.id,
      });
    }

    try {
      if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
        const zapierWebhookUrl = process.env.ZAPIER_BOUNTY_WEBHOOK!;
        await axios.post(zapierWebhookUrl, result);
      }
    } catch (err) {
      console.log('Error with Zapier Webhook -', err);
    }
    return res.status(200).json(result);
  } catch (error: any) {
    console.error(`User ${userId} unable to create a listing`, error.message);
    return res.status(400).json({
      error,
      message: 'Error occurred while adding a new bounty.',
    });
  }
}

export default withAuth(handler);
