import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox, Confirm, Icon, List } from 'semantic-ui-react';

import canEdit from '../../utils/canEdit';
import fetch from '../../utils/fetch';
import getUser from '../../utils/getUser';

class GameObjective extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameObjective: props.gameObjective,
      following: props.following,
      userGameObjective: undefined,
      confirmationAlert: false
    }
  }

  componentWillMount() {
    if (this.state.following) this.getUserGameObjective();
  }

  getUserGameObjective() {
    const user = getUser();
    if (!user) return;
    return fetch(`/api/userGameObjectives/${user.id}/${this.state.gameObjective._id}`, 'get', true).then(userGameObjective => {
      if (userGameObjective) this.setState({ userGameObjective });
    }).catch(reason => {});
  }

  showConfirmationAlert() {
    this.setState({ confirmationAlert: true });
  }

  hideConfirmationAlert() {
    this.setState({ confirmationAlert: false });
  }

  onDelete() {
    this.hideConfirmationAlert();
    this.props.onDelete(this.state.gameObjective);
  }

  render() {
    const gameObjective = this.state.gameObjective;
    return (
      <List.Item>
        <List.Content>
          <List.Header style={{ float: 'left' }} >
            {`${gameObjective.index}. ${gameObjective.objective}`}
            {
              this.state.following &&
              <Checkbox key='completed' name='completed' checked={(this.state.userGameObjective || { completed: false }).completed} 
                style={{ float: 'left', marginRight:'1em'}} />
            }
            {
              canEdit(this.props.gameObjective) &&
              <div style={{ display: 'inline' }}>
                <Link to={`/items/${this.props.gameObjective.game.title_id}/objectives/${this.props.gameObjective.objective_id}/edit`}>
                  <Icon name='edit' color='orange' />
                </Link>
                <Icon name='trash' color='red' onClick={this.showConfirmationAlert.bind(this)} />
              </div>
            }
            <Confirm
              open={this.state.confirmationAlert}
              header={`confirm deletion`}
              content={`Are you sure you want to delete ${this.state.gameObjective.objective}?`}
              onCancel={this.hideConfirmationAlert.bind(this)}
              onConfirm={this.onDelete.bind(this)}
            />
          </List.Header>
        </List.Content>
        <br/><br/>
      </List.Item>
    );
  }
}

export default GameObjective;
