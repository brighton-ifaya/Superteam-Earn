import { type IncomingMessage } from 'http';
import { type NextApiRequest } from 'next';
import { type NextApiRequestCookies } from 'next/dist/server/api-utils';

import logger from '@/lib/logger';
import { privy } from '@/lib/privy';
import { safeStringify } from '@/utils/safeStringify';

export async function getPrivyToken(
  req:
    | NextApiRequest
    | (IncomingMessage & {
        cookies: NextApiRequestCookies;
      }),
): Promise<string | null> {
  try {
    logger.debug('Request Cookies', safeStringify(req.cookies));
    logger.debug('Request Headers', safeStringify(req.headers));
    const accessToken = req.headers?.authorization?.replace('Bearer ', '');
    if (accessToken) {
      logger.info('Access token found in `authorization` header', accessToken);
    }

    // ONLY FOR DEVS, COOKIE IS NOT USED FOR AUTHENTICATION NOW.
    // BUT WE MIGHT MISS AND USE `axios` accidentally instead of `@/lib/api` ON FRONTEND
    // CHECKING FOR COOKIE HERE ONLY FOR LOGGING PURPOSES
    if (!accessToken) {
      if (!!req.cookies['privy-token']) {
        console.warn('PLEASE USE `@/lib/api` FROM FRONTEND INSTEAD OF `axios`');
      }
    }

    if (!accessToken) {
      logger.error(
        'Unauthorized, Privy access token not found in cookies or authorization header',
      );
      return null;
    }

    const claims = await privy.verifyAuthToken(
      accessToken,
      process.env.PRIVY_VERIFICATION_KEY,
    );
    logger.debug('Authorized, found full privy claim from token', claims);

    return claims.userId;
  } catch (error) {
    logger.error(
      'Unauthorized, Error verifying auth token ',
      safeStringify(error),
    );
    return null;
  }
}
