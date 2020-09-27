import React from 'react';
import moment from 'moment';

import checkFilter from '../checkFilter';
import { getArtistOptions, getPlatformOptions, getGenreOptions } from '../../components/items/getFieldOptions';
import getFilterControl from '../../components/UI/FilterMenu/getFilterControl';
import getArtistType from '../../components/items/getArtistType';
import { getTypeOptions } from '../../components/items/getFieldOptions';

export const getItemsFiltersControls = (extraParams) => (filters, handleFilterChange) => (
  <div>
    { getFilterControl('type', 'Select', handleFilterChange, {
      options: getTypeOptions(),
      value: filters.type
    }) }
    { getFilterControl('releaseDateLowerLimit', 'Date', handleFilterChange, {
      value: filters.releaseDateLowerLimit
    }) }
    { getFilterControl('releaseDateUpperLimit', 'Date', handleFilterChange, {
      value: filters.releaseDateUpperLimit
    }) }
    {
      filters.type === 'Movie' &&
      <div>
        {getFilterControl('releaseDateDvdLowerLimit', 'Date', handleFilterChange, {
          value: filters.releaseDateDvdLowerLimit
        })}
        {getFilterControl('releaseDateDvdUpperLimit', 'Date', handleFilterChange, {
          value: filters.releaseDateDvdUpperLimit
        })}
      </div>
    }
    {
      getArtistType(filters.type) !== null &&
      getFilterControl('artist', 'Select', handleFilterChange, {
          placeholder: getArtistType(filters.type),
          options: extraParams.allArtists || [],
          value: filters.artist
      })
    }
    { getFilterControl('genre', 'Select', handleFilterChange, {
      options: extraParams.allGenres || [],
      value: filters.genre
    }) }
    {
      filters.type === 'Video Game' &&
      getFilterControl('platform', 'Select', handleFilterChange, {
        options: extraParams.allPlatforms || [],
        value: filters.platform
      })
    }
  </div>
);

export const getItemsFiltersControlsExtraParams = () => new Promise((resolve => {
  const fields = [
    getArtistOptions(),
    getGenreOptions(),
    getPlatformOptions()
  ];
  Promise.all(fields).then(values => {
    resolve({
      allArtists: values[0],
      allGenres: values[1],
      allPlatforms: values[2]
    });
  });
}));

export const getItemsFiltersDefaults = () => { return {
  artist: '',
  genre: '',
  platform: '',
  releaseDateLowerLimit: '',
  releaseDateUpperLimit: '',
  releaseDateDvdLowerLimit: '',
  releaseDateDvdUpperLimit: '',
  title: '',
  type: ''
}}

export const filterItem = (item, filters) => {
  if (!checkFilter('Text', item.title, filters.title)) return false;
  if (!checkFilter('Select', item.type, filters.type)) return false;
  if (!checkFilter('Date',
    { status: item.releaseDateStatus, value: item.releaseDate },
    { lowerLimit: filters.releaseDateLowerLimit, upperLimit: filters.releaseDateUpperLimit }
  )) return false;
  if (filters.type === 'Movie' && !checkFilter('Date',
    { status: item.releaseDateDvdStatus, value: item.releaseDateDvd },
    { lowerLimit: filters.releaseDateDvdLowerLimit, upperLimit: filters.releaseDateDvdUpperLimit }
  )) return false;
  if (filters.type && !checkFilter('List', item.artists, filters.artist)) return false;
  if (!checkFilter('List', item.genres, filters.genre)) return false;
  if (filters.type === 'Video Game' && !checkFilter('List', item.platforms, filters.platform)) return false;
  return true;
};

export const applyCustomFilter = (filters, sort, customFilter) => {
  switch (customFilter) {
    case 'upcoming':
      filters.releaseDateLowerLimit = moment().format('YYYY-MM-DD');
      sort.field = 'releaseDate';
      sort.order = 'asc';
      return;
    case 'upcomingDvd':
      filters.type = 'Movie';
      filters.releaseDateDvdLowerLimit = moment().format('YYYY-MM-DD');
      sort.field = 'releaseDateDvd';
      sort.order = 'asc';
      return;
    default:
      return;
  }
}