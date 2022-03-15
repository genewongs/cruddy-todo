const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

/*
0. Server receives TODO event
1. get a unique ID
   - id will be retrieved from a file
   - id will be incremented and saved to file
   - return id ?? and assign to local variable ??
2. save the new item in the <items> object
3. IMO we should save the item to a file, just like getNextUniqueID does
4. Upon successful callback, return the new item

*/
// exports.create = (text, callback) => {
//   var id = counter.getNextUniqueId(x => x);
//   counter.getNextUniqueId(x => items[x] = text);
//   items[id] = text;
//   console.log(`id: ${id}`);
//   console.log(`items: ${items}.`);
//   callback(null, { id, text });
// };

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    items[id] = text;
    const dir = `${exports.dataDir}/${id}.txt`;
    fs.writeFile(dir, text, (err, fileData) => {
      if (err) {
        callback(Error('Could not create todo'));
      } else {
        callback(null, { id, text });
      }
    });
  });
};

exports.readAll = (callback) => {
  // const data = [];
  // const files = await fs.promises.readdir(exports.dataDir, 'utf8')
  //   .catch(Error('Error'))
  // for (file of files) {
  //   const id = file.split('.')[0];
  //   const text = await fs.promises.readFile(`${exports.dataDir}/${file}`, 'utf8')
  //     .catch(Error('Error'));
  //   data.push({ id, text });
  // }
  // callback(null, data)

  // const data = _.map(items, (text, id) => {
  //   return { id, text };
  // });
  // callback(null, data);

  fs.promises.readdir(exports.dataDir, 'utf8')
    .then(files => {
      const promises = files.map(file => {
        const id = file.split('.')[0];
        return fs.promises.readFile(`${exports.dataDir}/${file}`, 'utf8')
          .then(text => ({ id, text, }));
      });

      Promise.all(promises)
        .then(results => callback(null, results))
        .catch(err => callback(err));
    });
};

exports.readOne = (id, callback) => {
  // const text = items[id];
  // const dir = `${exports.dataDir}/${id}.txt`;
  // const files = await fs.promises.readdir(exports.dataDir, 'utf8')
  // const fileText = await fs.promises.readFile(dir, 'utf8')
  //   .catch(x => { console.log(x); return x });

  // if (!files.includes(id + '.txt')) {
  //   callback(Error('id not found'), null);
  // } else {
  //   callback(null, { id, text: fileText });
  // }
  const path = `${exports.dataDir}/${id}.txt`;

  fs.readFile(path, 'utf8', (err, text) => {
    if (err) {
      callback(Error('This ID does not exist'));
    } else {
      callback(null, { id, text });
    }
  });

  // if (!text) { callback(new Error(`No item with id: ${id}`)); }
  // else { callback(null, { id, text }); }
};

exports.update = (id, text, callback) => {
  var item = items[id];

  //if no id, throw error.

  //go to the file (id.txt)
  //write this file with the new text.

  const path = exports.dataDir + `/${id}.txt`;
  // fs.readFile(path, (err, fileData) => {
  //   if (err) callback(Error('ID not found'))
  //   else fs.writeFile(path, text, (err) => {
  //     if (err) callback(Error('Problem writing to file'))
  //     else callback(null, { id, text})
  //   });
  // });

  fs.promises.readFile(path, 'utf8')
    .then(file =>
      fs.promises.writeFile(path, text)
        .then(text => callback(null, { id, text }))
        .catch(err => callback(Error(`Problem writing to file: ${err}`)))
    )
    .catch(() => callback(Error('No ID found')));

  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];

  const path = exports.dataDir + `/${id}.txt`;
  fs.readFile(path, (err, fileData) => {
    if (err) {
      callback(Error('ID does not exist'));
    } else {
      fs.unlink(path, (err) => {
        if (err) {
          callback(Error('ID does not exist'));
        } else {
          console.log('file deleted successfully');
          callback();
        }
      });
    }
  });


  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
