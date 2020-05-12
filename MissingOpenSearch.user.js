// ==UserScript==
// @name        Add missing OpenSearch
// @namespace   https://github.com/opensearch-database/opensearch-database
// @version     0.1.0
// @author      KokaKiwi
// @license     BSD-3-Clause
// @homepageURL https://github.com/opensearch-database/opensearch-database
// @downloadURL https://github.com/opensearch-database/opensearch-database/raw/master/MissingOpenSearch.user.js
// @supportURL  https://github.com/opensearch-database/opensearch-database/issues
// @inject-into content
// @run-at      document-start
// @noframes
// @connect     raw.githubusercontent.com
// ==/UserScript==

(function() {
  const fetchMetadatas = async (hostname) => {
    const metadata_url = `https://raw.githubusercontent.com/opensearch-database/opensearch-database/master/data/${hostname}/metadata.json`;

    const result = await fetch(metadata_url);
    return result.json();
  };

  const makeLink = (metadata) => {
    const link = document.createElement('link');
    link.rel = 'search';
    link.type = 'application/opensearchdescription+xml';
    link.href = `https://raw.githubusercontent.com/opensearch-database/opensearch-database/master/data/${hostname}/${metadata.id}.xml`;
    link.title = metadata.title;

    document.head.appendChild(link);
  };

  const hostname = location.hostname.split('.').splice(-2).join('.');

  fetchMetadatas(hostname).then(metadatas => metadatas.forEach(makeLink));
})();
