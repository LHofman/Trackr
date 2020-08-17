import React from 'react';

import getFilterControl from '../../UI/FilterMenu/getFilterControl';
import getArtistType from '../getArtistType';
import { getTypeOptions } from '../getFieldOptions';

export default (extraParams) => (filters, handleFilterChange) => (
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
    {
      filters.type === 'Video Game' &&
      getFilterControl('platform', 'Select', handleFilterChange, {
        options: extraParams.allPlatforms || [],
        value: filters.platform
      })
    } 
  </div>
);