import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { Button, Label, List, Pagination } from 'semantic-ui-react';

import FilterMenu from '../../UI/FilterMenu/FilterMenu';
import UserItem from './UserItem';

import fetch from '../../../utils/fetch';
import filterUserItem from './filterUserItem';
import getUser from '../../../utils/getUser';
import getUserItemsFilterControls from './getUserItemsFilterControls';
import getUserItemsSortControls from './getUserItemsSortControls';
import getUserItemsFilterDefaults from './getUserItemsFilterDefaults';
import isLoggedIn from '../../../utils/isLoggedIn';
import sortUserItems from './sortUserItems';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      activePage: 1,
      allArtists: [],
      allPlatforms: [],
      userItems: [],
      filters: getUserItemsFilterDefaults(),
      sort: { field: 'title', order: 'asc' }
    }

    this.changePage = this.changePage.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
  }

  componentWillMount() {
    this.getAllArtists();
    this.getPlatforms();
    this.getUser();
  }

  getAllArtists() {
    fetch('/api/artists').then(artists => {
      this.setState({ allArtists: artists.map(artist => { return {text: artist, value: artist}}) });
    });
  }

  getPlatforms() {
    fetch('/api/platforms').then(platforms => {
      this.setState({allPlatforms: platforms.map(platform => {return {text: platform, value: platform}})});
    });
  }

  getUser() {
    return fetch(`/api/userItems/${getUser().id}`).then(userItems => {
      if (!userItems || userItems === null) throw new Error('No userItems found');
      userItems.sort((ui1, ui2) => ui1.item.title < ui2.item.title ? -1 : 1);
      this.setState({ userItems })
    }).catch(console.log);
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

  handlePaginationChange(e, { activePage }) {
    this.setState({ activePage });
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

  toggleSidebar() {
    this.setState({ isSidebarVisible: !this.state.isSidebarVisible });
  }

  hideSidebar() {
    this.setState({ isSidebarVisible: false });
  }

  render() {
    let filteredUserItems = this.state.userItems
      .filter(userItem => filterUserItem(userItem, this.state.filters))
      .sort(sortUserItems(this.state.sort));

    const begin = (this.state.activePage - 1) * 100;
    const totalPages = Math.ceil(filteredUserItems.length / 100, 0);
    const userItems = filteredUserItems
      .slice(begin, begin + 100)
      .map(userItem => 
        <UserItem key={userItem._id} userItem={userItem}></UserItem>
      );

    return (
      <div>
        <h2>My Items</h2>
        {
          isLoggedIn() && 
          <Button positive circular floated='right' icon='plus' as={Link} to='/items/add' />
        }
        <FilterMenu
          defaultFilters={this.state.filters}
          defaultSort={this.state.sort}
          handleFilterChange={this.handleFilterChange}
          handleSortChange={this.handleSortChange}
          getFilterControlsFunction={getUserItemsFilterControls}
          getFilterControlsFunctionExtraParams={{
            allArtists: this.state.allArtists,
            allPlatforms: this.state.allPlatforms
          }}
          getSortControlsFunction={getUserItemsSortControls} />
        {this.getPagination(totalPages)}
        <List>
          {userItems}
        </List>
        {this.getPagination(totalPages)}
      </div>
    );
  }
}
