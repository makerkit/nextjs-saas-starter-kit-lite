import Image from 'next/image';

import { AtSign, Phone } from 'lucide-react';

const DEFAULT_IMAGE_SIZE = 18;

export function OauthProviderLogoImage({
  providerId,
  width,
  height,
}: {
  providerId: string;
  width?: number;
  height?: number;
}) {
  const image = getOAuthProviderLogos()[providerId];

  if (typeof image === `string`) {
    return (
      <Image
        decoding={'async'}
        /**
         * These sit inside the provider buttons on the auth pages, which are
         * above the fold and have little else to paint — Next.js reports the
         * first one as the LCP element, and lazy-loading the LCP element delays
         * it for no benefit. They are 18px webp assets, so eager is effectively
         * free.
         */
        loading={'eager'}
        src={image}
        alt={`${providerId} logo`}
        width={width ?? DEFAULT_IMAGE_SIZE}
        height={height ?? DEFAULT_IMAGE_SIZE}
      />
    );
  }

  return <>{image}</>;
}

function getOAuthProviderLogos(): Record<string, string | React.ReactNode> {
  return {
    password: <AtSign className={'s-[18px]'} />,
    phone: <Phone className={'s-[18px]'} />,
    google: '/images/oauth/google.webp',
    facebook: '/images/oauth/facebook.webp',
    twitter: <XLogo />,
    github: '/images/oauth/github.webp',
    microsoft: '/images/oauth/microsoft.webp',
    apple: '/images/oauth/apple.webp',
  };
}

function XLogo() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 300 300"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={'fill-secondary-foreground'}
        d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66"
      />
    </svg>
  );
}
