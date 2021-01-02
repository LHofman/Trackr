import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon, List, Rating } from 'semantic-ui-react';

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
          <List.Header>
            <Link to={`${this.props.match}/${userItem.item.title_id}`}>
              {userItem.item.title}
              {
                userItem.inCollection &&
                <Icon name='inbox' />
              }
            </Link>
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
