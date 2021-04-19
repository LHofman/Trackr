import fetch from '../../utils/fetch';

import { itemReleaseDateStatuses, itemTypes } from '../../types/item/item';
import { Option } from '../../types/shared/form';

export const getTypeOptions = (): Option<string>[] => 
  itemTypes.map((option) => { return { text: option, value: option } });

export const getDateStatusOptions = (): Option<string>[] =>
  itemReleaseDateStatuses.map(option => { return { text: option, value: option } });

export const getArtistOptions = (): Promise<Option<string>[]> => new Promise((resolve) => {
  fetch('/api/artists').then(artists => {
    resolve(artists.map(artist => { return { text: artist, value: artist } }));
  });
});

export const getGenreOptions = (): Promise<Option<string>[]> => new Promise((resolve) => {
  fetch('/api/genres').then(genres => {
    resolve(genres.map(genre => { return { text: genre, value: genre } }));
  });
});

export const getPlatformOptions = (): Promise<Option<string>[]> => new Promise((resolve) => {
  fetch('/api/platforms').then(platforms => {
    resolve(platforms.map(platform => { return { text: platform, value: platform } }));
  });
});