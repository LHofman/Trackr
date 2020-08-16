import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { animateScroll } from 'react-scroll';
import { Button, Label, List, Pagination } from 'semantic-ui-react';

import FilterMenu from '../../UI/FilterMenu/FilterMenu';
import Item from './Item';

import fetch from '../../../utils/fetch';
import filterItem from './filterItem';
import getItemsFilterControls from './getItemsFilterControls';
import getItemsFilterDefaults from './getItemsFilterDefaults';
import getItemsSortControls from './getItemsSortControls';
import isLoggedIn from '../../../utils/isLoggedIn';
import sortItems from './sortItems';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      activePage: 1,
      items: [],
      allArtists: [],
      allPlatforms: [],
      filters: getItemsFilterDefaults(),
      sort: { field: 'title', order: 'asc' },
    }
    
    this.changePage = this.changePage.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
  }

  componentWillMount() {
    this.getItems();
    this.getAllArtists();
    this.getAllPlatforms();
  }

  getItems() {
    return fetch('/api/items').then(items => {
      if (!items || items === null) throw new Error('No items found');
      items.sort((i1, i2) => i1.title < i2.title ? -1 : 1);
      this.setState({ items })
    }).catch(console.log);
  }

  getAllArtists() {
    fetch('/api/artists').then(artists => {
      this.setState({ allArtists: artists.map(artist => { return { text: artist, value: artist } }) });
    });
  }

  getAllPlatforms() {
    fetch('/api/platforms').then(platforms => {
      this.setState({allPlatforms: platforms.map(platform => { return { text: platform, value: platform } }) });
    });
  }

  handlePaginationChange(e, { activePage }) {
    this.setState({ activePage });
    animateScroll.scrollToTop();
  }

  changePage(activePage) {
    this.handlePaginationChange(null, { activePage });
  }

  getPagination(totalPages) {
    return (
      <div>
        <MediaQuery query='(max-width: 550px)'>
          <Button icon='fast backward' onClick={() => this.changePage(1)} />
          <Button icon='step backward' onClick={() => this.changePage(this.state.activePage-1)} />
          <Label content={`${this.state.activePage}/${totalPages}`} color='teal' />
          <Button icon='step forward' onClick={() => this.changePage(this.state.activePage+1)} />
          <Button icon='fast forward' onClick={() => this.changePage(totalPages)} />
        </MediaQuery>
        <MediaQuery query='(min-width: 550px)'>
          <Pagination activePage={this.state.activePage} totalPages={totalPages} onPageChange={this.handlePaginationChange.bind(this)} />
        </MediaQuery>
      </div>
    )
  }

  handleFilterChange(filter, value) {
    const filters = {
      ...this.state.filters,
      [filter]: value
    };

    this.setState({ filters });
    this.setState({ activePage: 1 });
  }

  handleSortChange(field, order) {
    this.setState({ sort: { field, order } });
  }

  render() {
    let filteredItems = this.state.items
      .filter(item => filterItem(item, this.state.filters))
      .sort(sortItems(this.state.sort));
    
    const begin = (this.state.activePage - 1) * 100;
    const totalPages = Math.ceil(filteredItems.length / 100, 0);
    const items = filteredItems
      .slice(begin, begin + 100)
      .map(item => 
        <Item key={item._id} item={item}></Item>
      );

    return (
      <div>
        <h2>Items</h2>
        {
          isLoggedIn() && 
          <Button positive circular floated='right' icon='plus' as={Link} to='/items/add' />
        }
        <FilterMenu
          defaultFilters={this.state.filters}
          defaultSort={this.state.sort}
          handleFilterChange={this.handleFilterChange}
          handleSortChange={this.handleSortChange}
          getFilterControlsFunction={getItemsFilterControls}
          getFilterControlsFunctionExtraParams={{
            allArtists: this.state.allArtists,
            allPlatforms: this.state.allPlatforms
          }}
          getSortControlsFunction={getItemsSortControls} />
        {this.getPagination(totalPages)}
        <List>
          {items}
        </List>
        {this.getPagination(totalPages)}
      </div>
    );
  }
}
