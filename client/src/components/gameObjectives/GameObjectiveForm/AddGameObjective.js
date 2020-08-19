import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import fetch from '../../../utils/fetch';
import GameObjectiveForm from './GameObjectiveForm';

class AddObjective extends Component {
  constructor() {
    super();
    this.state = {
      backUrl: '',
      game: undefined,
      parent: undefined,
      isLoaded: false,
      redirect: undefined
    }
  }

  componentWillReceiveProps(newProps) {
    this.init(newProps);
  }

  componentWillMount() {
    this.init(this.props);
  }

  init(props) {
    const params = props.match.params;
    const title_id = params.titleId;
    const parent_id = params.parentId;

    let backUrl = `/objectives/${title_id}`;
    if (parent_id) backUrl += `/subObjectives/${parent_id}`;
    
    this.setState({ backUrl });
    this.getGame(title_id).then(() => {
      (parent_id ? this.getParent(parent_id) : Promise.resolve()).then(() => {
        this.setState({ isLoaded: true });
      })
    });
  }

  getGame(title_id) {
    return fetch(`/api/items/title_id/${title_id}`).then(item => {
      if (!item || item === null || item.type !== 'Video Game') throw new Error('Game not found');
      this.setState({game: item})
    }).catch(reason => {
      this.setState({redirect: '/'});
    });
  }

  getParent(objective_id) {
    return fetch(`/api/gameObjectives/objective_id/${this.state.game._id}/${objective_id}`).then(gameObjective => {
      if (!gameObjective) throw new Error('Parent not found');
      this.setState({ parent: gameObjective });
    }).catch(reason => {
      this.setState({redirect: '/'});
    });
  }

  addObjective(newObjective) {
    newObjective.game = this.state.game;
    if (this.state.parent) {
      newObjective.parent = this.state.parent._id;
    }

    return fetch('/api/gameObjectives', 'post', true, newObjective).then(gameObjective => {
      this.setState({redirect: this.state.backUrl});
    }).catch(console.log);
  }

  render() {
    const redirect = this.state.redirect;
    if (redirect) return <Redirect to={redirect} />

    if (!this.state.isLoaded) {
      return null;
    }

    return (
      <GameObjectiveForm
        title='Add Objective'
        submitButtonText='Submit'
        updateGameObjective={ this.addObjective.bind(this) }
        cancelUrl={ this.state.backUrl } />
    );
  }
}

export default AddObjective;
