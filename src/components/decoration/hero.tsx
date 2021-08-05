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
  tagline: {
    image: StaticImageData;
    alt: string;
  };
  alignment: 'right' | 'left';
  classNameMapping?: HeroClassNames;
  main?: boolean;
}

const Hero: React.FC<HeroProps> = ({
  imageBackground,
  tagline,
  alignment,
  children,
  classNameMapping,
  main = false,
}) => {
  const containerClasses = classNames(
    'relative',
    // 'py-10 md:py-32',
    'flex',
    {
      'justify-start': alignment === 'left',
      'justify-end': alignment === 'right',
      'h-screen-header sm:-top-20 sm:-mb-20': main,
      '': !main,
      // 'md:h-450px max-h-96': !main,
    },
    classNameMapping?.container
  );
  const contentClasses = classNames(
    'flex',
    'flex-col',
    'justify-center',
    'w-1/2',
    'z-10',
    { 'pt-10 xl:mt-0': main },
    classNameMapping?.content
  );

  const taglineRatio = 0.6;

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
      />
      <div className={contentClasses}>
        {tagline && (
          <div
            className={classNames({
              'py-20 md:py-40 lg:py-40': !main,
            })}
          >
            <Image
              layout="intrinsic"
              src={tagline.image}
              alt={tagline.alt}
              width={tagline.image.width * taglineRatio}
              height={tagline.image.height * taglineRatio}
              priority
            />
          </div>
        )}
        {children}
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <Circle xAlign="right" radiusZoom={0.9} opacity={0.1} />
        <Circle yAlign="bottom" radiusZoom={1.04} />
      </div>
    </div>
  );
};

export default Hero;
