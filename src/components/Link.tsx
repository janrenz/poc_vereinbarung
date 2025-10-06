/**
 * Custom Link component that disables prefetching by default
 * This wraps Next.js Link to prevent automatic prefetching of all linked pages
 */
import NextLink, { LinkProps } from "next/link";
import React from "react";

interface CustomLinkProps extends Omit<LinkProps, "prefetch"> {
  prefetch?: boolean;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

export default function Link({
  prefetch = false,
  children,
  ...props
}: CustomLinkProps) {
  return (
    <NextLink prefetch={prefetch} {...props}>
      {children}
    </NextLink>
  );
}
