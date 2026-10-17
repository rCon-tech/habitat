'use client';

import * as A from '@radix-ui/react-avatar';
import type { MemberDTO } from '@/modules/sdk/types';
import { cn, hashString, initials } from '@/lib/utils';

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
};

// Each person gets a steady colour of their own, so a thread of comments is easy to read at a glance.
const TINTS = ['#ff9b7a', '#7fb2ff', '#7fe0d6', '#b4a1ff', '#ffc866', '#ff8fa8', '#9ce0a6'];

export function displayName(m: Pick<MemberDTO, 'name' | 'nickname'> | null | undefined) {
  return m ? m.nickname || m.name : 'Former member';
}

export function MemberAvatar({
  member,
  size = 'md',
  className,
}: {
  member: Pick<MemberDTO, 'name' | 'image' | 'nickname'> | null | undefined;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const name = displayName(member);
  const tint = member ? TINTS[hashString(member.name) % TINTS.length] : '#c9d0de';
  return (
    <A.Root
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-[34%] font-display font-extrabold text-[#0b1220]',
        sizes[size],
        className,
      )}
      style={{ background: tint }}
    >
      {member?.image ? (
        <A.Image src={member.image} alt="" className="h-full w-full object-cover" />
      ) : null}
      <A.Fallback aria-hidden>{member ? initials(name) : '?'}</A.Fallback>
    </A.Root>
  );
}
