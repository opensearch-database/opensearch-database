// ==UserScript==
// @name        Add missing OpenSearch
// @namespace   https://github.com/KokaKiwi
// @version     0.1.0
// @author      KokaKiwi
// @license     BSD-3-Clause
// @include     /^https://*.githubusercontent.com/*$/
// @run-at      document-start
// @connect     githubusercontent.com
// @connect     raw.githubusercontent.com
// ==/UserScript==

(async () => {
  if (!document.querySelector('link[rel="search"]')) {
    const hostname = location.hostname.split('.').splice(-2).join('.');

    const link = document.createElement('link');
    link.rel = 'search';
    link.type = 'application/opensearchdescription+xml';
    link.href = `https://raw.githubusercontent.com/opensearch-database/opensearch-database/master/data/${hostname}.xml`;
    link.title = hostname;
    document.head.appendChild(link);
  }
})();
