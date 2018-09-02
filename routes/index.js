import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';

import Item from '../models/Item';
import UserItem from '../models/UserItem';

const auth = passport.authenticate('jwt', { session: false });
const router = express.Router();

const STATUS_500_MESSAGE = 'Something went wrong';

//#region items

router.get('/items', (req, res, next) => {
  Item.find()
  .populate({ path: 'createdBy', select: 'username' })
  .exec((err, items) => {
    if (err) return res.status(500).send(STATUS_500_MESSAGE);
    res.json(items);
  });
});

router.get('/items/:id', (req, res, next) => {
  Item.findById(req.params.id)
  .populate({ path: 'createdBy', select: 'username' })
  .exec((err, item) => {
    if (err) return res.status(404).send('Item not found');
    res.json(item);
  });
});

router.get('/items/title_id/:title_id', (req, res, next) => {
  Item.findOne({ title_id: req.params.title_id })
  .populate({ path: 'createdBy', select: 'username' })
  .exec((err, item) => {
    if (err) return res.status(404).send('Item not found');
    res.json(item);
  });
});

//#region getTitle_id

const getMaxItemsWithTitleId = title_id =>
  new Promise(resolve =>
    //find param, param_2...
    Item.find({ title_id: new RegExp(title_id + '(_[1-9][0-9]*)?') }).exec(
      (err, items) =>
        resolve(
          err || items.length === 0
            ? 0
            : //get highest number after '_'
              items.reduce(
                (max, item) =>
                  Math.max(
                    max,
                    //number = 1 if there is no '_'
                    title_id === item.title_id
                      ? 1
                      : parseInt(
                          item.title_id.substr(
                            item.title_id.lastIndexOf('_') + 1
                          )
                        )
                  ),
                0
              )
        )
    )
  );

const toSnakeCase = value =>
  value
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/\//g, '_');

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

const isCreator = (model, user) => new mongoose.Types.ObjectId(user._id).equals(model.createdBy);

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

router.post('/userItems', auth, (req, res, next) => {
  const userItem = new UserItem(req.body);

  userItem.save((err, userItem) => {
    if (err) return res.status(500).send({success: false, msg: STATUS_500_MESSAGE});
    res.json(userItem);
  });
});

//#endregion

export default router;
