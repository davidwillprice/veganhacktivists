import React from 'react';
import Image from 'next/image';
import useThemeColor from '../../../hooks/useThemeColor';

export interface CandidateRequirementProps {
  image: StaticImageData;
  description: React.ReactNode;
  color: 'green' | 'yellow' | 'magenta' | 'orange';
}

const iconSize = 60;

const CandidateRequirement: React.FC<CandidateRequirementProps> = ({
  image,
  description,
  color,
}) => {
  const backgroundColor = useThemeColor(color);
  return (
    <div className="flex flex-col md:flex-row items-center gap-10 px-2 md:px-0">
      <div style={{ backgroundColor }} className="p-3 pb-1">
        <Image
          src={image}
          alt=""
          width={iconSize}
          height={iconSize}
          layout="fixed"
          objectPosition="center"
          priority
        />
      </div>
      <p className="w-5/8 text-center md:text-left md:text-2xl">
        {description}
      </p>
    </div>
  );
};

export default CandidateRequirement;
