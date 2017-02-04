import get from 'lodash/get';
import has from 'lodash/get';

class Translation {
  static guessLocaleFromBrowser() {
    const guess = (window.navigator && window.navigator.languages &&
      window.navigator.languages[0]) ||
      (window.navigator && window.navigator.language) ||
      (window.navigator && window.navigator.browserLanguage) ||
      (window.navigator && window.navigator.systemLanguage) ||
      (window.navigator && window.navigator.userLanguage) ||
      'en';
    return guess.substring(0, 2);
  }

  constructor({ dictionaries = [], locale = null, fallbackLocale = null }) {
    this.values = {};
    this.referenceRegex = /^\//;

    this.addDictionaries(dictionaries);

    if (locale && this.hasLocale(locale)) {
      this.useLocale(locale);
    } else if (fallbackLocale && this.hasLocale(fallbackLocale)) {
      this.useLocale(fallbackLocale);
    }
  }

  value(key, interpolation = {}, defaultValue = null) {
    let translated;
    const values = this.values[this.locale];

    const def = defaultValue || key;

    translated = this.findValue(key, values, def);

    if (typeof translated !== 'string') {
      throw new Error(`Your translation request '${key}' returned a non-string value`);
    }

    let newKey = null;

    if (translated.match(this.referenceRegex)) {
      newKey = translated.replace(this.referenceRegex, '');
      translated = this.findValue(newKey, values);
    }

    if (interpolation) {
      Object.keys(interpolation).forEach((find) => {
        const replace = interpolation[find];
        // eslint-disable-next-line no-useless-escape
        const replaced = translated.replace(`\$\{${find}\}`, replace);
        translated = replaced;
      });
    }

    const retVal = translated || newKey || key;

    if (/^[a-z]{1}[a-zA-Z]*(\.[a-zA-Z]*[a-z]{1})+$/.test(retVal)) {
      if (this.reporter) {
        this.reporter(retVal, this);
      }
    }

    return retVal;
  }

  parseValues(values) {
    return values;
  }

  useLocale(locale) {
    this.locale = locale;
  }

  findValue(key, values, defaultValue) {
    return get(values, key, defaultValue);
  }

  hasLocale(locale) {
    return has(this.values, locale);
  }

  addValues(locale, values) {
    if (!this.values[locale]) {
      this.values[locale] = {};
    }

    // Todo: deep merge instead of override
    this.values[locale] = values;
  }

  /**
   * Adds a set of dictionaries in one batch.
   *
   * @param {Object} dicts - The dictionaries
   * @return {Translation} - The translation instance (this)
   *
   * @example
   * const translation = new Translation();
   * translation.addDictionaries({
   *   de: { hello: 'Hallo' },
   *   en: { hello: 'Hello' },
   * });
   */
  addDictionaries(dicts) {
    Object
      .keys(dicts)
      .forEach(locale => this.addValues(locale, dicts[locale]));

    return this;
  }
}

export default Translation;
