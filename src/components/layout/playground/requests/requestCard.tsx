import { faClock } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useMemo } from 'react';
import classNames from 'classnames';

import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '../../../../../prisma/constants';

import { DarkButton } from 'components/decoration/buttons';
import { readableTimeDiff } from 'lib/helpers/date';
import SquareField from 'components/decoration/squares';

import type { trpc } from 'lib/client/trpc';
import type { PlaygroundRequestCategory } from '@prisma/client';
import type { HTMLAttributes } from 'react';

interface PlaygroundRequestCardProps {
  request: trpc['playground']['getAllRequests']['output'][number];
}

const Li: React.FC<
  HTMLAttributes<HTMLLIElement> & {
    category: PlaygroundRequestCategory;
    name: string;
  }
> = ({ name, children, className, category, ...props }) => {
  if (!children) {
    return null;
  }
  return (
    <li
      {...props}
      className={classNames(
        'max-w-fit flex flex-row gap-2 justify-start items-center',
        className
      )}
    >
      <span
        style={{ backgroundColor: CATEGORY_COLORS[category] }}
        className="w-1.5 h-1.5 my-auto aspect-square"
      />
      <span className="my-auto truncate h-min">
        <b>{name}:</b> {children}
      </span>
    </li>
  );
};

const PlaygroundRequestCard: React.FC<
  React.PropsWithChildren<PlaygroundRequestCardProps>
> = ({
  request: {
    id,
    title,
    description,
    requester,
    createdAt,
    category,
    organization,
    isFree,
    dueDate,
  },
  children,
}) => {
  const [timeSinceCreated] = useMemo(
    () => readableTimeDiff(createdAt),
    [createdAt]
  );

  const [timeUntilDue, isDue] = useMemo(
    () => readableTimeDiff(dueDate),
    [dueDate]
  );

  const categoryColor = useMemo(() => CATEGORY_COLORS[category], [category]);

  return (
    <div
      className="bg-grey-background border-l-[10px]"
      style={{
        borderColor: categoryColor,
      }}
    >
      <SquareField
        squares={[{ top: 0, right: 0, color: categoryColor, size: 6 }]}
      />
      <div className="flex flex-col h-full gap-2 p-4 text-left">
        <div className="space-y-1">
          <h3
            className="mb-2 mr-12 font-mono text-xl font-bold capitalize break-all md:text-2xl line-clamp-1"
            title={title}
          >
            {title}
          </h3>
          <div className="flex flex-row justify-start gap-2">
            <div
              style={{
                borderColor: categoryColor,
              }}
              className="px-2 py-0.5 border-[3px] rounded-xl capitalize"
            >
              {CATEGORY_LABELS[category]}
            </div>
            <div className="flex flex-row items-center gap-2 my-auto">
              <FontAwesomeIcon icon={faClock} size="sm" />{' '}
              <div>
                <strong>Posted: </strong>
                {timeSinceCreated ? `${timeSinceCreated} ago` : 'Today'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 mb-4 line-clamp-5">{description}</div>
        <ul className="grid content-end flex-grow grid-cols-1 mb-2 lg:grid-cols-2 gap-x-1">
          <Li
            name="Requestor"
            category={category}
            title={requester.name || undefined}
          >
            {requester.name}
          </Li>
          <Li
            title={`${timeUntilDue ? (isDue ? 'Was due' : 'Due in') : 'Due'} ${
              timeUntilDue || ''
            }
            ${timeUntilDue ? (isDue ? ' ago' : '') : 'Today'}`}
            name={`${timeUntilDue ? (isDue ? 'Was due' : 'Due in') : 'Due'}`}
            category={category}
          >
            {timeUntilDue}
            {timeUntilDue ? (isDue ? ' ago' : '') : 'Today'}
          </Li>
          <Li
            name="Organization"
            title={organization || undefined}
            category={category}
          >
            {organization}
          </Li>
          <Li
            name="Compensation"
            title={`${isFree ? 'Volunteer' : 'Paid'} role`}
            category={category}
          >
            {isFree ? 'Volunteer' : 'Paid'} role
          </Li>
        </ul>
        <DarkButton
          href={{
            pathname: '/playground/request/[id]',
            query: { id },
          }}
          className="text-center text-md"
        >
          Read more / apply to help
        </DarkButton>
        {children}
      </div>
    </div>
  );
};

export default PlaygroundRequestCard;
