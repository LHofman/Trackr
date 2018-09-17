import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { Button, Dropdown, Input, Label, List, Pagination } from 'semantic-ui-react';

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
      sort: { field: 'title', order: 'asc' },
      activePage: 1
    }

    this.sort = this.sort.bind(this);
    this.changePage = this.changePage.bind(this);
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

  handleSortChange(value) {
    const index = value.indexOf('_');
    this.handleValueChange('sort' , { 
      field: value.substring(0, index), 
      order: value.substring(index+1) 
    });
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

  render() {
    const {typeFilter, titleFilter} = this.state;
    const filteredItems = this.state.items.filter(item => 
      item.title.toString().toLowerCase().indexOf(
        titleFilter.toString().toLowerCase()
      ) !== -1 &&
      (typeFilter === '' || item.type === typeFilter)
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
        <Input name='titleFilter' onKeyPress={this.onTitleFilterChange.bind(this)} icon='search' placeholder='Search...' />&nbsp;&nbsp;&nbsp;
        <Dropdown placeholder='Type' name='typeFilter' selection value={''}
          options={[{ text: '---No Filter---', value: '' }, ...typeOptions]}
          onChange={(param, data) => this.handleValueChange('typeFilter', data.value)} />&nbsp;&nbsp;&nbsp;
        <Dropdown text='Sort' labeled button name='sort'
          options={[
            { key: 'title_asc', text: 'Title (asc)', value: 'title_asc' },
            { key: 'title_desc', text: 'Title (desc)', value: 'title_desc' },
            { key: 'releaseDate_asc', text: 'Release Date (asc)', value: 'releaseDate_asc' },
            { key: 'releaseDate_desc', text: 'Release Date (desc)', value: 'releaseDate_desc' },
          ]} onChange={(param, data) => this.handleSortChange(data.value)} /><br/><br/>
        {
          isLoggedIn() && 
          <Button positive circular floated='right' icon='plus' as={Link} to='/items/add' />
        }
        {this.getPagination(totalPages)}
        <List>
          {items}
        </List>
        {this.getPagination(totalPages)}
      </div>
    );
  }
}
