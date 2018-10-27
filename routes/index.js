import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';

import Franchise from '../models/Franchise';
import Item from '../models/Item';
import GameObjective from '../models/GameObjective';
import UserGameObjective from '../models/UserGameObjective';
import UserItem from '../models/UserItem';

const auth = passport.authenticate('jwt', { session: false });
const router = express.Router();

const STATUS_500_MESSAGE = 'Something went wrong';

const isCreator = (model, user) => new mongoose.Types.ObjectId(user._id).equals(model.createdBy._id);

//#region items

router.get('/items', (req, res, next) => {
  Item.find()
  .exec((err, items) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);
    res.json(items);
  });
});

router.get('/items/:id', (req, res, next) => {
  Item.findById(req.params.id)
  .exec((err, item) => {
    if (err) return res.status(404).send('Item not found');
    res.json(item);
  });
});

router.get('/items/title_id/:title_id', (req, res, next) => {
  Item.findOne({ title_id: req.params.title_id })
  .exec((err, item) => {
    if (err) return res.status(404).send('Item not found');
    res.json(item);
  });
});

//#region getTitle_id

const getMaxItemsWithTitleId = title_id => 
  new Promise(resolve =>
    //find param, param_2...
    Item.find({ title_id: new RegExp(`${title_id}(_[1-9][0-9]*)?$`) }).exec(
      (err, items) => 
        resolve(
          err || items.length === 0
            ? 0
            : //get highest number after '_'
              items.reduce(
                (max, item) => {
                  const title_id_number = item.title_id.substr(
                    item.title_id.lastIndexOf('_') + 1
                  );
                  return Math.max(
                    max,
                    //number = 1 if there is no '_'
                    title_id === item.title_id
                      ? 1
                      : isNaN(title_id_number)
                        ? 0
                        : parseInt(title_id_number)
                  )
                }, 0
              )
        )
    )
  );

const toSnakeCase = value =>
  value
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^a-zA-Z0-9-_]/g, '');

const getTitleId = title => {
  const title_id = toSnakeCase(title);
  return getMaxItemsWithTitleId(toSnakeCase(title)).then(
    max => (max === 0 ? title_id : `${title_id}_${max + 1}`)
  );
};

//#endregion

router.post('/items', auth, (req, res, next) => {
  return getTitleId(req.body.title).then(title_id => {
    const item = new Item({ ...req.body, title_id });

    item.save((err, item) => {
      if (err) return res.status(500).send('Something went wrong');
      res.json(item);
    });
  });
});

router.put('/items/:id', auth, (req, res, next) => {
  Item.findById(req.params.id, (err, item) => {
    if (!isCreator(item, req.user)) return res.status(500).send({sucess: false, msg: 'You did not create this item'});

    const newItem = req.body;
    const title = newItem.title;

    const update = newItem => {
      Item.findByIdAndUpdate(item._id, newItem, { new: true }).exec(
        (err, item) => {
          if (err) return res.status(500).send('Something went wrong');
          res.json(item);
        }
      );
    };

    if (title || title == item.title) {
      return getTitleId(title).then(title_id => {
        newItem.title_id = title_id;
        update(newItem);
      });
    } else update(newItem);
  });
});

router.delete('/items/:id', auth, (req, res, next) => {
  Item.findById(req.params.id, (err, item) => {
    if (err) return res.status(500).send({success: false, msg: 'Item not found'});
    if (!isCreator(item, req.user)) return res.status(500).send({sucess: false, msg: 'You did not create this item'});
    
    item.remove((err, item) => {
      if (err) return res.status(500).send('Something went wrong');
      res.json({
        success: true,
        msg: `${item.title} has successfully been removed.`
      });
    });
  });
});

//#endregion items

//#region userItems

router.get('/userItems/:user/:item', (req, res, next) => {
  UserItem.findOne({user: req.params.user, item: req.params.item}, 
    (err, userItem) => {
      if (err) return res.status(500).send({success: false, msg: 'UserItem not found'});
      res.json(userItem);
    }
  );
});

router.get('/userItems/:user', (req, res, next) => {
  UserItem.find({user: req.params.user})
    .populate('item')
    .exec((err, userItems) => {
      if (err) return res.status(500).send({success: false, msg: 'UserItems not found'});
      res.json(userItems);
    }
  );
});

router.post('/userItems', auth, (req, res, next) => {
  const userItem = new UserItem(req.body);

  userItem.save((err, userItem) => {
    if (err) return res.status(500).send({success: false, msg: STATUS_500_MESSAGE});
    res.json(userItem);
  });
});

router.put('/userItems/:id', auth, (req, res, next) => {
  const userItemId = req.params.id;
  UserItem.findById(userItemId, (err, userItem) => {
    if (err) return res.status(500).send({success: false, msg: 'UserItem not found'});
    if (!new mongoose.Types.ObjectId(req.user._id).equals(userItem.user))
      return res.status(500).send({sucess: false, msg: 'You did not create this userItem'});
    
    UserItem.findByIdAndUpdate(userItemId, req.body, { new: true }, (err, userItem) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      res.json(userItem);
    });
  });
});

router.delete('/userItems/:id', auth, (req, res, next) => {
  UserItem.findById(req.params.id)
    .populate('item')
    .exec((err, userItem) => {
      if (err) return res.status(500).send({success: false, msg: 'UserItem not found'});
      if (!new mongoose.Types.ObjectId(req.user._id).equals(userItem.user))
        return res.status(500).send({sucess: false, msg: 'You did not create this userItem'});
    
      const item = userItem.item;

      userItem.remove((err, userItem) => {
        if (err) return res.status(500).send('Something went wrong');
        res.json({
          success: true,
          msg: `${item.title} has successfully been unfollowed.`
        });
      });
    });
});

//#endregion

//#region gameObjectives

const getMaxGameObjectiveId = gameId => 
  new Promise(resolve => 
    GameObjective.find({ game: gameId }).exec(
      (err, gameObjectives) => 
        resolve(
          err || gameObjectives.length === 0
            ? 0
            : //get highest number
              gameObjectives.reduce(
                (max, gameObjective) => {
                  const objectiveId = gameObjective.objective_id || 0;
                  return Math.max(max, isNaN(objectiveId) ? 0 : parseInt(objectiveId))
                }, 0
              )
        )
    )
  );

router.get('/gameObjectives/byGame/:game', (req, res, next) => {
  GameObjective.find({game: req.params.game})
    .exec((err, gameObjectives) => {
      if (err) return res.status(500).send({success: false, msg: 'GameObjectives not found'});
      const firstOrderGameObjectives = gameObjectives.filter(gameObjective => 
        gameObjective.parent === undefined
      );
      res.json(firstOrderGameObjectives);
    }
  );
});

router.get('/gameObjectives/byParent/:parent', (req, res, next) => {
  GameObjective.find({ parent: req.params.parent })
    .exec((err, gameObjectives) => {
      if (err || !gameObjectives) return res.json([]);
      res.json(gameObjectives);
    });
});

router.get('/gameObjectives/objective_id/:game/:objective_id', (req, res, next) => {
  GameObjective.findOne({ game: req.params.game, objective_id: req.params.objective_id })
    .exec((err, gameObjective) => {
      if (err) return res.status(500).send({success: false, msg: 'GameObjective not found'});
      res.json(gameObjective);
    }
  );
});

router.get('/gameObjectives/:id', (req, res, next) => {
  GameObjective.findById(req.params.id)
    .exec((err, gameObjective) => {
      if (err) return res.status(500).send({success: false, msg: 'GameObjective not found'});
      res.json(gameObjective);
    }
  );
});

router.get('/hasSubObjectives/:objective', (req, res, next) => 
  GameObjective.find({ parent: req.params.objective }).exec(
    (err, gameObjectives) => res.send(! (err || gameObjectives.length < 1))
  )
);

router.post('/gameObjectives', auth, (req, res, next) => {
  const gameObjective = new GameObjective(req.body);
  return getMaxGameObjectiveId(gameObjective.game).then(maxObjective => {
    gameObjective.objective_id = (maxObjective + 1);

    gameObjective.save((err, gameObjective) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      res.json(gameObjective);
    });
  });
});

router.delete('/gameObjectives/:id', auth, (req, res, next) => {
  GameObjective.findById(req.params.id, (err, gameObjective) => {
    if (err) return res.status(500).send({success: false, msg: 'GameObjective not found'});
    if (!isCreator(gameObjective, req.user)) return res.status(500).send({sucess: false, msg: 'You did not create this game objective'});
    
    gameObjective.remove((err, gameObjective) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      res.json({
        success: true,
        msg: `${gameObjective.objective} has successfully been removed.`
      });
    });
  });
});

router.put('/gameObjectives/:id', auth, (req, res, next) => {
  const gameObjectiveId = req.params.id;
  GameObjective.findById(gameObjectiveId, (err, gameObjective) => {
    console.log(gameObjective);
    if (!isCreator(gameObjective, req.user)) return res.status(500).send({sucess: false, msg: 'You did not create this gameObjective'});

    GameObjective.findByIdAndUpdate(gameObjectiveId, req.body, { new: true }).exec(
      (err, gameObjective) => {
        if (err) return res.status(500).send(STATUS_500_MESSAGE);
        res.json(gameObjective);
      }
    )
    
  });
});

//#endregion

//#region userGameObjectives

router.get('/userGameObjectives/:user/:gameObjective', (req, res, next) => {
  UserGameObjective.findOne({
    gameObjective: req.params.gameObjective,
    user: req.params.user
  }, (err, userGameObjective) => {
    if (err || userGameObjective === null)
      return res.status(404).send('userGameObjective not found');
    res.json(userGameObjective);
  });
});

router.post('/userGameObjectives', auth, (req, res, next) => {
  const userGameObjective = new UserGameObjective(req.body);
  userGameObjective.save((err, userGameObjective) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);
    res.json(userGameObjective);
  });
});

router.delete('/userGameObjectives/:id', auth, (req, res, next) => {
  UserGameObjective.findById(req.params.id, (err, userGameObjective) => {
    if (err) return res.status(404).send('UserGameObjective not found');
    userGameObjective.remove((err, userGameObjective) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      res.json(userGameObjective);
    });
  });
});

//#endregion userGameObjectives

router.get('/artists', (req, res, next) => {
  Item.find({ artist : {'$exists': true}}, (err, items) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);
    res.json(
      items.map(item => item.artist)
        .filter((artist, index, artists) => artists.indexOf(artist) === index)
        .sort()
    );
  });
});

//#region franchises

router.get('/franchises', (req, res, next) => {
  Franchise.find((err, franchises) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);
    res.json(franchises);
  });
});

//#endregion franchises

export default router;
