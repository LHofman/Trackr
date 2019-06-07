import moment from 'moment';
import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { animateScroll } from 'react-scroll';
import { Button, Dropdown, Icon, Input, Label, List, Menu, Pagination, Sidebar } from 'semantic-ui-react';

import Item from './Item';

import extendedEquals from '../../utils/extendedEquals';
import fetch from '../../utils/fetch';
import isLoggedIn from '../../utils/isLoggedIn';
import typeOptions from './typeOptions';
import getArtistType from './getArtistType'

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      activePage: 1,
      artistFilter: '',
      allArtists: [],
      isSidebarVisible: false,
      items: [],
      platformFilter: '',
      platforms: [],
      releaseDateLowerLimit: '',
      releaseDateUpperLimit: '',
      releaseDateDvdLowerLimit: '',
      releaseDateDvdUpperLimit: '',
      sort: { field: 'title', order: 'asc' },
      titleFilter: '',
      typeFilter: ''
    }
    
    this.changePage = this.changePage.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.sort = this.sort.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  componentWillMount() {
    this.getAllArtists();
    this.getPlatforms();
    this.getItems();
  }

  getAllArtists() {
    fetch('/api/artists').then(artists => {
      this.setState({ allArtists: artists.map(artist => { return {text: artist, value: artist}}) });
    });
  }

  getItems() {
    return fetch('/api/items').then(items => {
      if (!items || items === null) throw new Error('No items found');
      items.sort((i1, i2) => i1.title < i2.title ? -1 : 1);
      this.setState({ items })
    }).catch(console.log);
  }

  getPlatforms() {
    fetch('/api/platforms').then(allPlatforms => {
      this.setState({platforms: allPlatforms.map(platform => {return {text: platform, value: platform}})});
    });
  }

  onTitleFilterChange(event) {
    if (event.key === 'Enter') this.onFilterChange(event);
  }

  onFilterChange(event) {
    this.handleValueChange(event.target.name, event.target.value);
    this.setState({ activePage: 1 });
  }

  handleValueChange(name, value) {
    this.setState({ [name]: value });
  }

  handleSortChange(event, { name, value }) {
    this.handleValueChange('sort', { field: name, order: value });
  }

  sort(i1, i2) {
    const { field, order } = this.state.sort;
    const asc = order === 'asc' ? -1 : 1;

    const s1 = field === 'releaseDate' && i1.releaseDateStatus !== 'Date' ? 
      i1.releaseDateStatus : (
        field === 'releaseDateDvd' && i1.releaseDateDvdStatus !== 'Date' ? 
        i1.releaseDateDvdStatus : 
        i1[field].toString().toLowerCase()
      );
    const s2 = field === 'releaseDate' && i2.releaseDateStatus !== 'Date' ? 
      i2.releaseDateStatus : (
        field === 'releaseDateDvd' && i2.releaseDateDvdStatus !== 'Date' ? 
        i2.releaseDateDvdStatus :
        i2[field].toString().toLowerCase()
      );

    return s1 < s2 || (s1 === s2 && i1.title.toString().toLowerCase() < i2.title.toString().toLowerCase()) ? asc : asc * -1;
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

  toggleSidebar() {
    this.setState({ isSidebarVisible: !this.state.isSidebarVisible });
  }

  hideSidebar() {
    this.setState({ isSidebarVisible: false });
  }

  render() {
    const {
      artistFilter,
      platformFilter,
      releaseDateLowerLimit, 
      releaseDateUpperLimit, 
      releaseDateDvdLowerLimit, 
      releaseDateDvdUpperLimit, 
      sort,
      titleFilter, 
      typeFilter, 
    } = this.state;
    let filteredItems = this.state.items.filter(item => 
      //titleFilter
      item.title.toString().toLowerCase().indexOf(
        titleFilter.toString().toLowerCase()
      ) !== -1 &&
      //typeFilter
      extendedEquals(typeFilter, '', item.type) &&
      //releaseDateFilter
      (
        (
          releaseDateLowerLimit === '' || 
          item.releaseDateStatus !== 'Date' ||
          moment(releaseDateLowerLimit).isSameOrBefore(item.releaseDate)
        ) &&
        (
          releaseDateUpperLimit === '' || 
          (
            item.releaseDateStatus === 'Date' && 
            moment(releaseDateUpperLimit).isSameOrAfter(item.releaseDate)
          )
        )
      ) &&
      //artistFilter
      ((this.state.typeFilter !== 'Album' && this.state.typeFilter !== 'Book' && this.state.typeFilter !== 'Movie') || item.artists.indexOf(artistFilter) >= 0 || artistFilter === '') &&
      //platformFilter
      (this.state.typeFilter !== 'Video Game' || item.platforms.indexOf(platformFilter) >= 0 || platformFilter === '')
    ).sort(this.sort);
    //releaseDateDvdFilter
    if (this.state.typeFilter === 'Movie') {
      filteredItems = filteredItems.filter(item => {
        if ((releaseDateDvdLowerLimit || releaseDateDvdUpperLimit) && !item.releaseDateDvdStatus) return false;
        return (
          releaseDateDvdLowerLimit === '' || 
          item.releaseDateDvdStatus !== 'Date' ||
          moment(releaseDateDvdLowerLimit).isSameOrBefore(item.releaseDateDvd)
        ) &&
        (
          releaseDateDvdUpperLimit === '' || 
          (
            item.releaseDateDvdStatus === 'Date' && 
            moment(releaseDateDvdUpperLimit).isSameOrAfter(item.releaseDateDvd)
          )
        )
      })
    }
    
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
            typeFilter === 'Movie' &&
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
            (typeFilter === 'Album' || typeFilter === 'Book' || typeFilter === 'Movie') &&
            <Menu.Item>
              <Label>{getArtistType(typeFilter)}</Label>
              <Dropdown search placeholder={getArtistType(typeFilter)} name='artistFilter' selection value={''}
                options={[{ text: '', value: '' }, ...this.state.allArtists]}
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
          {items}
        </List>
        {this.getPagination(totalPages)}
      </div>
    );
  }
}
