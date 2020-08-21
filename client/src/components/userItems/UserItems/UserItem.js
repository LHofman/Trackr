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
  
  onHeaderClick() {
    this.props.onClickCallback(this.state.userItem);
  }
  
  render() {
    const userItem = this.state.userItem;
    
    let onClickAttributes = { href: `/items/${userItem.item.title_id}` };
    if (this.props.onClickCallback) {
      onClickAttributes = { onClick: this.onHeaderClick.bind(this) };
    }

    return (
      <List.Item>
        {getIcon(userItem.item)}
        <List.Content>
          <List.Header as='a' { ...onClickAttributes } >
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
