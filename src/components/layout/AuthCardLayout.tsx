import type * as React from 'react';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

type AuthCardLayoutProps = React.ComponentProps<'div'> & {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  belowCard?: React.ReactNode;
};

export function AuthCardLayout({
  className,
  title,
  subtitle,
  imageSrc,
  imageAlt,
  belowCard,
  children,
  ...props
}: AuthCardLayoutProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen w-full items-center justify-center bg-background p-4 text-foreground',
        className,
      )}
      {...props}
    >
      <div className="flex w-full max-w-4xl flex-col gap-6">
        <Card className="p-0 py-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-semibold">{title}</h1>
                {subtitle ? (
                  <p className="text-muted-foreground text-balance">
                    {subtitle}
                  </p>
                ) : null}
              </div>
              <div className="mt-6">{children}</div>
            </div>
            <div className="bg-muted relative hidden md:block">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={imageAlt ?? ''}
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-muted to-background" />
              )}
            </div>
          </CardContent>
        </Card>
        {belowCard ? <div className="px-6 text-center">{belowCard}</div> : null}
      </div>
    </div>
  );
}
