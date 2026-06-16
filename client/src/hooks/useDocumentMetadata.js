import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Custom hook to dynamically update document title, meta descriptions,
 * canonical links, and Open Graph / Twitter tags for on-page SEO.
 */
export default function useDocumentMetadata({ title, description }) {
  const pathname = usePathname();
  const siteUrl = 'https://corematrix.vercel.app';
  const defaultTitle = 'CoreMatrix - Premium Fitness & Nutrition Tracker';
  const defaultDesc = 'CoreMatrix helps you forge workouts, log meals, track macronutrients, and analyze your lifting form with AI.';

  useEffect(() => {
    const finalTitle = title ? `${title} | CoreMatrix` : defaultTitle;
    document.title = finalTitle;

    const getOrCreateMeta = (attrName, attrValue) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      return element;
    };

    const getOrCreateLink = (relValue) => {
      let element = document.querySelector(`link[rel="${relValue}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', relValue);
        document.head.appendChild(element);
      }
      return element;
    };

    const finalDesc = description || defaultDesc;
    const metaDescription = getOrCreateMeta('name', 'description');
    metaDescription.setAttribute('content', finalDesc);

    const canonicalLink = getOrCreateLink('canonical');
    const currentCanonicalUrl = `${siteUrl}${pathname === '/' ? '' : pathname}`;
    canonicalLink.setAttribute('href', currentCanonicalUrl);

    const ogTitle = getOrCreateMeta('property', 'og:title');
    ogTitle.setAttribute('content', finalTitle);

    const ogDescription = getOrCreateMeta('property', 'og:description');
    ogDescription.setAttribute('content', finalDesc);

    const ogUrl = getOrCreateMeta('property', 'og:url');
    ogUrl.setAttribute('content', currentCanonicalUrl);

    const twitterTitle = getOrCreateMeta('name', 'twitter:title');
    twitterTitle.setAttribute('content', finalTitle);

    const twitterDescription = getOrCreateMeta('name', 'twitter:description');
    twitterDescription.setAttribute('content', finalDesc);

  }, [title, description, pathname]);
}
