import React from 'react';

// withTranslation(MyComponent) makes injects t(path) as prop into the
// component. Paths used in t(...) are looked up from the topmost level
// of translations.
//
// withTranslation(MyComponent, 'my.funny.prefix') results in t(...) calls
// to be scoped to the provided prefix:
//
// t('foo') -> lookup: 'my.funny.prefix.foo'
// t('/foo') -> bypass prefix, lookup: 'foo'
const determinePrefix = (path, basePrefix, componentPrefix) => {
  if (basePrefix && !componentPrefix) {
    return basePrefix;
  }

  if (basePrefix && componentPrefix) {
    if (path.match(/^(common|shortcuts|errors)/)) {
      return basePrefix;
    }

    return `${basePrefix}.${componentPrefix}`;
  }

  return false;
};

export const withTranslation = (translationInstance, basePrefix = null, componentPrefix = null) => {
  return (OriginalComponent) => {
    const ComponentWithTranslation = (props) => {
      // We build a translation function which is optionally scoped
      // to the specified prefix
      const t = (...args) => {
        const [path, ...restArgs] = args;
        const rootRegex = /^\//;
        const usePrefix = !path.match(rootRegex);
        const prefix = determinePrefix(path, basePrefix, componentPrefix);
        const finalPath = prefix && usePrefix
        ? `${prefix}.${path}`
        : path.replace(rootRegex, '');
        const newArgs = [finalPath].concat(restArgs);

        return translationInstance.value(...newArgs);
      };

      const newProps = { ...props, t };

      return <OriginalComponent {...newProps} />;
    };

    return ComponentWithTranslation;
  };
};

export default withTranslation;
