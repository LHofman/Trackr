import React, { Component } from 'react';
import { Icon, List, Rating } from 'semantic-ui-react';

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
            <br/>
            {
              userItem.rating > 0 &&
              <Rating
                icon='star'
                maxRating={10}
                disabled={true}
                defaultRating={userItem.rating} />
            }
          </List.Description>
        </List.Content>
      </List.Item>
    );
  }
}
