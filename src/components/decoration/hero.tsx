import classNames from 'classnames';
import type { ImageProps } from 'next/image';
import Image from 'next/image';
import Circle from './circle';

interface HeroClassNames {
  container?: string;
  content?: string;
}
interface HeroProps {
  imageBackground: ImageProps['src'];
  backgroundImageProps?: Partial<ImageProps>;
  tagline?: {
    image: StaticImageData;
    alt: string;
  };
  alignment: 'right' | 'left' | 'center';
  classNameMapping?: HeroClassNames;
  main?: boolean;
}

const Hero: React.FC<HeroProps> = ({
  imageBackground,
  backgroundImageProps = {},
  tagline,
  alignment,
  children,
  classNameMapping,
  main = false,
}) => {
  const containerClasses = classNames(
    'relative',
    'flex',
    {
      'justify-start': alignment === 'left',
      'justify-end': alignment === 'right',
      'justify-center': alignment === 'center',
      'md:h-[calc(100vh-74px)] md:min-h-[40rem] md:-top-20 md:-mb-20': main,
    },
    classNameMapping?.container
  );
  const contentClasses = classNames(
    'flex',
    'flex-col',
    'justify-center',
    'w-1/2',
    'z-10',
    { 'py-10 xl:mt-0': main },
    classNameMapping?.content
  );

  const taglineHeight = 566 * 0.6;

  return (
    <div className={containerClasses}>
      <Image
        alt=""
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        src={imageBackground as any}
        layout="fill"
        objectFit="cover"
        objectPosition={main ? 'top' : 'center'}
        priority
        {...backgroundImageProps}
      />
      <div className={contentClasses}>
        {tagline && (
          <div
            className={classNames({
              'ml-5 py-20 md:py-20 lg:py-20': !main,
            })}
          >
            <Image
              src={tagline.image}
              alt={tagline.alt}
              width={
                (tagline.image.width / tagline.image.height) * taglineHeight
              }
              height={taglineHeight}
              priority
            />
          </div>
        )}
        {children}
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <Circle xAlign="right" radiusZoom={0.9} opacity={0.1} />
        <Circle yAlign="bottom" radiusZoom={1.04} opacity={0.2} />
      </div>
    </div>
  );
};

export default Hero;
