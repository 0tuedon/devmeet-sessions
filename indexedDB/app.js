// This shows that LocalStorage has a limit of just over 5MB
const testLSLimit = new Array(5 * 1024 * 1024 + 1).join("a");

// First you open a connection to a Database
const open = indexedDB.open("DevmeetsDB", 1);
open.onupgradeneeded = () => {
  // create the object store only when there is an upgrade
  const db = open.result;
  db.createObjectStore("MyUserStore", { keyPath: "id" });
};

open.onsuccess = () => {
  console.log("SUCCESS");
  const db = open.result;
  /*
The transaction method of the IDBDatabase 
interface immediately returns a transaction 
object (IDBTransaction) containing 
the IDBTransaction.objectStore method, 
which you can use to access your object store.
references MDN WEB DOCS
    */
  const transaction = db.transaction("MyUserStore", "readwrite");
  const store = transaction.objectStore("MyUserStore");
  // stores the item in the object store
    // store.put({id:1, username: "Bilbo", age:20 });
  const user = store.getAll();
  user.onsuccess = () => {
    console.log(user.result);
  };
};
open.onerror = () => {
  console.log("ERROR");
};
