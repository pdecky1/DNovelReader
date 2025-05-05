import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

const SEO: React.FC<SEOProps> = ({
  title = 'NovelVerse',
  description = 'Discover and share amazing stories from writers around the world.',
  children,
}) => {
  const fullTitle = title === 'NovelVerse' ? title : `${title} | NovelVerse`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {children}
    </Helmet>
  );
};

export default SEO;