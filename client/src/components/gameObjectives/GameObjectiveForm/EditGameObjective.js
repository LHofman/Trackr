import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import fetch from '../../../utils/fetch';
import GameObjectiveForm from './GameObjectiveForm';

class EditGameObjective extends Component {
  constructor() {
    super();
    this.state = {
      game: undefined,
      id: '',
      backUrl: '',
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
      this.setState({ isLoaded: true });
    });
  }

  getGame(title_id) {
    return fetch(`/api/items/title_id/${title_id}`).then(item => {
      if (!item || item.type !== 'Video Game') throw new Error('Game not Found');
      this.setState({ game: item });
    }).catch(console.log);
  }

  getGameObjective() {
    const objectiveId = this.props.match.params.objectiveId;
    return new Promise((resolve) => {
      fetch(`/api/gameObjectives/objective_id/${this.state.game._id}/${objectiveId}`).then((details) => {
        this.setState({ id: details._id });
        resolve({ details });
      }).catch(console.log);
    });
  }

  editObjective(gameObjective) {
    return fetch(`/api/gameObjectives/${this.state.id}`, 'put', true, gameObjective).then(gameObjective => {
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
        title='Edit Objective'
        getDetails={ this.getGameObjective.bind(this) }
        submitButtonText='Submit'
        updateGameObjective={ this.editObjective.bind(this) }
        cancelUrl={ this.state.backUrl } />
    );
  }
}

export default EditGameObjective;
