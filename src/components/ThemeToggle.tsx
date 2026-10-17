'use client';

import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';

type Choice = 'system' | 'light' | 'dark';
const KEY = 'habitat-theme';

function read(): Choice {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function apply(c: Choice) {
  if (c === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', c);
  try {
    if (c === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, c);
  } catch {
    // private mode: the choice just won't persist
  }
}

/** Menu items for choosing light, dark or the device's setting. Put inside a dropdown menu. */
export function ThemeMenuItems() {
  const [choice, setChoice] = useState<Choice>(() =>
    typeof window === 'undefined' ? 'system' : read(),
  );
  const items: Array<[Choice, string, typeof Sun]> = [
    ['system', 'Match my device', Monitor],
    ['light', 'Light', Sun],
    ['dark', 'Dark', Moon],
  ];
  return (
    <>
      <DropdownMenuLabel>Appearance</DropdownMenuLabel>
      {items.map(([value, label, Icon]) => (
        <DropdownMenuItem
          key={value}
          onSelect={(e) => {
            e.preventDefault();
            setChoice(value);
            apply(value);
          }}
        >
          <Icon size={16} /> {label}
          {choice === value && <Check size={16} className="ml-auto text-link" />}
        </DropdownMenuItem>
      ))}
    </>
  );
}

/** Runs before first paint so a saved choice never flashes the wrong theme. */
export const THEME_INIT = `try{var t=localStorage.getItem('${KEY}');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;
