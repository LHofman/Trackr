import { Option } from "../shared/form";

export type Item = {
  _id?: string;
  artists: string[];
  genres: string[];
  platforms?: string[];
  releaseDate: string;
  releaseDateStatus: ItemReleaseDateStatus;
  releaseDateDvd?: string;
  releaseDateDvdStatus?: ItemReleaseDateStatus;
  title: string;
  title_id: string;
  type: ItemType;
};

export const itemTypes = [
  'Album',
  'Book',
  'Comicbook',
  'Manga',
  'Movie',
  'TvShow',
  'Video Game'
];
export type ItemType =
  | 'Album'
  | 'Book'
  | 'Comicbook'
  | 'Manga'
  | 'Movie'
  | 'TvShow'
  | 'Video Game';

export type ItemReleaseDate = {
  status: ItemReleaseDateStatus;
  value: string;
};

export const itemReleaseDateStatuses = ['Date', 'TBA', 'Unknown'];
export type ItemReleaseDateStatus = 'Date' | 'TBA' | 'Unknown';

export type ItemFilters = {
  artist: string;
  genre: string;
  platform: string;
  releaseDateLowerLimit: string;
  releaseDateUpperLimit: string;
  releaseDateDvdLowerLimit: string;
  releaseDateDvdUpperLimit: string;
  title: string;
  type: ItemType | '';
};
export type ItemCustomFilter = 'upcoming' | 'upcomingDvd';

export type ItemSorting = {
  field: ItemSortingField;
  order: 'asc' | 'desc';
};
export type ItemSortingField = 'index' | 'releaseDate' | 'releaseDateDvd' | 'title';

export type ItemExtraParams = {
  allArtists?: Option<string>[];
  allGenres?: Option<string>[];
  allPlatforms?: Option<string>[];
};
