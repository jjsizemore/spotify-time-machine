import Script from 'next/script';
import React from 'react';
import { generateBreadcrumbSchema } from '@/lib/seo';

export interface BreadcrumbItem {
  name: string;
  url: string;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // Ensure the last item is marked as current
  const breadcrumbItems = items.map((item, index) => ({
    ...item,
    isCurrent: index === items.length - 1,
  }));

  return (
    <>
      {/* Breadcrumb Schema for SEO */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(items)),
        }}
      />

      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
        <ol className="flex items-center space-x-2 text-sm text-spotify-light-gray">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.url}>
              <li>
                {item.isCurrent ? (
                  <span className="text-spotify-green font-medium" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <a href={item.url} className="hover:text-spotify-green transition-colors">
                    {item.name}
                  </a>
                )}
              </li>
              {index < breadcrumbItems.length - 1 && (
                <li className="text-spotify-gray" aria-hidden="true">
                  /
                </li>
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>
    </>
  );
}
