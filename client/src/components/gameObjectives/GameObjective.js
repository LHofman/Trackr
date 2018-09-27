import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Confirm, Icon, List } from 'semantic-ui-react';

import canEdit from '../../utils/canEdit';

class GameObjective extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameObjective: props.gameObjective,
      confirmationAlert: false
    }
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
      </List.Item>
    );
  }
}

export default GameObjective;
