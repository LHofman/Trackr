import fetch from '../../utils/fetch';

export const getTypeOptions = () => ['Album', 'Book', 'Comicbook', 'Manga', 'Movie', 'TvShow', 'Video Game']
  .map(option => { return {text: option, value: option}});

export const getDateStatusOptions = () => ['Date', 'TBA', 'Unknown'].map(option => {
  return { text: option, value: option }
});

export const getArtistOptions = () => new Promise((resolve) => {
  fetch('/api/artists').then(artists => {
    resolve(artists.map(artist => { return { text: artist, value: artist } }));
  });
});

export const getPlatformOptions = () => new Promise((resolve) => {
  fetch('/api/platforms').then(platforms => {
    resolve(platforms.map(platform => { return { text: platform, value: platform } }));
  });
});