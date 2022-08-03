import { NextSeo } from 'next-seo';

import { PlaygroundLandingLayout } from 'components/layout/playground/layout';

import { SectionHeader } from 'components/decoration/textBlocks';

import PlaygroundRequestCard from 'components/layout/playground/requestSummary';

import { trpc } from 'lib/client/trpc';

import type PageWithLayout from 'types/persistentLayout';

const Playground: PageWithLayout = ({}) => {
  const { data: requests, isFetched } = trpc.useQuery(['playground.requests']);

  return (
    <>
      <NextSeo title="Requests" />
      <div className="">
        <SectionHeader
          className="capitalize"
          header={['Open requests', 'for support']}
        >
          Below are requests we&apos;ve recieved from organizations or activists
          who need help with their work for the animals.
        </SectionHeader>
        <div className="grid gap-8 lg:mx-12 2xl:mx-44 xl:mx-36 sm:grid-cols-2">
          {/* TODO: no available requests message */}
          {isFetched &&
            requests?.map((request) => (
              <PlaygroundRequestCard key={request.id} request={request} />
            ))}
        </div>
      </div>
    </>
  );
};

Playground.Layout = PlaygroundLandingLayout;
export default Playground;
