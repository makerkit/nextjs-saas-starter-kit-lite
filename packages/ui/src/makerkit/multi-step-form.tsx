'use client';

import React, {
  HTMLProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Slot, Slottable } from '@radix-ui/react-slot';
import { useMutation } from '@tanstack/react-query';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '../lib/utils';

interface MultiStepFormProps<T extends z.ZodType<FieldValues>> {
  schema: T;
  form: UseFormReturn<z.infer<T>>;
  onSubmit: (data: z.infer<T>) => void;
  useStepTransition?: boolean;
  className?: string;
}

type StepProps = React.PropsWithChildren<
  {
    name: string;
    asChild?: boolean;
  } & React.HTMLProps<HTMLDivElement>
>;

const MultiStepFormContext = createContext<ReturnType<
  typeof useMultiStepForm
> | null>(null);

/**
 * @name MultiStepForm
 * @description Multi-step form component for React
 * @param schema
 * @param form
 * @param onSubmit
 * @param children
 * @param className
 * @constructor
 */
export function MultiStepForm<T extends z.ZodType<FieldValues>>({
  schema,
  form,
  onSubmit,
  children,
  className,
}: React.PropsWithChildren<MultiStepFormProps<T>>) {
  const steps = useMemo(
    () =>
      React.Children.toArray(children).filter(
        (child): child is React.ReactElement<StepProps> =>
          React.isValidElement(child) && child.type === MultiStepFormStep,
      ),
    [children],
  );

  const header = useMemo(() => {
    return React.Children.toArray(children).find(
      (child) =>
        React.isValidElement(child) && child.type === MultiStepFormHeader,
    );
  }, [children]);

  const footer = useMemo(() => {
    return React.Children.toArray(children).find(
      (child) =>
        React.isValidElement(child) && child.type === MultiStepFormFooter,
    );
  }, [children]);

  const stepNames = steps.map((step) => step.props.name);
  const multiStepForm = useMultiStepForm(schema, form, stepNames, onSubmit);

  return (
    <MultiStepFormContext.Provider
      // the context is shared by forms with different schemas, so the
      // per-schema type cannot line up with the context's own type
      value={multiStepForm as unknown as ReturnType<typeof useMultiStepForm>}
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(className, 'flex size-full flex-col overflow-hidden')}
      >
        {header}

        <div className="relative transition-transform duration-500">
          {steps.map((step, index) => {
            const isActive = index === multiStepForm.currentStepIndex;

            return (
              <AnimatedStep
                key={step.props.name}
                direction={multiStepForm.direction}
                isActive={isActive}
                index={index}
                currentIndex={multiStepForm.currentStepIndex}
              >
                {step}
              </AnimatedStep>
            );
          })}
        </div>

        {footer}
      </form>
    </MultiStepFormContext.Provider>
  );
}

export function MultiStepFormContextProvider(props: {
  children: (context: ReturnType<typeof useMultiStepForm>) => React.ReactNode;
}) {
  const ctx = useMultiStepFormContext();

  if (Array.isArray(props.children)) {
    const [child] = props.children;

    return (
      child as (context: ReturnType<typeof useMultiStepForm>) => React.ReactNode
    )(ctx);
  }

  return props.children(ctx);
}

export const MultiStepFormStep: React.FC<
  React.PropsWithChildren<
    {
      asChild?: boolean;
      ref?: React.Ref<HTMLDivElement>;
    } & HTMLProps<HTMLDivElement>
  >
> = function MultiStepFormStep({ children, asChild, ...props }) {
  const Cmp = asChild ? Slot : 'div';

  return (
    <Cmp {...props}>
      <Slottable>{children}</Slottable>
    </Cmp>
  );
};

export function useMultiStepFormContext<
  Schema extends z.ZodType<FieldValues>,
>() {
  const context = useContext(MultiStepFormContext) as unknown as ReturnType<
    typeof useMultiStepForm<Schema>
  >;

  if (!context) {
    throw new Error(
      'useMultiStepFormContext must be used within a MultiStepForm',
    );
  }

  return context;
}

/**
 * @name useMultiStepForm
 * @description Hook for multi-step forms
 * @param schema
 * @param form
 * @param stepNames
 * @param onSubmit
 */
export function useMultiStepForm<Schema extends z.ZodType<FieldValues>>(
  schema: Schema,
  form: UseFormReturn<z.infer<Schema>>,
  stepNames: string[],
  onSubmit: (data: z.infer<Schema>) => void,
) {
  const [state, setState] = useState({
    currentStepIndex: 0,
    direction: undefined as 'forward' | 'backward' | undefined,
  });

  const isStepValid = useCallback(() => {
    const currentStepName = stepNames[state.currentStepIndex] as Path<
      z.TypeOf<Schema>
    >;

    if (schema instanceof z.ZodObject) {
      const currentStepSchema = schema.shape[currentStepName] as z.ZodType;

      // the user may not want to validate the current step
      // or the step doesn't contain any form field
      if (!currentStepSchema) {
        return true;
      }

      const currentStepData = form.getValues(currentStepName) ?? {};
      const result = currentStepSchema.safeParse(currentStepData);

      return result.success;
    }

    throw new Error(`Unsupported schema type: ${schema.constructor.name}`);
  }, [schema, form, stepNames, state.currentStepIndex]);

  const nextStep = useCallback(
    <Ev extends React.SyntheticEvent>(e: Ev) => {
      // prevent form submission when the user presses Enter
      // or if the user forgets [type="button"] on the button
      e.preventDefault();

      const isValid = isStepValid();

      if (!isValid) {
        const currentStepName = stepNames[state.currentStepIndex] as Path<
          z.TypeOf<Schema>
        >;

        if (schema instanceof z.ZodObject) {
          const currentStepSchema = schema.shape[currentStepName] as z.ZodType;

          if (currentStepSchema) {
            const fields = Object.keys(
              (currentStepSchema as z.ZodObject<never>).shape,
            );

            const keys = fields.map((field) => `${currentStepName}.${field}`);

            // trigger validation for all fields in the current step
            for (const key of keys) {
              void form.trigger(key as Path<z.TypeOf<Schema>>);
            }

            return;
          }
        }
      }

      if (isValid && state.currentStepIndex < stepNames.length - 1) {
        setState((prevState) => {
          return {
            ...prevState,
            direction: 'forward',
            currentStepIndex: prevState.currentStepIndex + 1,
          };
        });
      }
    },
    [isStepValid, state.currentStepIndex, stepNames, schema, form],
  );

  const prevStep = useCallback(
    <Ev extends React.SyntheticEvent>(e: Ev) => {
      // prevent form submission when the user presses Enter
      // or if the user forgets [type="button"] on the button
      e.preventDefault();

      if (state.currentStepIndex > 0) {
        setState((prevState) => {
          return {
            ...prevState,
            direction: 'backward',
            currentStepIndex: prevState.currentStepIndex - 1,
          };
        });
      }
    },
    [state.currentStepIndex],
  );

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < stepNames.length && isStepValid()) {
        setState((prevState) => {
          return {
            ...prevState,
            direction:
              index > prevState.currentStepIndex ? 'forward' : 'backward',
            currentStepIndex: index,
          };
        });
      }
    },
    [isStepValid, stepNames.length],
  );

  const isValid = form.formState.isValid;
  const errors = form.formState.errors;

  const mutation = useMutation({
    mutationFn: () => {
      return form.handleSubmit(onSubmit)();
    },
  });

  return useMemo(
    () => ({
      form,
      currentStep: stepNames[state.currentStepIndex] as string,
      currentStepIndex: state.currentStepIndex,
      totalSteps: stepNames.length,
      isFirstStep: state.currentStepIndex === 0,
      isLastStep: state.currentStepIndex === stepNames.length - 1,
      nextStep,
      prevStep,
      goToStep,
      direction: state.direction,
      isStepValid,
      isValid,
      errors,
      mutation,
    }),
    [
      form,
      mutation,
      stepNames,
      state.currentStepIndex,
      state.direction,
      nextStep,
      prevStep,
      goToStep,
      isStepValid,
      isValid,
      errors,
    ],
  );
}

export const MultiStepFormHeader: React.FC<
  React.PropsWithChildren<
    {
      asChild?: boolean;
    } & HTMLProps<HTMLDivElement>
  >
> = function MultiStepFormHeader({ children, asChild, ...props }) {
  const Cmp = asChild ? Slot : 'div';

  return (
    <Cmp {...props}>
      <Slottable>{children}</Slottable>
    </Cmp>
  );
};

export const MultiStepFormFooter: React.FC<
  React.PropsWithChildren<
    {
      asChild?: boolean;
    } & HTMLProps<HTMLDivElement>
  >
> = function MultiStepFormFooter({ children, asChild, ...props }) {
  const Cmp = asChild ? Slot : 'div';

  return (
    <Cmp {...props}>
      <Slottable>{children}</Slottable>
    </Cmp>
  );
};

/**
 * @name createStepSchema
 * @description Create a schema for a multi-step form
 * @param steps
 */
export function createStepSchema<T extends Record<string, z.ZodType>>(
  steps: T,
) {
  return z.object(steps);
}

interface AnimatedStepProps {
  direction: 'forward' | 'backward' | undefined;
  isActive: boolean;
  index: number;
  currentIndex: number;
}

function AnimatedStep({
  isActive,
  direction,
  children,
  index,
  currentIndex,
}: React.PropsWithChildren<AnimatedStepProps>) {
  const [shouldRender, setShouldRender] = useState(isActive);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);

      return () => clearTimeout(timer);
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive && stepRef.current) {
      const focusableElement = stepRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElement) {
        (focusableElement as HTMLElement).focus();
      }
    }
  }, [isActive]);

  if (!shouldRender) {
    return null;
  }

  const baseClasses =
    ' top-0 left-0 w-full h-full transition-all duration-300 ease-in-out animate-in fade-in zoom-in-95';

  const visibilityClasses = isActive ? 'opacity-100' : 'opacity-0 absolute';

  const transformClasses = cn(
    'translate-x-0',
    isActive
      ? {}
      : {
          '-translate-x-full': direction === 'forward' || index < currentIndex,
          'translate-x-full': direction === 'backward' || index > currentIndex,
        },
  );

  const className = cn(baseClasses, visibilityClasses, transformClasses);

  return (
    <div ref={stepRef} className={className} aria-hidden={!isActive}>
      {children}
    </div>
  );
}
