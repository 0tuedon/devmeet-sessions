// This shows that LocalStorage has a limit of just over 5MB
const testLSLimit = new Array(5 * 1024 * 1024 + 1).join("a");

// First you open a connection to a Database
const open = indexedDB.open("Devmeets DB", 1);
open.onupgradeneeded = () => {
  // create the object store only when there is an upgrade
  const db = open.result;
  db.createObjectStore("FirstUSerStore", { keyPath: "id" });
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
  transaction.objectStore("MyUserStore");
};
open.onerror = () => {
  console.log("ERROR");
};
