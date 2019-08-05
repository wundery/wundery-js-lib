import algoliasearch from 'algoliasearch';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';
import merge from 'lodash/merge';
import { searchResultsMock } from './utils';

class SearchApi {
  constructor(options = {}) {
    this.options = options;

    const { mock } = options;

    this.mock = mock;

    const { algoliaAppId, algoliaSearchApiKey } = options;

    if (!algoliaAppId || !algoliaSearchApiKey) {
      throw new Error('algoliaAppId and algoliaSearchApiKey must be defined');
    }

    this.algoliaClient = algoliasearch(algoliaAppId, algoliaSearchApiKey);
  }

  search(indexName, term, tags, returnTotal=false) {

    if (!indexName) {
      throw new Error('You must provide a search index name');
    }

    if (isEmpty(trim(term))) {
      if (returnTotal) {
        return Promise.resolve({products: [], total: 0});
      }
      return Promise.resolve([]);
    }

    const index = this.algoliaClient.initIndex(indexName);

    const searchOptions = {};

    if (tags) {
      searchOptions.filters = tags.join(' AND ');
    }

    if (returnTotal) {
      return new Promise((resolve, reject) => {
        if (this.mock) {
          resolve(searchResultsMock);
          return;
        }

        index
          .search(term, merge( searchOptions, {'hitsPerPage': 5} ), (err, results) => {
            if (err) {
              reject(get(err, 'message', 'Unknown error'));
            } else {
              resolve({
                products: get(results, 'hits', []),
                total: get(results, 'nbHits', 0)
              });
            }
          });
      }).catch(error => {
        console.warn(error);
        reject(String(error));
      });
    } else {
      return new Promise((resolve, reject) => {
        if (this.mock) {
          resolve(searchResultsMock);
          return;
        }

        index
          .search(term, searchOptions, (err, results) => {
            if (err) {
              reject(get(err, 'message', 'Unknown error'));
            } else {
              resolve(get(results, 'hits', []));
            }
          });
      }).catch(error => {
        console.warn(error);
        reject(String(error));
      });
    }
  }
}

export default SearchApi;
