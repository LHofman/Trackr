import React, { Component } from 'react';
import { Icon, List } from 'semantic-ui-react';

import getIcon from '../../../utils/getIcon';

export default class UserItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userItem: props.userItem
    }
  }
  
  render() {
    const userItem = this.state.userItem;
    return (
      <List.Item>
        {getIcon(userItem.item)}
        <List.Content>
          <List.Header as='a' href={`/items/${userItem.item.title_id}`}>
            {userItem.item.title}
            {
              userItem.inCollection &&
              <Icon name='inbox' />
            }
          </List.Header>
          <List.Description>
            Release Date: {
              userItem.item.releaseDateStatus === 'Date' ? 
              new Date(userItem.item.releaseDate).toDateString() :
              userItem.item.releaseDateStatus
            }<br />
            {
              userItem.item.type === 'Movie' && userItem.item.releaseDateDvd ?
              <div>
                {`Dvd Release Date: ${
                  userItem.item.releaseDateDvdStatus === 'Date' ? 
                  new Date(userItem.item.releaseDateDvd).toDateString() :
                  userItem.item.releaseDateStatusDvd
                }`}<br />
              </div> : ''
            }
            Status: {userItem.status}
          </List.Description>
        </List.Content>
      </List.Item>
    );
  }
}
