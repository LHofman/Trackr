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
      confirmationAlert: false,
      following: props.following,
      gameObjective: props.gameObjective,
      hasSubObjectives: false,
      modalHintOpen: false,
      showHint: false,
      viewTitle: false,
    }

    this.closeModals = this.closeModals.bind(this);
  }

  componentWillMount() {
    this.hasSubObjectives();
  }

  getEditUrl() {
    const { game, parent } = this.state.gameObjective;
    let editUrl = `/objectives/${game.title_id}`;
    if (parent) editUrl += `/subObjectives/${parent.objective_id}`;
    return editUrl.concat(`/${this.state.gameObjective.objective_id}/edit`);
  }

  hasSubObjectives() {
    fetch(`/api/hasSubObjectives/${this.state.gameObjective._id}`).then(result => {
      this.setState({ hasSubObjectives: result });
    });
  }

  hideConfirmationAlert() {
    this.setState({ confirmationAlert: false });
  }

  hideHint() {
    this.setState({showHint: false});
  }

  onDelete() {
    this.hideConfirmationAlert();
    this.props.onDelete(this.state.gameObjective);
  }

  showConfirmationAlert() {
    this.setState({ confirmationAlert: true });
  }

  showHint() {
    // this.setState({ modalHintOpen: true });
    this.setState({showHint: true});
  }

  viewTitle() {
    this.setState({viewTitle: true})
  }

  updateUserObjective() {
    let gameObjective = this.state.gameObjective;
    let userGameObjective = gameObjective.userGameObjective;
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
      gameObjective.userGameObjective = userGameObjective;
      this.setState({ gameObjective });
      this.props.refreshParent();
    });
  }

  closeModals() {
    this.setState({ modalHintOpen: false });
  }

  render() {
    const gameObjective = this.state.gameObjective;
    const spoiler = gameObjective.spoiler && !this.state.viewTitle;
    const name = spoiler ? 'spoilers' : gameObjective.objective;

    return (
      <List.Item>
        <List.Content>
          <List.Header style={{ float: 'left' }} >
            {`${gameObjective.index}. `}
            {
              this.state.hasSubObjectives ?
                <a href={`/objectives/${gameObjective.game.title_id}/subObjectives/${gameObjective.objective_id}`}>
                  { name }
                </a> : name
            }
            {
              this.state.following &&
              <div style={{ float: 'left', marginRight:'1em'}}>
                <Checkbox key='completed' name='completed' checked={(gameObjective.userGameObjective || { completed: false }).completed} 
                  onChange={this.updateUserObjective.bind(this)} />
              </div>
            }
            {
              spoiler &&
              <Icon name='eye' onClick={this.viewTitle.bind(this)} />
            }
            {
              this.state.gameObjective.hint &&
              <div style={{ display: 'inline' }}
                onMouseEnter={this.showHint.bind(this)}
                onMouseLeave={this.hideHint.bind(this)}>
                <Icon name='help' />
                {
                  this.state.showHint &&
                  <div><br/>{this.state.gameObjective.hint}</div>
                }
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
