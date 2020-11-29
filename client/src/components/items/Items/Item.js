import React, { Component } from 'react';
import { List } from 'semantic-ui-react';

import getIcon from '../../../utils/getIcon';
import { isDateStatusValid } from '../../../utils/dateUtils';
import getOnClickAttributes from '../../../utils/getOnClickAttributes';

export default class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: props.item
    }
  }

  render() {
    const item = this.state.item;

    const onClickAttributes = getOnClickAttributes(`/items/${item.title_id}`, this.props, item);

    return (
      <List.Item>
        {getIcon(item)}
        <List.Content>
          <List.Header>
            <a { ...onClickAttributes }>{item.title}</a>
          </List.Header>
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
