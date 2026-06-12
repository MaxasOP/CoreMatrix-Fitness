import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to dynamically update document title, meta descriptions,
 * canonical links, and Open Graph / Twitter tags for on-page SEO.
 * 
 * @param {Object} metadata
 * @param {string} metadata.title - The title of the page
 * @param {string} metadata.description - The meta description of the page
 */
export default function useDocumentMetadata({ title, description }) {
  const location = useLocation();
  const siteUrl = 'https://corematrix.vercel.app'; // Production URL/Domain fallback
  const defaultTitle = 'CoreMatrix - Premium Fitness & Nutrition Tracker';
  const defaultDesc = 'CoreMatrix helps you forge workouts, log meals, track macronutrients, and analyze your lifting form with AI.';

  useEffect(() => {
    // 1. Update Document Title
    const finalTitle = title ? `${title} | CoreMatrix` : defaultTitle;
    document.title = finalTitle;

    // Helper to get or create a meta tag
    const getOrCreateMeta = (attrName, attrValue) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      return element;
    };

    // Helper to get or create a link tag
    const getOrCreateLink = (relValue) => {
      let element = document.querySelector(`link[rel="${relValue}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', relValue);
        document.head.appendChild(element);
      }
      return element;
    };

    // 2. Update Meta Description
    const finalDesc = description || defaultDesc;
    const metaDescription = getOrCreateMeta('name', 'description');
    metaDescription.setAttribute('content', finalDesc);

    // 3. Update Canonical URL
    const canonicalLink = getOrCreateLink('canonical');
    const currentCanonicalUrl = `${siteUrl}${location.pathname === '/' ? '' : location.pathname}`;
    canonicalLink.setAttribute('href', currentCanonicalUrl);

    // 4. Update Open Graph (OG) Tags
    const ogTitle = getOrCreateMeta('property', 'og:title');
    ogTitle.setAttribute('content', finalTitle);

    const ogDescription = getOrCreateMeta('property', 'og:description');
    ogDescription.setAttribute('content', finalDesc);

    const ogUrl = getOrCreateMeta('property', 'og:url');
    ogUrl.setAttribute('content', currentCanonicalUrl);

    // 5. Update Twitter Card Tags
    const twitterTitle = getOrCreateMeta('name', 'twitter:title');
    twitterTitle.setAttribute('content', finalTitle);

    const twitterDescription = getOrCreateMeta('name', 'twitter:description');
    twitterDescription.setAttribute('content', finalDesc);

  }, [title, description, location.pathname]);
}
