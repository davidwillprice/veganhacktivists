import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import React from 'react';
import ImageContainer from '../../decoration/imageContainer';

export interface ContentButtonProps {
  contentTitle: string;
  setContent?: (content: string) => void;
  currentContent: string;
  down?: boolean;
  white?: boolean;
}

export const ContentButton: React.FC<ContentButtonProps> = ({
  contentTitle,
  down = false,
  white = false,
  currentContent,
  setContent = () => {},
}) => {
  const contentName = contentTitle.replace(/\s+/g, '').toLowerCase();
  const active = currentContent === contentName;

  return (
    <div
      className={`flex justify-center items-center h-12 w-80 bg-${
        active ? 'grey-dark' : white ? 'white' : 'grey-background'
      } mx-auto relative ${down ? '-bottom-80' : 'bottom-0'}`}
      style={{
        transition: 'bottom 200ms ease 0s',
      }}
      onClick={() => {
        if (!active) {
          setContent(contentName);
        }
      }}
    >
      <p className={`text-3xl text-${active ? 'white' : 'black'}`}>
        {contentTitle}
      </p>
      <div
        className={
          'flex justify-center items-center absolute bottom-0 right-0 h-12 w-12'
        }
      >
        <FontAwesomeIcon
          size="lg"
          icon={faChevronDown}
          color={active ? 'white' : 'black'}
          className={`transition-transform duration-200 ${
            active ? 'rotate-180' : ''
          }`}
        />
      </div>

      <ImageContainer className="absolute -bottom-80 w-80 h-80">
        <Image
          src={`/images/review2020/${contentName}.webp`}
          alt={contentName + ' logo'}
          layout="fill"
        />
      </ImageContainer>
    </div>
  );
};
