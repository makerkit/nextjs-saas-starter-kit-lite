'use client';

import type { MouseEventHandler } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { UploadCloud, X } from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from '../shadcn/button';
import { Label } from '../shadcn/label';
import { If } from './if';

type Props = Omit<React.InputHTMLAttributes<unknown>, 'value'> & {
  image?: string | null;
  onClear?: () => void;
  onValueChange?: (props: { image: string; file: File }) => void;
  visible?: boolean;
} & React.ComponentPropsWithRef<'input'>;

const IMAGE_SIZE = 22;

export const ImageUploadInput: React.FC<Props> =
  function ImageUploadInputComponent({
    children,
    image,
    onClear,
    onInput,
    onValueChange,
    ref: forwardedRef,
    visible = true,
    ...props
  }) {
    const localRef = useRef<HTMLInputElement>(null);

    const [state, setState] = useState({
      image,
      fileName: '',
    });

    const onInputChange: React.InputEventHandler<HTMLInputElement> =
      useCallback(
        (e) => {
          e.preventDefault();

          const files = e.currentTarget.files;

          if (files?.length) {
            const file = files[0];

            if (!file) {
              return;
            }

            const data = URL.createObjectURL(file);

            setState({
              image: data,
              fileName: file.name,
            });

            if (onValueChange) {
              onValueChange({
                image: data,
                file,
              });
            }
          }

          if (onInput) {
            onInput(e);
          }
        },
        [onInput, onValueChange],
      );

    const onRemove = useCallback(() => {
      setState({
        image: '',
        fileName: '',
      });

      if (localRef.current) {
        localRef.current.value = '';
      }

      if (onClear) {
        onClear();
      }
    }, [onClear]);

    const imageRemoved: MouseEventHandler = useCallback(
      (e) => {
        e.preventDefault();

        onRemove();
      },
      [onRemove],
    );

    const setRef = useCallback(
      (input: HTMLInputElement) => {
        localRef.current = input;

        if (typeof forwardedRef === 'function') {
          forwardedRef(localRef.current);
        }
      },
      [forwardedRef],
    );

    if (image !== state.image) {
      setState((state) => ({ ...state, image }));
    }

    useEffect(() => {
      if (!image) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        onRemove();
      }
    }, [image, onRemove]);

    if (!visible) {
      return <Input {...props} onInput={onInputChange} ref={setRef} />;
    }

    return (
      <label
        id={'image-upload-input'}
        className={`border-input bg-background ring-primary ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring relative flex h-10 w-full cursor-pointer rounded-md border border-dashed px-3 py-2 text-sm ring-offset-2 outline-hidden transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium focus:ring-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <Input ref={setRef} onInput={onInputChange} />

        <div className={'flex items-center space-x-4'}>
          <div className={'flex'}>
            <If condition={!state.image}>
              <UploadCloud className={'text-muted-foreground h-5'} />
            </If>

            <If condition={state.image}>
              <Image
                loading={'lazy'}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                }}
                className={'object-contain'}
                width={IMAGE_SIZE}
                height={IMAGE_SIZE}
                src={state.image!}
                alt={props.alt ?? ''}
              />
            </If>
          </div>

          <If condition={!state.image}>
            <div className={'flex flex-auto'}>
              <Label className={'cursor-pointer text-xs'}>{children}</Label>
            </div>
          </If>

          <If condition={state.image}>
            <div className={'flex flex-auto'}>
              <If
                condition={state.fileName}
                fallback={
                  <Label className={'cursor-pointer truncate text-xs'}>
                    {children}
                  </Label>
                }
              >
                <Label className={'truncate text-xs'}>{state.fileName}</Label>
              </If>
            </div>
          </If>

          <If condition={state.image}>
            <Button
              size={'icon'}
              className={'h-5! w-5!'}
              onClick={imageRemoved}
            >
              <X className="h-4" />
            </Button>
          </If>
        </div>
      </label>
    );
  };

function Input(
  props: React.InputHTMLAttributes<unknown> & {
    ref: (input: HTMLInputElement) => void;
  },
) {
  return (
    <input
      {...props}
      className={cn('hidden', props.className)}
      type={'file'}
      accept="image/*"
      aria-labelledby={'image-upload-input'}
    />
  );
}
