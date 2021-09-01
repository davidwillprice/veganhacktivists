import axios from 'axios';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import type { GrantsForm } from '../../../pages/api/grant-request';
import { DarkButton } from '../../decoration/buttons';
import Checkbox from '../../forms/inputs/checkbox';
import TextArea from '../../forms/inputs/textArea';
import TextInput from '../../forms/inputs/textInput';

const FormSection: React.FC<{ section: string; sectionName: string }> = ({
  children,
  section,
  sectionName,
}) => {
  return (
    <div className="py-10 pt-5">
      <div>
        <h4 className="text-5xl capitalize font-bold font-mono pb-10">
          Section {section} - {sectionName}
        </h4>
      </div>
      <div className="space-y-2 text-left">{children}</div>
    </div>
  );
};

const REQUIRED_FIELD = 'This field is required';

const GrantsApplication: React.FC = () => {
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<GrantsForm>({});

  const onSubmit = useCallback<(data: GrantsForm) => Promise<void>>(
    async (data) => {
      try {
        await axios.post('/api/grant-request', data);
      } catch (e) {}
    },
    []
  );

  return (
    <div className="p-12 bg-gray-background">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-screen-lg mx-auto text-center mb-24"
      >
        <h3 className="text-4xl font-mono font-semibold mb-10 mt-12">
          Application Form
        </h3>
        <FormSection section="A" sectionName="About you">
          <TextInput
            error={errors.name?.message}
            {...register('name', { required: REQUIRED_FIELD })}
          >
            What&apos;s your name?
          </TextInput>
          <Checkbox {...register('over18', {})}>Are you over 18?</Checkbox>
          {!watch('over18') && (
            <div>
              <i>
                If you&apos;re under 18 the form must be filled by your parent
                or legal guardian
              </i>
            </div>
          )}

          <TextInput error={errors.gender?.message} {...register('gender', {})}>
            Gender <span className="text-sm">(optional)</span>
          </TextInput>
          <TextInput
            error={errors.location?.message}
            {...register('location', { required: REQUIRED_FIELD })}
          />
          <TextArea
            error={errors.info?.message}
            {...register('info', { required: REQUIRED_FIELD })}
          >
            Give us a sense of who you are
            <div className="font-normal">
              Your project is important to us and we&apos;ll get to that, but
              the person you are is an equally important part of our process and
              we&apos;d like to get to know you. Share with us what values guide
              you through your life and how those values influence the way you
              choose to grow as a person or share whatever you&apos;d like us to
              know about you!
            </div>
          </TextArea>

          <TextInput
            {...register('email', {
              required: REQUIRED_FIELD,
              pattern: {
                value:
                  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i,
                message: 'Please enter a valid email',
              },
            })}
            error={errors.email?.message}
          >
            What&apos;s your email?
          </TextInput>
        </FormSection>

        <FormSection section="B" sectionName="Your project">
          <TextInput
            error={errors.projectName?.message}
            {...register('projectName', { required: REQUIRED_FIELD })}
          >
            What do you call your project?
            <div className="font-normal">
              The name of the project will help us understand the focus of it.
              Please keep it brief and simple
            </div>
          </TextInput>
          <TextArea
            {...register('projectInfo', { required: REQUIRED_FIELD })}
            error={errors.projectInfo?.message}
          >
            Tell us about the project you&apos;re seeking funding for
            <div className="font-normal">
              Please include the overall goal you wish to achieve for your
              project
            </div>
          </TextArea>
          <TextInput
            error={errors.projectLocation?.message}
            {...register('projectLocation', { required: REQUIRED_FIELD })}
          >
            Where does your project take place?
          </TextInput>

          <TextArea
            {...register('projectSteps', { required: REQUIRED_FIELD })}
            error={errors.projectSteps?.message}
          >
            What steps will you take to carry out this project?
            <div className="font-normal">
              Please include specific project objectives and activities
            </div>
          </TextArea>

          <TextArea
            {...register('targetAudience', { required: REQUIRED_FIELD })}
            error={errors.targetAudience?.message}
          >
            Who is your target audience with this project?
            <div className="font-normal">
              Do you target institutions, indivuiduals, or something else? How
              will targeting this group create change for farmed animals?
            </div>
          </TextArea>

          <TextArea
            {...register('howSuccessful', { required: REQUIRED_FIELD })}
            error={errors.howSuccessful?.message}
          >
            How will you know if your project is successful?
            <div className="font-normal">
              Please share with us how you will evaluate your impact
            </div>
          </TextArea>

          <TextArea
            {...register('otherOrgs', { required: REQUIRED_FIELD })}
            error={errors.otherOrgs?.message}
          >
            Will other organizations be involved on this project?
            <div className="font-normal">
              Please share with us any other organizations who will work on the
              proposed project in partnership with you. Please include any
              relationships your organization has with local, national and where
              appropiate, international partners
            </div>
          </TextArea>
        </FormSection>

        <FormSection section="D" sectionName="Budget">
          <div>
            Your project&apos;s budget is a very important part of your
            application. Our team often uses this information to support their
            final decisions. Keep in mind that the budget items you list are
            ones that will serve to complete your proposed project, so be very
            specific in how the requested funding will be used.
          </div>
          <div>
            Please note, all information in this section should be given in{' '}
            <b>US Dollars</b> (US$).
          </div>

          <TextInput
            type="number"
            error={errors.totalBudget?.message}
            {...register('totalBudget', {
              required: REQUIRED_FIELD,
              min: { value: 0, message: 'Please enter a positive value' },
            })}
          >
            How much is the total budget for the project?
            <div className="font-normal">
              Please tell us the total cost of the project. This amount should
              include the expenditure for all activities associated with the
              project
            </div>
          </TextInput>

          <TextInput
            type="number"
            error={errors.appliedBudget?.message}
            {...register('appliedBudget', {
              required: REQUIRED_FIELD,
              min: { value: 0, message: 'Please enter a positive value' },
              max: {
                value: 1000,
                message: 'We can only accept applications for up to $1000 USD',
              },
            })}
          >
            How much are you applying for?
            <div className="font-normal">
              We can only accept applications for up to $1000 USD
            </div>
          </TextInput>

          <TextArea
            {...register('fundsUsage', { required: REQUIRED_FIELD })}
            error={errors.fundsUsage?.message}
          >
            What will the funds be used for?
            <div className="font-normal">
              Please list each budget item and the associated cost. The total
              should equal the total funding you are requesting from TPP.
              Example:
              <ul className="list-disc list-inside">
                <li>1 1lb bag of corn - $5</li>
                <li>3 Garden Shovels - $35</li>
              </ul>
            </div>
          </TextArea>

          <Checkbox
            error={errors.canAcceptFunding?.message}
            {...register('canAcceptFunding', {
              required: REQUIRED_FIELD,
            })}
            description={
              <>
                I confirm that I have a bank or PayPal account that is in my
                name or my organization&apos;s name and that can receive grant
                payments in US Dollars. I confirm my understanding that - with
                the exception of my fiscal sponsor, if applicable - TPP is
                unable to make grant payments to any other person or entity on
                my behalf. I understand that if TPP reviews my proposal and
                decides to make an offer of funding, that offer is conditional
                on the ability to accept funds to an account in my name or in my
                organization&apos;s name.
              </>
            }
          >
            Please confirm your ability to accept funding
          </Checkbox>
        </FormSection>

        <DarkButton className="font-mono uppercase w-64 mt-10">
          Submit
        </DarkButton>
      </form>
    </div>
  );
};

export default GrantsApplication;
