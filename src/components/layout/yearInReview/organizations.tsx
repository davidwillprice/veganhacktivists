import React, { useState } from 'react';

import { firstLetterUppercase } from '../../../lib/helpers/strings';
import { DarkButton } from '../../decoration/buttons';
import { FirstSubSection } from '../../decoration/textBlocks';
import saveMovementImage from '../../../../public/images/yearInReview/2020/savemovement.webp';
import animalRebellionImage from '../../../../public/images/yearInReview/2020/animalrebellion.webp';
import lebaneseVegansImage from '../../../../public/images/yearInReview/2020/lebanesevegans.webp';
import theExcelsior4Image from '../../../../public/images/yearInReview/2020/theexcelsior4.webp';

import { ContentButton } from './contentButton';

const ORGANIZATIONS = {
  savemovement: {
    title: 'Animal Save Movement',
    url: 'thesavemovement.org',
    image: saveMovementImage,
    content: `We were able to work with Animal Save and help them with their new website. We also
      helped with their Ad campaign and managed those for a few months to help promote more
      of Save's work and newsletter. If you haven't heard of Save, their mission is to hold
      vigils at every slaughterhouse and to bear witness to every exploited animal. They also
      run the Climate and Health Save Movement, which promote reversing catastrophic climate
      change and making plant-based diets accessible. It was an absolute joy to meet and work
      with their team of passionate activists!`,
  },
  animalrebellion: {
    title: 'Animal Rebellion',
    url: 'animalrebellion.org',
    image: animalRebellionImage,
    content: `We partnered with Animal Rebellion this year to help build their new website, which we dedicated
      an entire team for that took about 6 months of work. Their tech team were fantastic to work with,
      they were very knowledgeable and we felt like we were working with a team of professional during
      each encounter during our work. Animal Rebellion is a mass movement that uses nonviolent civil
      resistance to bring about a transition to a just and sustainable plant-based food system as an
      attempt to halt massive extinction, alleviate the worst effects of climate breakdown, and ensure
      justice for animals.`,
  },
  lebanesevegans: {
    title: 'Lebanese Vegans',
    url: 'lebanesevegans.org',
    image: lebaneseVegansImage,
    content: `The Lebanese Vegans social hub is the only animal rights and vegan support center in Southwest Asia and
      North Africa offering free monthly workshops and lectures about veganism, free weekly food distribution
      and monthly campaigns raising awareness about animal rights. We were lucky enough to work with them to help
      them both launch their new website and also re-branding with a new logo. We had a great time working through
      our advisor, Seb Alex, who organizes the work behind Lebanese Vegans.`,
  },
  theexcelsior4: {
    title: 'The Excelsior 4',
    url: 'excelsior4.org',
    image: theExcelsior4Image,
    content: `The Excelsior 4 are four activists are facing charges, with 21 counts in total after exposing criminal animal
      cruelty at Excelsior Hog Farm. We worked with them to get a new site launched that would allow them to fundraise
      their legal defense as fast as possible. We really think that the work they did and what they exposed is extremely
      important and we're so happy to have had the chance to support and help them get up and running. Please do check
      them out and support if you can!`,
  },
};

export const Organizations: React.FC = () => {
  const [currentOrgIndex, setcurrentOrgIndex] = useState(0);
  const organization = Object.values(ORGANIZATIONS)[currentOrgIndex];

  return (
    <div className="pt-8 pb-20 bg-grey-background">
      <FirstSubSection header="Working with ORGANIZATIONS" firstWordsNum={2} />
      <div className="flex flex-col justify-center mx-auto md:flex-row gap-x-16">
        <div>
          <div className="overflow-hidden pb-80">
            {Object.values(ORGANIZATIONS).map(({ title, image }, i) => (
              <ContentButton
                white
                down={currentOrgIndex < i}
                key={title}
                content={{ title, image }}
                setContent={() => {
                  setcurrentOrgIndex(i);
                }}
                active={i === currentOrgIndex}
              />
            ))}
          </div>
        </div>
        <div className="w-3/4 mx-auto mt-8 md:w-1/2 lg:w-1/3 md:text-left gap-y-4 md:mt-0 md:mx-0">
          <h1 className="mb-8 text-4xl font-bold">{organization.title}</h1>
          <p className="text-2xl">{organization.content}</p>
          <div className="flex mt-10">
            <DarkButton
              href={'https://' + organization.url}
              className="normal-case"
            >
              {firstLetterUppercase(organization.url)}
            </DarkButton>
          </div>
        </div>
      </div>
    </div>
  );
};
