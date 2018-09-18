import moment from 'moment';
import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { Button, Dropdown, Icon, Input, Label, List, Menu, Pagination, Sidebar } from 'semantic-ui-react';

import Item from './Item';

import fetch from '../../utils/fetch';
import isLoggedIn from '../../utils/isLoggedIn';
import typeOptions from './typeOptions';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
      typeFilter: '',
      titleFilter: '',
      releaseDateLowerLimit: '',
      releaseDateUpperLimit: '',
      sort: { field: 'title', order: 'asc' },
      activePage: 1,
      isSidebarVisible: false
    }

    this.onFilterChange = this.onFilterChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.sort = this.sort.bind(this);
    this.changePage = this.changePage.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  componentWillMount() {
    this.getItems();
  }

  getItems() {
    return fetch('/api/items').then(items => {
      if (!items || items === null) throw new Error('No items found');
      items.sort((i1, i2) => i1.title < i2.title ? -1 : 1);
      this.setState({ items })
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

  sort(i1, i2) {
    const asc = this.state.sort.order === 'asc' ? -1 : 1;
    return i1[this.state.sort.field].toString().toLowerCase() < 
      i2[this.state.sort.field].toString().toLowerCase() ?
      asc: asc * -1;
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
    const {typeFilter, titleFilter, releaseDateLowerLimit, releaseDateUpperLimit, sort} = this.state;
    const filteredItems = this.state.items.filter(item => 
      //titleFilter
      item.title.toString().toLowerCase().indexOf(
        titleFilter.toString().toLowerCase()
      ) !== -1 &&
      //typeFilter
      (typeFilter === '' || item.type === typeFilter) &&
      //releaseDateFilter
      (
        (releaseDateLowerLimit === '' || moment(releaseDateLowerLimit).isSameOrBefore(item.releaseDate)) &&
        (releaseDateUpperLimit === '' || moment(releaseDateUpperLimit).isSameOrAfter(item.releaseDate))
      )
    ).sort(this.sort);
    
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