import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Dropdown, Input, List } from 'semantic-ui-react';

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
      sort: { field: 'title', order: 'asc' }
    }

    this.sort = this.sort.bind(this);
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

  render() {
    const {typeFilter, titleFilter} = this.state;
    const filteredItems = this.state.items.filter(item => 
      item.title.toString().toLowerCase().indexOf(
        titleFilter.toString().toLowerCase()
      ) !== -1 &&
      (typeFilter === '' || item.type === typeFilter)
    ).sort(this.sort);
    
    const items = filteredItems.map(item => 
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
          ]} onChange={(param, data) => this.handleSortChange(data.value)} />
        {
          isLoggedIn() && 
          <Button positive circular floated='right' icon='plus' as={Link} to='/items/add' />
        }
        <List>
          {items}
        </List>
      </div>
    );
  }
}
