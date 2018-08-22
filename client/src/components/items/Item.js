import React, { Component } from 'react';
import { List } from 'semantic-ui-react';

import getIcon from '../../utils/getIcon';

export default class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: props.item
    }
  }
  
  render() {
    const item = this.state.item;
    return (
      <List.Item>
        {getIcon(item)}
        <List.Content>
          <List.Header>{item.title}</List.Header>
          <List.Description>Release Date: {new Date(item.releaseDate).toDateString()}</List.Description>
        </List.Content>
      </List.Item>
    );
  }
}
