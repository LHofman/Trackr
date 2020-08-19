import { getArtistOptions, getPlatformOptions } from '../getFieldOptions';

export default () => new Promise((resolve => {
  const fields = [
    getArtistOptions(),
    getPlatformOptions()
  ];
  Promise.all(fields).then(values => {
    resolve({
      allArtists: values[0],
      allPlatforms: values[1]
    });
  });
}))