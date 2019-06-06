import moment from 'moment';
import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { Button, Dropdown, Icon, Input, Label, List, Menu, Pagination, Sidebar } from 'semantic-ui-react';

import UserItem from './UserItem';

import extendedEquals from '../../utils/extendedEquals';
import fetch from '../../utils/fetch';
import getUser from '../../utils/getUser';
import isLoggedIn from '../../utils/isLoggedIn';
import statusOptions from './statusOptions';
import typeOptions from '../items/typeOptions';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      activePage: 1,
      artistFilter: '',
      artists: [],
      inCollectionFilter: '',
      isSidebarVisible: false,
      platformFilter: '',
      platforms: [],
      releaseDateLowerLimit: '',
      releaseDateUpperLimit: '',
      releaseDateDvdLowerLimit: '',
      releaseDateDvdUpperLimit: '',
      sort: { field: 'title', order: 'asc' },
      statusFilter: '',
      titleFilter: '',
      typeFilter: '',
      userItems: [],
    }

    this.changePage = this.changePage.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.sort = this.sort.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  componentWillMount() {
    this.getArtists();
    this.getPlatforms();
    this.getUser();
  }

  getArtists() {
    fetch('/api/artists').then(artists => {
      this.setState({ artists: artists.map(artist => { return {text: artist, value: artist}}) });
    });
  }

  getPlatforms() {
    fetch('/api/platforms').then(allPlatforms => {
      this.setState({platforms: allPlatforms.map(platform => {return {text: platform, value: platform}})});
    });
  }

  getUser() {
    return fetch(`/api/userItems/${getUser().id}`).then(userItems => {
      if (!userItems || userItems === null) throw new Error('No userItems found');
      userItems.sort((ui1, ui2) => ui1.item.title < ui2.item.title ? -1 : 1);
      this.setState({ userItems })
    }).catch(console.log);
  }

  onTitleFilterChange(event) {
    if (event.key === 'Enter') this.onFilterChange(event);
  }

  onFilterChange(event) {
    this.handleValueChange(event.target.name, event.target.value);
  }

  handleValueChange(name, value) {
    this.setState({ [name]: value });
  }

  handleSortChange(event, { name, value }) {
    this.handleValueChange('sort', { field: name, order: value });
  }

  sort(ui1, ui2) {
    const { field, order } = this.state.sort;
    const asc = order === 'asc' ? -1 : 1;

    const s1 = field === 'releaseDate' && ui1.item.releaseDateStatus !== 'Date' ? 
      ui1.item.releaseDateStatus : (
        field === 'releaseDateDvd' && ui1.item.releaseDateDvdStatus !== 'Date' ? 
        ui1.item.releaseDateDvdStatus : 
        ui1.item[field].toString().toLowerCase()
      );
    const s2 = field === 'releaseDate' && ui2.item.releaseDateStatus !== 'Date' ? 
      ui2.item.releaseDateStatus : (
        field === 'releaseDateDvd' && ui2.item.releaseDateDvdStatus !== 'Date' ? 
        ui2.item.releaseDateDvdStatus :
        ui2.item[field].toString().toLowerCase()
      );

    return s1 < s2 || (s1 === s2 && ui1.item.title.toString().toLowerCase() < ui2.item.title.toString().toLowerCase()) ? asc : asc * -1;
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
    const {
      artistFilter,
      inCollectionFilter, 
      platformFilter,
      releaseDateLowerLimit, 
      releaseDateUpperLimit, 
      releaseDateDvdLowerLimit, 
      releaseDateDvdUpperLimit, 
      sort,
      statusFilter, 
      titleFilter, 
      typeFilter
    } = this.state;
    let filteredUserItems = this.state.userItems.filter(userItem => 
      //titleFilter
      userItem.item.title.toString().toLowerCase().indexOf(
        titleFilter.toString().toLowerCase()
      ) !== -1 &&
      //typeFilter
      extendedEquals(typeFilter, '', userItem.item.type) &&
      //releaseDateFilter
      (
        (releaseDateLowerLimit === '' || moment(releaseDateLowerLimit).isSameOrBefore(userItem.item.releaseDate)) &&
        (releaseDateUpperLimit === '' || moment(releaseDateUpperLimit).isSameOrAfter(userItem.item.releaseDate))
      ) &&
      //inCollectionFilter
      extendedEquals(inCollectionFilter, '', userItem.inCollection.toString()) &&
      //statusFilter
      extendedEquals(statusFilter, '', userItem.status) &&
      //artistFilter
      ((this.state.typeFilter !== 'Album' && this.state.typeFilter !== 'Book') || userItem.item.artist === artistFilter || artistFilter === '') &&
      //platformFilter
      (this.state.typeFilter !== 'Video Game' || userItem.item.platforms.indexOf(platformFilter) >= 0 || platformFilter === '')
    ).sort(this.sort);
    //releaseDateDvdFilter
    if (this.state.typeFilter === 'Movie') {
      filteredUserItems = filteredUserItems.filter(userItem => {
        if ((releaseDateDvdLowerLimit || releaseDateDvdUpperLimit) && !userItem.item.releaseDateDvdStatus) return false;
        return (
          releaseDateDvdLowerLimit === '' || 
          moment(releaseDateDvdLowerLimit).isSameOrBefore(userItem.item.releaseDateDvd)
        ) &&
        (
          releaseDateDvdUpperLimit === '' || 
          moment(releaseDateDvdUpperLimit).isSameOrAfter(userItem.item.releaseDateDvd)
        )
      })
    }
    
    
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
        <Button onClick={this.toggleSidebar}><Icon name='bars' />Filter/Sort</Button>
        <Input name='titleFilter' onKeyPress={this.onTitleFilterChange.bind(this)} icon='search' placeholder='Search...' /><br/><br/><br/>
        <Sidebar as={Menu}
          animation='overlay'
          onHide={this.hideSidebar.bind(this)}
          vertical
          visible={this.state.isSidebarVisible}
          width='wide'
        >
          <Menu.Item header>Filter By</Menu.Item>
          <Menu.Item>
            <Label>Type</Label>
            <Dropdown placeholder='Type' name='typeFilter' selection value={''}
              options={[{ text: '---No Filter---', value: '' }, ...typeOptions]}
              onChange={(param, data) => this.handleValueChange('typeFilter', data.value)} /><br/>
          </Menu.Item>
          <Menu.Item>
            <Label>Release Date Lower Limit</Label>
            <Input type='date' name='releaseDateLowerLimit' value={moment(this.state.releaseDateLowerLimit).format('YYYY-MM-DD')} onChange={this.onFilterChange} /><br/>
          </Menu.Item>
          <Menu.Item>
            <Label>Release Date Upper Limit</Label>
            <Input type='date' name='releaseDateUpperLimit' value={moment(this.state.releaseDateUpperLimit).format('YYYY-MM-DD')} onChange={this.onFilterChange} /><br/>
          </Menu.Item>
          {
            this.state.typeFilter === 'Movie' &&
            <div>
              <Menu.Item>
                <Label>Dvd Release Date Lower Limit</Label>
                <Input type='date' name='releaseDateDvdLowerLimit' value={moment(this.state.releaseDateDvdLowerLimit).format('YYYY-MM-DD')} onChange={this.onFilterChange} /><br/>
              </Menu.Item>
              <Menu.Item>
                <Label>Dvd Release Date Upper Limit</Label>
                <Input type='date' name='releaseDateDvdUpperLimit' value={moment(this.state.releaseDateDvdUpperLimit).format('YYYY-MM-DD')} onChange={this.onFilterChange} /><br/>
              </Menu.Item>
            </div>
          }
          {
            (typeFilter === 'Album' || typeFilter === 'Book') &&
            <Menu.Item>
              <Label>{typeFilter === 'Album' ? 'Artist' : 'Author'}</Label>
              <Dropdown placeholder={typeFilter === 'Album' ? 'Artist' : 'Author'} name='artistFilter' selection value={''}
                options={[{ text: '', value: '' }, ...this.state.artists]}
                onChange={(param, data) => this.handleValueChange('artistFilter', data.value)} /><br/>
            </Menu.Item>
          }
          {
            typeFilter === 'Video Game' &&
            <Menu.Item>
              <Label>Platform</Label>
              <Dropdown placeholder='Platform' name='platformFilter' selection value={''}
                options={[{ text: '', value: '' }, ...this.state.platforms]}
                onChange={(param, data) => this.handleValueChange('platformFilter', data.value)} /><br/>
            </Menu.Item>
          }
          <Menu.Item>
            <Label>In Collection</Label>
            <Dropdown placeholder='In Collection' name='inCollectionFilter' selection value={''}
              options={[{ text: '---No Filter---', value: '' }, { text: 'In Collection', value: 'true' }, { text: 'Not In Collection', value: 'false' }]}
              onChange={(param, data) => this.handleValueChange('inCollectionFilter', data.value)} />
          </Menu.Item>
          <Menu.Item>
            <Label>Status</Label>
            <Dropdown placeholder='Status' name='statusFilter' selection value={''}
              options={[{ text: '---No Filter---', value: '' }, ...statusOptions({ type: this.state.typeFilter })]}
              onChange={(param, data) => this.handleValueChange('statusFilter', data.value)} />
          </Menu.Item>
          <Menu.Item header>Sort By</Menu.Item>
          <Menu.Item 
            name='title'
            value='asc'
            active={sort.field === 'title' && sort.order === 'asc'}
            onClick={this.handleSortChange}>
            Title (asc)
          </Menu.Item>
          <Menu.Item 
            name='title'
            value='desc'
            active={sort.field === 'title' && sort.order === 'desc'}
            onClick={this.handleSortChange}>
            Title (desc)
          </Menu.Item>
          <Menu.Item 
            name='releaseDate'
            value='asc'
            active={sort.field === 'releaseDate' && sort.order === 'asc'}
            onClick={this.handleSortChange}>
            Release Date (asc)
          </Menu.Item>
          <Menu.Item 
            name='releaseDate'
            value='desc'
            active={sort.field === 'releaseDate' && sort.order === 'desc'}
            onClick={this.handleSortChange}>
            Release Date (desc)
          </Menu.Item>
          {
            this.state.typeFilter === 'Movie' &&
            <div>
              <Menu.Item 
                name='releaseDateDvd'
                value='asc'
                active={sort.field === 'releaseDateDvd' && sort.order === 'asc'}
                onClick={this.handleSortChange}>
                Dvd Release Date (asc)
              </Menu.Item>
              <Menu.Item 
                name='releaseDateDvd'
                value='desc'
                active={sort.field === 'releaseDateDvd' && sort.order === 'desc'}
                onClick={this.handleSortChange}>
                Dvd Release Date (desc)
              </Menu.Item>
            </div>
          }
        </Sidebar>
        {this.getPagination(totalPages)}
        <List>
          {userItems}
        </List>
        {this.getPagination(totalPages)}
      </div>
    );
  }
}
