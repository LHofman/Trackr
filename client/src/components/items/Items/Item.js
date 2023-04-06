import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon, List } from 'semantic-ui-react';

import getIcon from '../../../utils/getIcon';
import { isDateStatusValid } from '../../../utils/dateUtils';
import GameObjectiveBookmark from '../../gameObjectives/GameObjectives/GameObjectiveBookmark';

export default class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: props.item,
      showBookmarkedUserObjectives: false
    };
  }

  toggleShowBookmarkedUserObjectives() {
    this.setState({ showBookmarkedUserObjectives: !this.state.showBookmarkedUserObjectives });
  }

  render() {
    const item = this.state.item;

    const bookmarkOpen = this.state.showBookmarkedUserObjectives;

    return (
      <List.Item>
        {getIcon(item)}
        <List.Content>
          <List.Header>
            <Link to={`${this.props.match}/${item.title_id}`}>{item.title}</Link>
            {
              (this.props.showBookmarkedUserObjectives && (item.gameObjectives || []).length > 0) &&
              <Icon name={ `angle ${ bookmarkOpen ? 'up' : 'down' }` } size='large' onClick={ this.toggleShowBookmarkedUserObjectives.bind(this) } />
            }
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
            {
              bookmarkOpen &&
              <List>
                { item.gameObjectives.map(gameObjective => (
                  <GameObjectiveBookmark
                    key={gameObjective._id} 
                    gameObjective={ { ...gameObjective, game: item } } 
                  />
                )) }
              </List>
            }
          </List.Description>
        </List.Content>
      </List.Item>
    );
  }
}
