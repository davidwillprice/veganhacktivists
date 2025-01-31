import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Controller, useForm } from 'react-hook-form';
import React, { useCallback, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { PlaygroundRequestCategory } from '@prisma/client';

import { DarkButton } from '../../decoration/buttons';
import Spinner from '../../decoration/spinner';
import TextArea from '../../forms/inputs/textArea';
import TextInput from '../../forms/inputs/textInput';
import Label from '../../forms/inputs/label';
import SelectInput from '../../forms/inputs/selectInput';
import Checkbox from '../../forms/inputs/checkbox';
import ToolTip from '../../decoration/tooltip';
import CustomLink from '../../decoration/link';
import useOnce from '../../../hooks/useOnce';
import {
  CATEGORY_DESCRIPTION,
  CATEGORY_LABELS,
} from '../../../../prisma/constants';

import SignInPrompt from './siginInPrompt';
import ConfirmationModal from './confirmationModal';

import { submitRequestSchemaClient } from 'lib/services/playground/schemas';
import usePlaygroundSubmitRequestStore from 'lib/stores/playground/submitRequestStore';
import { trpc } from 'lib/client/trpc';

import type { RefCallback } from 'react';
import type { AppRouter } from 'server/routers/_app';
import type { z } from 'zod';
import type { TRPCClientError } from '@trpc/react';

const CATEGORIES = Object.keys(PlaygroundRequestCategory).map((cat) => ({
  value: cat as PlaygroundRequestCategory,
  label: `${CATEGORY_LABELS[cat as PlaygroundRequestCategory]} (${
    CATEGORY_DESCRIPTION[cat as PlaygroundRequestCategory]
  })`,
}));

const IS_FREE_OPTIONS = [
  { label: 'Volunteer', value: true },
  { label: 'Paid', value: false },
];

type FormInput = z.infer<typeof submitRequestSchemaClient>;

const SubmitRequestForm: React.FC = () => {
  const { data: session, status: sessionStatus } = useSession();

  const storedForm = usePlaygroundSubmitRequestStore((state) =>
    state.getForm()
  );
  const setFormData = usePlaygroundSubmitRequestStore((state) =>
    state.setForm()
  );
  const clearFormData = usePlaygroundSubmitRequestStore((state) =>
    state.resetForm()
  );

  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const onModalClose = useCallback(() => {
    setIsSignInModalOpen(false);
  }, []);
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null);
  const [submitButtonRef, setSubminButtonRef] = useState<HTMLElement | null>(
    null
  );
  const router = useRouter();

  const {
    control,
    formState: { errors, isSubmitted, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<FormInput>({
    defaultValues: {
      ...storedForm,
      budget:
        storedForm.isFree || !storedForm.budget || isNaN(storedForm.budget)
          ? 0
          : storedForm.budget,
    },
    resolver: zodResolver(submitRequestSchemaClient),
  });

  const onChangeValue = useCallback(
    (name: keyof FormInput) => (value: unknown) => {
      setFormData({ [name]: value });
    },
    [setFormData]
  );

  const myRegister = useCallback<typeof register>(
    (name, options) => {
      return register(name, {
        ...options,
        onChange: (value) => {
          options?.onChange?.(value);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
          onChangeValue(name as any)(value.currentTarget?.value);
        },
      });
    },
    [onChangeValue, register]
  );

  const { data: lastSubmittedRequest, isSuccess: isLastRequestSuccess } =
    trpc.proxy.playground.getLastUserRequest.useQuery(undefined, {
      enabled: sessionStatus === 'authenticated',
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1,
    });

  useOnce(
    () => {
      if (!session?.user) return;
      const { name, email } = session.user;
      if (name && !watch('name')) {
        setValue('name', name);
        setFormData({ name });
      }
      if (email && !watch('providedEmail')) {
        setValue('providedEmail', email);
        setFormData({ providedEmail: email });
      }
    },
    {
      enabled:
        sessionStatus === 'authenticated' &&
        router.isReady &&
        router.query.submit !== 'true',
    }
  );

  const filledDataFromStorage = useOnce(
    () => {
      if (!lastSubmittedRequest) return;
      Object.entries(lastSubmittedRequest).forEach(([key, value]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (value && !watch(key as any)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setValue(key as any, value);
        }
      });
    },
    { enabled: isLastRequestSuccess }
  );

  const { mutateAsync, isLoading, isSuccess } =
    trpc.proxy.playground.submitRequest.useMutation({
      onSuccess: () => {
        clearFormData();
        reset();
      },
    });

  const onSubmit = useCallback(
    (values: trpc['playground']['submitRequest']['input']) => {
      if (sessionStatus === 'unauthenticated') {
        setIsSignInModalOpen(true);
        reset(undefined, {
          keepValues: true,
        });
        return;
      } else if (sessionStatus === 'loading') {
        reset(undefined, {
          keepValues: true,
        });
      }

      return toast.promise(mutateAsync(values), {
        pending: 'Submitting...',
        success: 'Your request has been submitted!',
        error: {
          render: ({ data }: { data?: TRPCClientError<AppRouter> }) => {
            return data?.message;
          },
        },
      });
    },
    [mutateAsync, reset, sessionStatus]
  );

  useEffect(() => {
    if (
      !router.isReady ||
      !formRef ||
      !submitButtonRef ||
      router.query.submit !== 'true' ||
      isSubmitted ||
      isSubmitting ||
      !filledDataFromStorage
    ) {
      return;
    }

    formRef.scrollIntoView({
      block: 'end',
    });

    void handleSubmit(onSubmit)();
  }, [
    formRef,
    submitButtonRef,
    handleSubmit,
    isSubmitted,
    isSubmitting,
    onSubmit,
    router.isReady,
    router.query.submit,
    filledDataFromStorage,
  ]);

  const isFree = watch('isFree');

  const [isBudgetHidden, setIsBudgetHidden] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    setIsBudgetHidden(isFree === true);
  }, [isFree]);

  return (
    <div className="px-10 bg-grey-background" id="contact-us">
      <form
        ref={setFormRef as RefCallback<HTMLElement>}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-5 py-10 mx-auto text-left md:grid-cols-2 md:max-w-3xl"
      >
        <div className="text-xl col-span-full">Personal Information</div>
        <TextInput
          className="w-full"
          placeholder="Name"
          showRequiredMark
          {...myRegister('name', { required: 'Please enter a name' })}
          error={errors.name?.message}
        />
        <TextInput
          className="w-full"
          placeholder="Email"
          showRequiredMark
          {...myRegister('providedEmail', {
            required: 'The email is required',
          })}
          error={errors.providedEmail?.message}
        >
          Email
        </TextInput>
        <TextInput
          className="w-full "
          placeholder="Phone"
          type="tel"
          {...myRegister('phone', { required: false })}
          error={errors.phone?.message}
        />
        <TextInput
          className="w-full "
          placeholder="Organization"
          {...myRegister('organization', { required: false })}
          error={errors.organization?.message}
        />
        <TextInput
          placeholder="www.website..."
          showRequiredMark
          {...myRegister('website', {
            required: 'Please enter a valid website',
          })}
          className="col-span-full"
          error={errors.website?.message}
        />
        <TextInput
          showRequiredMark
          placeholder="Calendly"
          className="col-span-full"
          {...myRegister('calendlyUrl')}
          error={errors.calendlyUrl?.message}
        >
          Link to your Calendly
          <ToolTip
            placement="top-end"
            content={
              <p>
                <CustomLink href="https://calendly.com/" className="text-green">
                  Calendly
                </CustomLink>
                &nbsp;is your hub for scheduling meetings professionally and
                efficiently, eliminating the hassle of back-and-forth emails so
                you can get back to work.
              </p>
            }
          >
            <sup className="ml-1">?</sup>
          </ToolTip>
        </TextInput>

        <div className="text-xl col-span-full">Request Information</div>
        <TextInput
          placeholder="Title of Request"
          showRequiredMark
          {...myRegister('title', {
            required: 'Please enter the title of the request',
          })}
          className="col-span-full"
          error={errors.title?.message}
        >
          Title of Request
        </TextInput>
        <div className="col-span-full">
          <Label name="category" showRequiredMark />
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Please select a category of the request' }}
            render={({ field: { value: current, onChange, ...field } }) => (
              <SelectInput
                {...field}
                current={CATEGORIES.find((c) => c.value === current) || null}
                error={errors.category?.message}
                options={CATEGORIES}
                onChange={(option) => {
                  onChange(option?.value || null);
                  setFormData({
                    category: option?.value as PlaygroundRequestCategory,
                  });
                }}
              />
            )}
          />
        </div>
        <TextInput
          className="w-full col-span-full"
          placeholder="Communication, ..."
          {...myRegister('requiredSkills', {
            required: 'Please select the skills required for the request',
          })}
          error={errors.requiredSkills?.message}
        >
          <div className="flex flex-col md:flex-row">
            <p>
              Skills Required<span className="text-red">*</span>&nbsp;
            </p>
            <p className="font-thin">(separate by comma)</p>
          </div>
        </TextInput>
        <div className="w-full ">
          <Label name="isFree" showRequiredMark>
            Volunteer or Paid?
          </Label>
          <Controller
            control={control}
            name="isFree"
            render={({ field: { value, onChange, ...field } }) => (
              <SelectInput
                {...field}
                error={errors.isFree?.message}
                current={IS_FREE_OPTIONS.find((c) => c.value === value) || null}
                onChange={(option) => {
                  const value = (option?.value as boolean) ?? null;
                  onChange(value);
                  setFormData({
                    isFree: value,
                  });
                }}
                options={IS_FREE_OPTIONS}
              />
            )}
          />
          {errors.isFree?.message && (
            <span className="text-red">⚠ {errors.isFree.message}</span>
          )}
        </div>

        <TextInput
          hidden={isBudgetHidden}
          className="w-full"
          placeholder="Budget"
          type="number"
          inputMode="numeric"
          step={50}
          min={0}
          showRequiredMark
          {...myRegister('budget', { valueAsNumber: true })}
          error={errors.budget?.message}
        >
          Budget?
        </TextInput>
        <TextArea
          placeholder="Please describe the task and be as detailed as possible. The more detail your request has, the easier it is for both the volunteer and for us!"
          showRequiredMark
          error={errors.description?.message}
          {...myRegister('description', {
            required: 'Issue description is required',
          })}
          style={{ resize: 'vertical' }}
          className="col-span-full"
        >
          Describe your issue
        </TextArea>
        <TextInput
          className="w-full mt-6 sm:mt-0"
          min={new Date().toISOString().split('T')[0]}
          type="date"
          placeholder="Due date"
          showRequiredMark
          {...myRegister('dueDate', {
            valueAsDate: true,
          })}
          error={errors.dueDate?.message}
        >
          Due date for task
        </TextInput>
        <TextInput
          className="w-full"
          type="number"
          min={0}
          placeholder="Days"
          showRequiredMark
          {...myRegister('estimatedTimeDays', { valueAsNumber: true })}
          error={errors.estimatedTimeDays?.message}
        >
          Estimated time <br className="sm:hidden" /> commitment
        </TextInput>
        <Checkbox
          labelPosition="right"
          className="col-span-full"
          error={errors.qualityAgreement?.message}
          {...myRegister('qualityAgreement')}
          onChange={(checked) => {
            setFormData({ qualityAgreement: checked });
            setValue('qualityAgreement', checked);
          }}
        >
          I understand that Vegan Hacktivists cannot guarantee the quality of
          work done by our volunteers.
        </Checkbox>
        <Checkbox
          labelPosition="right"
          className="col-span-full"
          error={errors.agreeToTerms?.message}
          {...myRegister('agreeToTerms')}
          onChange={(checked) => {
            setFormData({ agreeToTerms: checked });
            setValue('agreeToTerms', checked);
          }}
        >
          I agree to the VH: Playground terms and conditions.
        </Checkbox>
        <DarkButton
          ref={setSubminButtonRef}
          className="mb-10 text-center w-fit md:w-72"
          disabled={isLoading || isSuccess}
          type="submit"
        >
          {isLoading ? <Spinner /> : 'Submit My Request'}
        </DarkButton>
      </form>
      <ConfirmationModal isOpen={isSuccess} type="request" />
      <SignInPrompt
        isOpen={isSignInModalOpen}
        onClose={onModalClose}
        email={watch('providedEmail')}
        submitOnVerify
      />
    </div>
  );
};

export default SubmitRequestForm;
