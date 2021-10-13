import React from 'react';
import {
  faInstagram,
  faPatreon,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { LinkProps } from 'next/link';
import type {
  AriaAttributes,
  MouseEventHandler,
  ButtonHTMLAttributes,
} from 'react';

export interface ButtonProps
  extends AriaAttributes,
    ButtonHTMLAttributes<unknown> {
  primary?: boolean;
  href?: LinkProps['href'];
  className?: string;
  active?: boolean;
  linkProps?: Partial<LinkProps>;
  onClick?: MouseEventHandler;
  type?: 'submit' | 'reset' | 'button';
  capitalize?: boolean;
}

const baseButtonClasses = classNames(
  'p-3 px-4 py-2 text-2xl border-l-8 bg-w-x2 transition-shadow ease-out duration-[2s] font-mono cursor-pointer disabled:bg-grey-light disabled:cursor-not-allowed disabled:hover:shadow-none truncate'
);

const BaseButton: React.FC<ButtonProps> = ({
  children,
  linkProps,
  capitalize = true,
  className = '',
  ...props
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const href = (props?.href as any)?.pathname || props.href || '';

  const classes = classNames(className, { capitalize });

  return (
    <>
      {/* it's an external link */}
      {(href?.startsWith('http://') || href?.startsWith('https://')) && (
        <a href={href} target="_blank" rel="noreferrer">
          <div {...props} className={classes}>
            {children}
          </div>
        </a>
      )}
      {/* it's an internal link */}
      {href && !(href.startsWith('http://') || href.startsWith('https://')) && (
        <Link {...linkProps} href={href}>
          <a>
            <div className={classes} {...props}>
              {children}
            </div>
          </a>
        </Link>
      )}
      {/* it's a submit button */}
      {!href && (
        <button {...props} className={classes}>
          {children}
        </button>
      )}
    </>
  );
};

// TODO: define what a submit should look like
const SubmitButton: React.FC<ButtonProps> = (props) => {
  return <BaseButton {...props} />;
};

const LightButton: React.FC<ButtonProps> = ({
  children,
  primary,
  className = '',
  ...props
}) => {
  return (
    <BaseButton
      {...props}
      className={classNames(
        baseButtonClasses,
        'hover:shadow-fill-green text-grey-dark border-green bg-w-x2 bg-white font-mono font-semibold',
        primary ? 'border-pink' : '',
        className
      )}
    >
      {children}
    </BaseButton>
  );
};

const DarkButton: React.FC<ButtonProps> = ({
  children,
  active,
  className = '',
  ...props
}) => {
  return (
    <BaseButton
      {...props}
      className={classNames(
        baseButtonClasses,
        active
          ? 'hover:shadow-fill-pink bg-magenta border-pink'
          : 'hover:shadow-fill-green bg-grey-dark border-green',
        'text-white',
        { 'bg-grey-light cursor-not-allowed': props.disabled },
        className
      )}
    >
      {children}
    </BaseButton>
  );
};

const GreenButton: React.FC<ButtonProps> = ({
  children,
  primary,
  className = '',
  ...props
}) => {
  return (
    <BaseButton
      {...props}
      className={classNames(
        baseButtonClasses,
        primary
          ? 'hover:shadow-fill-pink bg-fuchsia border-pink'
          : 'hover:shadow-fill-green bg-green-light border-green',
        'text-white',
        className
      )}
    >
      {children}
    </BaseButton>
  );
};

const ExternalLinkButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <BaseButton {...props}>
      <div className="hover:shadow-fill-pink-dark bg-magenta border-l-8 border-pink-dark py-2 ease-linear duration-500">
        {children}
      </div>
    </BaseButton>
  );
};

const IconButton: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <BaseButton {...props}>{children}</BaseButton>;
};

const PatreonButton: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <IconButton
      {...props}
      className={classNames(
        'bg-white hover:bg-green-dark text-grey hover:text-white rounded-full px-2 py-2',
        className
      )}
    >
      <div className="h-8 w-8 flex justify-center items-center">
        <FontAwesomeIcon size="2x" fixedWidth icon={faPatreon} />
      </div>
    </IconButton>
  );
};

const YoutubeButton: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <IconButton
      {...props}
      className={classNames(
        'bg-white hover:bg-red text-grey hover:text-white rounded-full px-2 py-2',
        className
      )}
    >
      <div className="h-8 w-8 flex justify-center items-center">
        <FontAwesomeIcon size="2x" fixedWidth icon={faYoutube} />
      </div>
    </IconButton>
  );
};

const InstagramButton: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <IconButton
      {...props}
      className={classNames(
        'bg-white hover:bg-blue text-grey hover:text-white rounded-full px-2 py-2',
        className
      )}
    >
      <div className="h-8 w-8 flex justify-center items-center">
        <FontAwesomeIcon size="2x" fixedWidth icon={faInstagram} />
      </div>
    </IconButton>
  );
};

const WhiteButton: React.FC<ButtonProps> = ({
  children,
  active,
  className = '',
  ...props
}) => {
  const classes = classNames(
    'border-2 border-opacity-50 p-3',
    {
      'bg-gray': active,
      'text-white': active,
    },
    className
  );

  return (
    <BaseButton {...props}>
      <div className={classes}>{children}</div>
    </BaseButton>
  );
};

const NavButton: React.FC<ButtonProps & { href: string }> = ({
  href,
  className = '',
  children,
}) => {
  const { pathname } = useRouter();
  const atLocation = pathname === href;

  const classes = classNames('m-5 font-mono', className);

  return (
    <DarkButton
      active={atLocation}
      href={href}
      className={classes}
      linkProps={{ scroll: false }}
    >
      {children}
    </DarkButton>
  );
};

export {
  ExternalLinkButton,
  SubmitButton,
  PatreonButton,
  InstagramButton,
  YoutubeButton,
  LightButton,
  DarkButton,
  WhiteButton,
  GreenButton,
  NavButton,
};
