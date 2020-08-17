import React, { Component } from 'react';
import { List } from 'semantic-ui-react';

import getIcon from '../../../utils/getIcon';
import { isDateStatusValid } from '../../../utils/dateUtils';

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
        <List.Header as='a' href={`/items/${item.title_id}`}>{item.title}</List.Header>
          <List.Description>
            Release Date: {
              item.releaseDateStatus === 'Date' ? 
              new Date(item.releaseDate).toDateString() :
              item.releaseDateStatus
            }<br />
            {
              item.type === 'Movie' && isDateStatusValid(item.releaseDateDvdStatus) ?
              `Dvd Release Date: ${
                item.releaseDateDvdStatus === 'Date' ? 
                new Date(item.releaseDateDvd).toDateString() :
                item.releaseDateDvdStatus
              }` : ''
            }
          </List.Description>
        </List.Content>
      </List.Item>
    );
  }
}
