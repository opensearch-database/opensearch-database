// ==UserScript==
// @name        Add missing OpenSearch
// @namespace   https://github.com/opensearch-database/opensearch-database
// @version     0.1.2
// @author      KokaKiwi
// @license     BSD-3-Clause
// @homepageURL https://github.com/opensearch-database/opensearch-database
// @downloadURL https://raw.githubusercontent.com/opensearch-database/opensearch-database/main/MissingOpenSearch.user.js
// @updateURL   https://raw.githubusercontent.com/opensearch-database/opensearch-database/main/MissingOpenSearch.user.js
// @supportURL  https://github.com/opensearch-database/opensearch-database/issues
// @inject-into content
// @run-at      document-start
// @noframes
// @connect     raw.githubusercontent.com
// ==/UserScript==

(function() {
  const fetchMetadatas = async (hostname) => {
    const metadata_url = `https://raw.githubusercontent.com/opensearch-database/opensearch-database/main/data/${hostname}/metadata.json`;

    const result = await fetch(metadata_url);
    return result.json();
  };

  const makeLink = (metadata) => {
    const link = document.createElement('link');
    link.rel = 'search';
    link.type = 'application/opensearchdescription+xml';
    link.href = `https://raw.githubusercontent.com/opensearch-database/opensearch-database/main/data/${hostname}/${metadata.id}.xml`;
    link.title = metadata.title;

    document.head.appendChild(link);
  };

  let hostname = location.hostname;
  if (hostname.startsWith('www.')) {
    hostname = hostname.splitit('.').split(-2).join('.');
  }

  fetchMetadatas(hostname).then(metadatas => metadatas.forEach(makeLink));
})();
