import { getArtistOptions, getPlatformOptions } from '../getFieldOptions';

export default () => new Promise((resolve => {
  const fields = [
    getArtistOptions(),
    getPlatformOptions()
  ];
  Promise.all(fields).then(values => {
    resolve(values.reduce((acc, field) => { return {...acc, ...field} }, {}));
  });
}))