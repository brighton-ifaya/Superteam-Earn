import {
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Link,
  Text,
  useMediaQuery,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import { TalentBio } from '@/components/TalentBio';
import { Comments } from '@/features/comments';
import type { SubmissionWithUser } from '@/interface/submission';
import { type User as IUser } from '@/interface/user';
import { useOgImage } from '@/queries/get-og';
import { getURLSanitized } from '@/utils/getURLSanitized';

import { type Listing } from '../../types';

interface Props {
  bounty: Listing;
  submission?: SubmissionWithUser;
  user: IUser;
  link: string;
}
export const SubmissionPage = ({ bounty, submission, user, link }: Props) => {
  const router = useRouter();
  const { data: image } = useOgImage(link);
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  return (
    <VStack
      align={['center', 'center', 'start', 'start']}
      justify={['center', 'center', 'space-between', 'space-between']}
      flexDir={['column', 'column', 'row', 'row']}
      gap={4}
      w="full"
      maxW={'8xl'}
      mx={'auto'}
    >
      <VStack gap={3} w={'full'} mt={3}>
        {bounty?.isWinnersAnnounced && submission?.isWinner && (
          <Box
            w="full"
            mt={4}
            px={4}
            py={2}
            color={'#D26F12'}
            textAlign={'center'}
            bg={'#FFE6B6'}
            rounded="md"
          >
            <Text fontWeight={700} textTransform={'uppercase'}>
              🏆 WINNER: {submission?.winnerPosition} 🏆
            </Text>
          </Box>
        )}
        <VStack
          w={'full'}
          h={{ base: 'auto', md: '40rem' }}
          bg={'white'}
          rounded={'md'}
        >
          <Flex justify={'space-between'} w={'full'} mt={5} px={8}>
            <Text color={'black'} fontSize={'22px'} fontWeight={600}>
              {user?.firstName}&apos;s Submission
            </Text>
          </Flex>
          <Image
            w={'full'}
            h={'30rem'}
            p={7}
            objectFit={'cover'}
            alt={'submission'}
            rounded={'2rem'}
            src={image || '/assets/bg/og.svg'}
          />
          <HStack w="full" px={7}>
            <Button
              as={Link}
              w="full"
              mb={6}
              _hover={{
                textDecoration: 'none',
              }}
              href={getURLSanitized(link)}
              isExternal
              variant="solid"
            >
              Visit Link
            </Button>
          </HStack>
          {isMobile && (
            <VStack mt={12}>
              <TalentBio w={'100%'} successPage={false} talentUser={user} />
            </VStack>
          )}
        </VStack>

        <Comments
          isAnnounced={bounty?.isWinnersAnnounced ?? false}
          listingSlug={bounty?.slug ?? ''}
          listingType={bounty?.type ?? ''}
          poc={bounty?.poc as IUser}
          sponsorId={bounty?.sponsorId}
          refId={(router.query.subid as string) ?? ''}
          refType="SUBMISSION"
        />
      </VStack>
      {!isMobile && (
        <VStack w={['100%', '100%', '36rem', '36rem']}>
          <TalentBio w={'100%'} successPage={false} talentUser={user} />
        </VStack>
      )}
    </VStack>
  );
};
