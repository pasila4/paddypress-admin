import * as React from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

type CheckedState = boolean | 'indeterminate';

type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'defaultChecked' | 'onChange'
> & {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, checked, defaultChecked, disabled, onCheckedChange, ...props },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
        }
      },
      [ref],
    );

    React.useEffect(() => {
      if (!inputRef.current) return;
      inputRef.current.indeterminate = checked === 'indeterminate';
    }, [checked]);

    React.useEffect(() => {
      if (!inputRef.current) return;
      inputRef.current.indeterminate = defaultChecked === 'indeterminate';
    }, [defaultChecked]);

    const resolvedChecked = checked === 'indeterminate' ? false : checked;
    const resolvedDefaultChecked =
      defaultChecked === 'indeterminate' ? false : defaultChecked;

    const dataState: CheckedState =
      checked === 'indeterminate'
        ? 'indeterminate'
        : resolvedChecked
          ? true
          : false;

    return (
      <label
        className={cn(
          'peer relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-input bg-background',
          'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          dataState !== false ? 'bg-primary text-primary-foreground' : null,
          className,
        )}
        data-state={
          dataState === 'indeterminate'
            ? 'indeterminate'
            : dataState
              ? 'checked'
              : 'unchecked'
        }
        aria-disabled={disabled}
      >
        <input
          ref={setRefs}
          type="checkbox"
          disabled={disabled}
          checked={resolvedChecked}
          defaultChecked={resolvedDefaultChecked}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled) return;
            onCheckedChange?.(event.target.checked);
          }}
          className={cn(
            'absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0',
            disabled ? 'cursor-not-allowed' : null,
          )}
          {...props}
        />
        {dataState !== false ? (
          <Check className="pointer-events-none h-4 w-4" />
        ) : null}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
