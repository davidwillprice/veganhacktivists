import { NextSeo } from 'next-seo';

import { pixelHeart } from '../images/separators';

import ContactUsForm from 'components/forms/contactUs';
import { FirstSubSection } from 'components/decoration/textBlocks';
import SquareField from 'components/decoration/squares';
import CustomImage from 'components/decoration/customImage';

const Contact: React.FC = () => {
  return (
    <>
      <NextSeo title="Contact Us" />
      <SquareField
        squares={[
          { size: 16, top: 0, color: 'grey-light' },
          { size: 16, top: 16, left: 16, color: 'grey-light' },
          { size: 24, top: 0, right: 0, color: 'grey' },
        ]}
        className="hidden md:block"
      />
      <div className="px-5 bg-grey-background">
        <div className="pt-10">
          <CustomImage
            src={pixelHeart}
            alt=""
            height={pixelHeart.height / 2}
            width={pixelHeart.width / 2}
          />
        </div>
        <FirstSubSection
          header="Get in contact"
          firstWordsNum={2}
          className="my-0"
        >
          If you&apos;d like to get in touch with us, please use our contact
          form below! We do our best to respond to every email within 48 hours.
          Please make sure to check your spam folder!
        </FirstSubSection>

        <ContactUsForm />
      </div>
    </>
  );
};

export default Contact;
