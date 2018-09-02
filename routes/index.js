import express from 'express';

import Item from '../models/Item';

const router = express.Router();

const STATUS_500_MESSAGE = 'Something went wrong';

//#region items

router.get('/items', (req, res, next) => {
  Item.find((err, items) => {
      if (err) return res.status(500).send(STATUS_500_MESSAGE);
      res.json(items);
    });
});

router.get('/items/:id', (req, res, next) => {
  Item.findById(req.params.id, (err, item) => {
      if (err) return res.status(404).send('Item not found');
      res.json(item);
    });
});

router.post('/items', (req, res, next) => {
  const item = new Item(req.body);
  item.save((err, item) => {
    if (err) return res.status(500).send('Something went wrong');
    res.json(item);
  });
});

router.put('/items/:id', (req, res, next) => {
  const item = req.body;
  Item.findOneAndUpdate(
    { _id: req.params.id },
    item,
    {new: true}, //options
    (err, newItem) => {
      if (err) return res.status(404).send('Item not found');
      res.json(item);
    }
  );
});

router.delete('/items/:id', auth, (req, res, next) => {
  Item.findById(req.params.id, (err, item) => {
    if (err) return res.status(500).send({success: false, msg: 'Item not found'});
    
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

export default router;
