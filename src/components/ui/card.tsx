import * as React from "react";

import { mergeClasses } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) 
{
  return (
    <div
      data-slot="card"
      className={mergeClasses(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) 
{
  return (
    <div
      data-slot="card-header"
      className={mergeClasses(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) 
{
  return (
    <h4
      data-slot="card-title"
      className={mergeClasses("leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) 
{
  return (
    <p
      data-slot="card-description"
      className={mergeClasses("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) 
{
  return (
    <div
      data-slot="card-action"
      className={mergeClasses(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) 
{
  return (
    <div
      data-slot="card-content"
      className={mergeClasses("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) 
{
  return (
    <div
      data-slot="card-footer"
      className={mergeClasses("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
