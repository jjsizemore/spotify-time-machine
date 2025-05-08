import React from 'react';
import Link from 'next/link';

interface FeatureCardProps {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  className?: string;
}

export default function FeatureCard({
  title,
  description,
  buttonText,
  href,
  className = ''
}: FeatureCardProps) {
  return (
    <Link href={href} className="block">
      <div className={`bg-spotify-dark-gray p-6 rounded-lg hover:bg-spotify-dark-gray/80 transition cursor-pointer h-full ${className}`}>
        <h2 className="text-2xl font-bold text-spotify-green mb-4">{title}</h2>
        <p className="text-spotify-light-gray mb-4">{description}</p>
        <button className="bg-spotify-green text-spotify-black font-bold px-4 py-2 rounded-full hover:bg-spotify-green/90 transition">
          {buttonText}
        </button>
      </div>
    </Link>
  );
}