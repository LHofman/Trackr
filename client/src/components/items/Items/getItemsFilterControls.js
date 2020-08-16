import React from 'react';

import getFilterControl from '../../UI/FilterMenu/getFilterControl';
import typeOptions from '../typeOptions';
import getArtistType from '../getArtistType';

export default (filters, handleFilterChange, extraParams = {}) => (
  <div>
    { getFilterControl('type', 'Select', handleFilterChange, {
      options: typeOptions,
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
    {
      filters.type === 'Video Game' &&
      getFilterControl('platform', 'Select', handleFilterChange, {
        options: extraParams.allPlatforms || [],
        value: filters.platform
      })
    } 
  </div>
);