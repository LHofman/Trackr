import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Checkbox, Confirm, Header, Icon, List, Modal } from 'semantic-ui-react';

import canEdit from '../../utils/canEdit';
import fetch from '../../utils/fetch';
import getUser from '../../utils/getUser';
import isLoggedIn from '../../utils/isLoggedIn';

class GameObjective extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gameObjective: props.gameObjective,
      following: props.following,
      hasSubObjectives: false,
      userGameObjective: undefined,
      confirmationAlert: false,
      modalOpen: false
    }

    this.closeModal = this.closeModal.bind(this);
  }

  componentWillMount() {
    this.hasSubObjectives();
    if (this.state.following) this.getUserGameObjective();
  }

  hasSubObjectives() {
    fetch(`/api/hasSubObjectives/${this.state.gameObjective._id}`).then(result => {
      this.setState({ hasSubObjectives: result });
    });
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

  updateUserObjective() {
    let userGameObjective = this.state.userGameObjective;
    new Promise(resolve => {
      if (userGameObjective) {
        fetch(`/api/userGameObjectives/${userGameObjective._id}`, 'delete', true).then(newUserGameObjective => {
          userGameObjective = undefined;
          resolve()
        });
      } else {
        const newUserGameObjective = {
          gameObjective: this.state.gameObjective._id,
          user: getUser().id,
          completed: true
        }
        fetch(`/api/userGameObjectives`, 'post', true, newUserGameObjective).then(newUserGameObjective => {
          userGameObjective = newUserGameObjective;
          resolve()
        });
      }
    }).then(() => {
      this.setState({ userGameObjective, modalOpen: true });
    });
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  getEditUrl() {
    const { game, parent } = this.state.gameObjective;
    let editUrl = `/objectives/${game.title_id}`;
    if (parent) editUrl += `/subObjectives/${parent.objective_id}`;
    return editUrl.concat(`/${this.state.gameObjective.objective_id}/edit`);
  }

  render() {
    const gameObjective = this.state.gameObjective;
    return (
      <List.Item>
        <List.Content>
          <List.Header style={{ float: 'left' }} >
            {`${gameObjective.index}. `}
            {
              this.state.hasSubObjectives ?
                <a href={`/objectives/${gameObjective.game.title_id}/subObjectives/${gameObjective.objective_id}`}>
                  { gameObjective.objective }
                </a> :
                gameObjective.objective
            }
            {
              this.state.following &&
              <div style={{ float: 'left', marginRight:'1em'}}>
                <Checkbox key='completed' name='completed' checked={(this.state.userGameObjective || { completed: false }).completed} 
                  onChange={this.updateUserObjective.bind(this)} />
                <Modal key='message'
                  open={this.state.modalOpen}
                  onClose={this.closeModal}
                  basic
                  size='small'>
                  <Header icon='browser' content='Item updated' />
                  <Modal.Actions>
                    <Button color='green' onClick={this.closeModal} inverted >
                      <Icon name='checkmark' /> Got it
                    </Button>
                  </Modal.Actions>
                </Modal>
              </div>
            }
            {
              isLoggedIn() && !this.state.hasSubObjectives &&
              <Link to={`/objectives/${gameObjective.game.title_id}/subObjectives/${gameObjective.objective_id}/add`}>
                <Icon name='angle double down' color='green' />
              </Link>
            }
            {
              canEdit(this.props.gameObjective) &&
              <div style={{ display: 'inline' }}>
                <Link to={this.getEditUrl()}>
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
        {
          this.props.count <= 15 &&
          <div><br/><br/></div>
        }
      </List.Item>
    );
  }
}

export default GameObjective;
