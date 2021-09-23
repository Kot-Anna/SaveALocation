import * as SQLite from 'expo-sqlite'


const db = SQLite.openDatabase('db.location') // returns Database object



//Check if the items table exists if not create it
export const init = () => {
  const promise = new Promise ((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
            'CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY, lat TEXT NOT NULL, lng TEXT NOT NULL);',[],
          () => {
            resolve();
          },
          (_,err)=>{
            reject(err);
          }
        );
      });
  });
  return promise;
};

//inserting new item into database

export const addItem=(lat, lng)=> {
  const promise = new Promise ((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
          'INSERT INTO locations(lat, lng) values (?,?);',
          [lat, lng],
        (_,result) => {
          resolve(result);
        },
        (_,err)=>{
          reject(err);
        }
      );
    });
});
return promise;
};

//fetching all items from db
export const fetchItems = () => {
    const promise = new Promise ((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
            'select * from locations;',
            [],
          (tx,result) => {
            resolve(result);
          },
          (tx,err)=>{
            reject(err);
          }
        );
      });
  });
  return promise;
};

// deleting item by id
export const deleteItem=(id)=> {
  const promise = new Promise ((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
          'DELETE FROM locations where id = ?;',
          [id],
        (_,result) => {
          resolve(result);
        },
        (_,err)=>{
          reject(err);
        }
      );
    });
});
return promise;
};

//updating item by id

export const editItem=(lat, lng, id)=> {
 // console.log("This is edit function of db " + itemid, itemname, itemduedate, itemdesc)
  const promise = new Promise ((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
          'UPDATE items SET lat=?, lng=? WHERE id=?;',
          [lat, lng, id],
        (_,result) => {
          resolve(result);
        },
        (_,err)=>{
          reject(err);
        }
      );
    });
});

return promise;
};

