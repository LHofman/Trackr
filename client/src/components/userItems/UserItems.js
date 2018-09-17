import moment from 'moment';
import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { Button, Dropdown, Icon, Input, Label, List, Menu, Pagination, Sidebar } from 'semantic-ui-react';

import UserItem from './UserItem';

import fetch from '../../utils/fetch';
import getUser from '../../utils/getUser';
import isLoggedIn from '../../utils/isLoggedIn';
import statusOptions from './statusOptions';
import typeOptions from '../items/typeOptions';

export default class Items extends Component {
  constructor() {
    super();
    this.state = {
      userItems: [],
      typeFilter: '',
      titleFilter: '',
      releaseDateLowerLimit: '',
      releaseDateUpperLimit: '',
      inCollectionFilter: '',
      statusFilter: '',
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
    this.getUser();
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
    const asc = this.state.sort.order === 'asc' ? -1 : 1;
    return ui1.item[this.state.sort.field].toString().toLowerCase() < 
      ui2.item[this.state.sort.field].toString().toLowerCase() ?
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
    const {typeFilter, titleFilter, releaseDateLowerLimit, releaseDateUpperLimit, inCollectionFilter, statusFilter,sort} = this.state;
    const filteredUserItems = this.state.userItems.filter(userItem => 
      //titleFilter
      userItem.item.title.toString().toLowerCase().indexOf(
        titleFilter.toString().toLowerCase()
      ) !== -1 &&
      //typeFilter
      (typeFilter === '' || userItem.item.type === typeFilter) &&
      //releaseDateFilter
      (
        (releaseDateLowerLimit === '' || moment(releaseDateLowerLimit).isSameOrBefore(userItem.item.releaseDate)) &&
        (releaseDateUpperLimit === '' || moment(releaseDateUpperLimit).isSameOrAfter(userItem.item.releaseDate))
      ) &&
      //inCollectionFilter
      (inCollectionFilter === '' || userItem.inCollection.toString() === inCollectionFilter) &&
      //statusFilter
      (statusFilter === '' || userItem.status === statusFilter)
    ).sort(this.sort);
    
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
