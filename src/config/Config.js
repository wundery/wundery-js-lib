import has from 'lodash/has';

class Config {
  constructor(data) {
    this.data = data;
  }

  get(key, defaultValue = null) {
    if (!has(this.data, key) && !defaultValue) {
      throw new Error(`Key ${key} not available`);
    }

    return this.data[key] || defaultValue;
  }
}


export default Config;
