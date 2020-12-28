import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';

import Franchise from '../models/Franchise';
import Item from '../models/Item';
import GameObjective from '../models/GameObjective';
import List from '../models/List';
import User from '../models/User';
import UserGameObjective from '../models/UserGameObjective';
import UserItem from '../models/UserItem';

const auth = passport.authenticate('jwt', { session: false });
const router = express.Router();

const STATUS_500_MESSAGE = 'Something went wrong';

const isCreator = (model, user) => stringToId(user._id).equals(model.createdBy._id);
const stringToId = (idString) => new mongoose.Types.ObjectId(idString);

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

const getMaxItemsWithTitleId = (title_id, model) => 
  new Promise(resolve =>
    //find param, param_2...
    model.find({ title_id: new RegExp(`${title_id}(_[1-9][0-9]*)?$`) }).exec(
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

const getTitleId = (title, model) => {
  const title_id = toSnakeCase(title);
  return getMaxItemsWithTitleId(title_id, model).then(
    max => (max === 0 ? title_id : `${title_id}_${max + 1}`)
  );
};

//#endregion

router.post('/items', auth, (req, res, next) => {
  return getTitleId(req.body.title, Item).then(title_id => {
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

    if (title && title !== item.title) {
      return getTitleId(title, Item).then(title_id => {
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

router.get('/users/:userId/userItems/inProgress', (req, res, next) => {
  const statusesInProgress = ['Doing', 'Listening', 'Playing', 'Reading', 'Watching'];
  
  User.aggregate([
    { $match: { _id: stringToId(req.params.userId) } },
    { $project: {
      userItems: { $filter: {
        input: '$userItems',
        as: 'userItem',
        cond: { $in: [ '$$userItem.status', statusesInProgress ] }
      } }
    } }
  ], (err, user) => {
    if (err) return res.status(500).send({success: false, msg: 'UserItem not found'});
    if (!user.length) return res.json(null);
    User.populate(user, {path: 'userItems.item'}, (err, user) => {
      res.json(user[0].userItems);
    });
  });
});

router.get('/users/:userId/userItems/:itemId', (req, res, next) => {
  User.aggregate([
    { $match: { _id: stringToId(req.params.userId) } },
    { $unwind: '$userItems' },
    { $match: { 'userItems.item': stringToId(req.params.itemId) } },
    { $project: { userItems: 1 } }
  ], (err, user) => {
    if (err) return res.status(500).send({success: false, msg: 'UserItem not found'});
    if (!user.length) return res.json(null);
    res.json(user[0].userItems);
  });
});

router.get('/users/:userId/userItems', (req, res, next) => {
  User.findById(req.params.userId)
    .select({ userItems: 1})
    .populate('userItems.item')
    .exec((err, user) => {
      if (err) return res.status(500).send({success: false, msg: 'UserItems not found'});
      res.json(user.userItems);
    }
  );
});

router.get('/items/:itemId/reviews', (req, res, next) => {
  User.aggregate([
    { $unwind: '$userItems' },
    { $match: { 'userItems.item': stringToId(req.params.itemId) } },
    { $project: {
      userItems: 1,
      username: 1,
      isAnyTrue: { $anyElementTrue: [ "$userItems.reviews" ] }
    } }
  ], (err, users) => {
    if (err) return res.status(500).send({success: false, msg: 'UserItem not found'});
    if (!users.length) return res.json([]);

    return res.json(
      users.map((user) => user.userItems.reviews.map((review) => { return {
          _id: review._id,
          rating: review.rating,
          review: review.review,
          timestamp: review.timestamp,
          author: user.username
        } }))
        .reduce((reviews, userItemReviews) => [ ...reviews, ...userItemReviews ])
    );
  });
});

router.post('/users/:userId/userItems', auth, (req, res, next) => {
  const userItem = new UserItem(req.body);

  return User.updateOne(
    { _id: req.params.userId }, 
    { $push: { userItems: userItem } },
    (err, _) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      res.json(userItem);
    }
  );
});

router.put('/users/:userId/userItems/:id', auth, (req, res, next) => {
  User.update(
    { 'userItems._id': stringToId(req.params.id) },
    { '$set': { 'userItems.$': req.body }},
    (err, _) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
    }
  );
});

router.delete('/users/:userId/userItem/:id', auth, (req, res, next) => {
  return User.updateOne(
    { _id: req.params.userId }, 
    { $pull: { userItems: { _id: req.params.id } } },
    (err, _) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      res.json({ success: true });
    }
  );
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

router.get('/users/:userId/userGameObjectives/byGame/:itemId', (req, res, next) => {
  User.aggregate([
    { $match: { _id: stringToId(req.params.userId) } },
    { $unwind: '$userItems' },
    { $match: { 'userItems.item': stringToId(req.params.itemId) } },
    { $project: { userItems: 1 } }
  ], (err, user) => {
    if (err) return res.status(500).send({success: false, msg: 'UserItem not found'});
    if (!user.length) return res.json(null);
    res.json(user[0].userItems.userGameObjectives);
  });
});

router.get('/userGameObjectives/:user/game/:game', (req, res, next) => {
  GameObjective.find({game: req.params.game}).exec((err, gameObjectives) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);

    const gameObjectivesIds = gameObjectives.map(gameObjective => gameObjective._id);

    UserGameObjective.find({
      user: req.params.user,
      gameObjective: { $in: gameObjectivesIds }
    }).exec((err, userGameObjectives) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      res.json(userGameObjectives);
    });
  });
});

router.post('/users/:userId/userGameObjectives/byGame/:itemId', auth, (req, res, next) => {
  const userGameObjective = new UserGameObjective(req.body);
  
  return User.update(
    {
      '_id': req.params.userId,
      'userItems.item': req.params.itemId
    },
    { '$push': { 'userItems.$.userGameObjectives': userGameObjective } },
    (err, _) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      res.json(userGameObjective);
    }
  );
});

router.post('/userGameObjectives', auth, (req, res, next) => {
  const userGameObjective = new UserGameObjective(req.body);
  userGameObjective.save((err, userGameObjective) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);
    res.json(userGameObjective);
  });
});

router.put('/userGameObjectives/:id', auth, (req, res, next) => {
  const userGameObjectiveId = req.params.id;
  UserGameObjective.findById(userGameObjectiveId, (err, userGameObjective) => {
    if (err) return res.status(500).send({success: false, msg: 'UserGameObjective not found'});

    if (!stringToId(req.user._id).equals(userGameObjective.user)) {
      return res.status(500).send({sucess: false, msg: 'You did not create this userGameObjective'});
    }
    
    UserGameObjective.findByIdAndUpdate(userGameObjectiveId, req.body, { new: true }, (err, userGameObjective) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      return res.json(userGameObjective);
    });
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
  Item.find({ artists : {'$exists': true}}, (err, items) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);

    let allArtists = [];
    items.map(item => item.artists).forEach(itemArtists => {
      itemArtists.forEach(artist => {
        if (allArtists.indexOf(artist) === -1) {
          allArtists.push(artist);
        }
      });
    });

    res.json(allArtists.sort());
  });
});

router.get('/genres', (req, res, next) => {
  Item.find({ genres : {'$exists': true}}, (err, items) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);

    let allGenres = [];
    items.map(item => item.genres).forEach(itemGenres => {
      itemGenres.forEach(genre => {
        if (allGenres.indexOf(genre) === -1) {
          allGenres.push(genre);
        }
      });
    });

    res.json(allGenres.sort());
  });
});

router.get('/platforms', (req, res, next) => {
  Item.find({ platforms : {'$exists': true}}, (err, items) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);

    let allPlatforms = [];
    items.map(item => item.platforms).forEach(itemPlatforms => {
      itemPlatforms.forEach(platform => {
        if (allPlatforms.indexOf(platform) === -1) {
          allPlatforms.push(platform);
        }
      });
    });

    res.json(allPlatforms.sort());
  });
});

//#region franchises

router.get('/franchises', (req, res, next) => {
  Franchise.find((err, franchises) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);
    res.json(franchises);
  });
});

router.get('/franchises/title_id/:title_id', (req, res, next) => {
  Franchise.findOne({ title_id: req.params.title_id })
  .populate('items')
  .populate('subFranchises')
  .exec((err, franchise) => {
    if (err) return res.status(404).send('Franchise not found');
    res.json(franchise);
  });
});

router.delete('/franchises/:id', auth, (req, res, next) => {
  Franchise.findById(req.params.id, (err, franchise) => {
    if (err) return res.status(500).send({success: false, msg: 'Franchise not found'});
    if (!isCreator(franchise, req.user)) return res.status(500).send({sucess: false, msg: 'You did not create this franchise'});
    
    franchise.remove((err, franchise) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      res.json({
        success: true,
        msg: `${franchise.title} has successfully been removed.`
      });
    });
  });
});

router.post('/franchises', auth, (req, res, next) => {
  return getTitleId(req.body.title, Franchise).then(title_id => {
    const franchise = new Franchise({ ...req.body, title_id });

    franchise.save((err, franchise) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      res.json(franchise);
    });
  });
});

router.put('/franchises/:id', auth, (req, res, next) => {
  Franchise.findById(req.params.id, (err, franchise) => {
    if (!isCreator(franchise, req.user)) return res.status(500).send({sucess: false, msg: 'You did not create this franchise'});

    const newFranchise = req.body;
    const title = newFranchise.title;

    const update = newFranchise => {
      Franchise.findByIdAndUpdate(franchise._id, newFranchise, { new: true }).exec(
        (err, franchise) => {
          if (err) return res.status(500).send(STATUS_500_MESSAGE);
          res.json(franchise);
        }
      );
    };

    if (title && title !== franchise.title) {
      return getTitleId(title, Franchise).then(title_id => {
        newFranchise.title_id = title_id;
        update(newFranchise);
      });
    } else update(newFranchise);
  });
});

router.put('/franchises/:id/items/add', auth, (req, res, next) => {
  const items = req.body;
  return Franchise.updateOne(
    { _id: req.params.id }, 
    { $push: { items: { $each: items } } },
    (err, test) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      return Promise.all(items.map(itemId => 
        Item.findById(itemId).exec()
      )).then(completeItems => res.json(completeItems));
    }
  );
});

router.put('/franchises/:id/items/remove', auth, (req, res, next) => {
  const items = req.body;
  return Franchise.updateOne(
    { _id: req.params.id }, 
    { $pullAll: { items: items } },
    (err, test) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      return Promise.all(items.map(itemId => 
        Item.findById(itemId).exec()
      )).then(completeItems => res.json(completeItems));
    }
  );
});

router.get('/franchises/byItem/:item', (req, res, next) => {
  Franchise.find({ items: stringToId(req.params.item) }, (err, franchises) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);
    return res.json(franchises);
  })
});

router.get('/franchises/bySubFranchise/:subFranchise', (req, res, next) => {
  Franchise.find({ subFranchises: stringToId(req.params.subFranchise) }, (err, franchises) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);
    return res.json(franchises);
  })
});

router.put('/franchises/addFranchiseToMultiple/:subFranchise', (req, res, next) => {
  const franchises = req.body;
  return Franchise.update(
    { '_id': { $in: franchises } }, 
    { $push: { subFranchises: req.params.subFranchise } },
    { multi: true },
    (err, test) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      return Promise.all(franchises.map(franchiseId => 
        Franchise.findById(franchiseId).exec()
      )).then(completeFranchises => res.json(completeFranchises));
    }
  );
});

router.put('/franchises/addItemToMultiple/:item', (req, res, next) => {
  const franchises = req.body;
  return Franchise.update(
    { '_id': { $in: franchises } }, 
    { $push: { items: req.params.item } },
    { multi: true },
    (err, test) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      return Promise.all(franchises.map(franchiseId => 
        Franchise.findById(franchiseId).exec()
      )).then(completeFranchises => res.json(completeFranchises));
    }
  );
});

router.put('/franchises/:id/subFranchises/add', auth, (req, res, next) => {
  const subFranchises = req.body;
  return Franchise.updateOne(
    { _id: req.params.id }, 
    { $push: { subFranchises: { $each: subFranchises } } },
    (err, test) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      return Promise.all(subFranchises.map(subFranchiseId => 
        Franchise.findById(subFranchiseId).exec()
      )).then(completeSubFranchises => res.json(completeSubFranchises));
    }
  );
});

router.put('/franchises/:id/subFranchises/remove', auth, (req, res, next) => {
  const franchises = req.body;
  return Franchise.updateOne(
    { _id: req.params.id }, 
    { $pullAll: { subFranchises: franchises } },
    (err, test) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      return Promise.all(franchises.map(franchiseId => 
        Franchise.findById(franchiseId).exec()
      )).then(completeFranchises => res.json(completeFranchises));
    }
  );
});

//#endregion franchises

//#region lists

router.get('/lists', (req, res, next) => {
  List.find((err, lists) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);
    res.json(lists);
  });
});

router.get('/lists/title_id/:title_id', (req, res, next) => {
  List.findOne({ title_id: req.params.title_id })
    .populate('items.item')
    .exec((err, list) => {
      if (err) return res.status(404).send('List not found');
      res.json(list);
    });
});

router.delete('/lists/:id', auth, (req, res, next) => {
  List.findById(req.params.id, (err, list) => {
    if (err) return res.status(500).send({success: false, msg: 'List not found'});
    if (!isCreator(list, req.user)) return res.status(500).send({sucess: false, msg: 'You did not create this list'});
    
    list.remove((err, list) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      res.json({
        success: true,
        msg: `${list.title} has successfully been removed.`
      });
    });
  });
});

router.post('/lists', auth, (req, res, next) => {
  return getTitleId(req.body.title, List).then(title_id => {
    const list = new List({ ...req.body, title_id });

    list.save((err, list) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      res.json(list);
    });
  });
});

router.put('/lists/:id', auth, (req, res, next) => {
  List.findById(req.params.id, (err, list) => {
    if (!isCreator(list, req.user)) return res.status(500).send({sucess: false, msg: 'You did not create this list'});

    const newList = req.body;
    const title = newList.title;

    const update = newList => {
      List.findByIdAndUpdate(list._id, newList, { new: true }).exec(
        (err, list) => {
          if (err) return res.status(500).send(STATUS_500_MESSAGE);
          res.json(list);
        }
      );
    };

    if (title && title !== list.title) {
      return getTitleId(title, List).then(title_id => {
        newList.title_id = title_id;
        update(newList);
      });
    } else update(newList);
  });
});

router.put('/lists/:id/items/add', auth, (req, res, next) => {
  const items = req.body;
  return List.updateOne(
    { _id: req.params.id }, 
    { $push: { items: { $each: items } } },
    (err, _) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      return Promise.all(items.map(item => 
        mongoose.model(item.itemModel).findById(item.item).exec()
      )).then(completeItems => res.json(completeItems));
    }
  );
});

router.put('/lists/:id/items/remove', auth, (req, res, next) => {
  const items = req.body;
  return List.updateOne(
    { _id: req.params.id }, 
    { $pull: { items: { item: { $in: items } } } },
    (err) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      return Promise.all(items.map(item => 
        Item.findById(item.item).exec()
      )).then(completeItems => res.json(completeItems));
    }
  );
});

router.get('/lists/byItem/:item', (req, res, next) => {
  List.find({ items: stringToId(req.params.item) }, (err, lists) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);
    return res.json(lists);
  })
});

router.put('/lists/addItemToMultiple/:item', (req, res, next) => {
  const lists = req.body;
  return List.update(
    { '_id': { $in: lists } }, 
    { $push: { items: req.params.item } },
    { multi: true },
    (err, test) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      return Promise.all(lists.map(listId => 
        List.findById(listId).exec()
      )).then(completeLists => res.json(completeLists));
    }
  );
});

//#endregion lists

//#region users

router.get('/users', (req, res, next) => {
  User.find().exec((err, items) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);
    return res.json(items);
  });
});

router.get('/users/byUsername/:username', (req, res, next) => {
  User.findOne({ username: req.params.username }).exec((err, user) => {
    if (err) return res.status(404).send('User not found');
    return res.json(user);
  });
});

router.put('/users/:id', auth, (req, res, next) => {
  User.findById(req.params.id, (err, user) => {
    if (!stringToId(req.user._id).equals(user._id)) {
      return res.status(500).send({sucess: false, msg: 'Unauthorized'});
    }

    delete req.body.password; //Don't allow changing of password via this endpoint

    User.findByIdAndUpdate(user._id, req.body, { new: true }, (err, user) => {
      if (err) return res.status(500).send('Something went wrong');
      return res.json(user);
    });
  });
});

router.delete('/users/:id', auth, (req, res, next) => {
  User.findById(req.params.id, (err, user) => {
    if (err) return res.status(500).send({success: false, msg: 'User not found'});
    if (!req.user.isAdmin) return res.status(500).send({sucess: false, msg: 'You do not have permission'});
    
    user.remove((err, user) => {  
      if (err) return res.status(500).send('Something went wrong');
      res.json({
        success: true,
        msg: `${user.username} has successfully been removed.`
      });
    });
  });
});

//#endregion users

export default router;
