import { cn } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

type SessionProps = {
  displayName: string | null;
  pictureUrl?: string | null;
};

type TextProps = {
  text: string;
};

type ProfileAvatarProps = (SessionProps | TextProps) & {
  className?: string;
  fallbackClassName?: string;
};

export function ProfileAvatar(props: ProfileAvatarProps) {
  const avatarClassName = cn(
    props.className,
    'mx-auto size-8 group-focus:ring-2',
  );

  if ('text' in props) {
    return (
      <Avatar className={avatarClassName}>
        <AvatarFallback className={cn(props.fallbackClassName, 'uppercase')}>
          {props.text.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
    );
  }

  const initials = props.displayName?.slice(0, 1);

  return (
    <Avatar className={avatarClassName}>
      <AvatarImage src={props.pictureUrl || undefined} />

      <AvatarFallback className={cn(props.fallbackClassName, 'uppercase')}>
        <span suppressHydrationWarning className={'uppercase'}>
          {initials}
        </span>
      </AvatarFallback>
    </Avatar>
  );
}
