const taskObjectStore = [
  "id",
  "title",
  "hour",
  "mins",
  "day",
  "month",
  "year",
  "isNotified",
  "isCompleted",
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
let taskDb;

function generateUniqueId() {
  const timestamp = new Date().getTime();
  const randomNumber = Math.floor(Math.random() * 10000);
  const uniqueId = `${timestamp}${randomNumber}`;
  return uniqueId;
}

const transactionStore = "TaskListStore";

//  selecting items
const taskForm = document.querySelector("#taskForm");
const title = document.querySelector("#title");
const hour = document.querySelector("#hour");
const mins = document.querySelector("#mins");
const day = document.querySelector("#day");
const month = document.querySelector("#month");
const year = document.querySelector("#year");
const taskList = document.querySelector("#task-list");
const notificationBtn = document.querySelector("#notificationBtn");

  // Do an initial check to see what the notification permission state is
  if (Notification.permission === 'denied' || Notification.permission === 'default') {
    notificationBtn.style.display = 'block';
  } else {
    notificationBtn.style.display = 'block';
  }


const openDb = indexedDB.open("TaskList", 13);

openDb.onsuccess = () => {
  console.log("openDb");
  taskDb = openDb.result;
};
openDb.onupgradeneeded = (event) => {
  const taskDb = event.target.result;
  let objectStore;

  taskDb.onerror = (event) => {
    console.log(event, "error");
  };

  if (!taskDb.objectStoreNames.contains(transactionStore)) {
    objectStore = taskDb.createObjectStore(transactionStore, {
      keyPath: "id",
      autoIncrement: true,
    });
    taskObjectStore.forEach((value) => {
      objectStore.createIndex(value, value);
    });
  } else {
    objectStore = event.target.transaction.objectStore(transactionStore);
    taskObjectStore.forEach((value) => {
      if (!objectStore.indexNames.contains(value)) {
        objectStore.createIndex(value, value);
      }
    });
  }

  // What Object Store will contain
};

openDb.onerror = () => {
  alert("IndexedDB couldn't open a connection");
  console.error("IndexedDB couldn't open a connection");
};
openDb.onsuccess = () => {
  taskDb = openDb.result;
  getAllTask();
  console.info("IndexedDB opened a connection");
};

if (taskForm) {
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Extra check if all fields have a value
    if (
      title.value == "" ||
      hour.value == "" ||
      mins.value == "" ||
      day.value == "" ||
      month.value == "" ||
      year.value == ""
    ) {
      return alert("All Fields are Required");
    }

    // Add our object
    const newTask = {
      title: title.value,
      hour: hour.value,
      mins: mins.value,
      day: day.value,
      month: month.value,
      year: year.value,
      isNotified: false,
      isCompleted: false,
    };

    // Open a db Transaction
    const taskListTransaction = taskDb.transaction(
      transactionStore,
      "readwrite"
    );

    const taskObjectStore = taskListTransaction.objectStore(transactionStore);
    const addItemRequest = taskObjectStore.add(newTask);

    addItemRequest.onsuccess = (event) => {
      getAllTask();
      console.log("Created Task Successfully");

      // Clear the form, ready for adding the next entry
      title.value = "";
      hour.value = "00";
      mins.value = "00";
      day.value = "09";
      month.value = "June";
      year.value = 2024;
    };
  });
}

function getAllTask() {
  taskList.innerHTML = "";

  const taskListTransaction = taskDb.transaction(transactionStore, "readonly");
  const taskObjectStore = taskListTransaction.objectStore(transactionStore);

  taskObjectStore.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const task = cursor.value;

      const div = document.createElement("div");
      div.innerHTML = `
  <div class="flex items-center gap-4">
  <button onclick="taskCompleted(${
    task.id
  })" type="button" role="checkbox" aria-checked="false" data-state="${
        task.isNotified || task.isCompleted ? "checked" : "unchecked"
      }" value="on"
      class="peer shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4"
      id="todo1">
      <span class="sr-only">Check</span>
  </button>
  <div class="flex flex-col flex-1">
      <label
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
            task.completed ? "line-through" : ""
          }
          for="todo1">
         ${task.title}
      </label>
      <p class="text-sm">${task.day}-${task.month}-${task.year}</p>
  </div>
<button
      onclick="taskDelete(${task.id})"
      class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="w-4 h-4">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
      </svg><span class="sr-only">Delete task</span>
  </button>
  </div>
    `;

      taskList.appendChild(div);

      cursor.continue();
    }
  };
}

function taskCompleted(id) {
  const taskListTransaction = taskDb.transaction(transactionStore, "readwrite");
  const taskObjectStore = taskListTransaction.objectStore(transactionStore);
  const taskRequest = taskObjectStore.get(id);

  taskRequest.onsuccess = (event) => {
    const taskResponse = event.target.result;

    taskResponse.isCompleted = !taskResponse?.isCompleted;

    const taskUpdate = taskObjectStore.put(taskResponse);

    taskUpdate.onsuccess = (event) => {
      getAllTask();
    };

    taskUpdate.onerror = (event) => {
      console.error(`Error updating task: ${id} `, event.target.error);
    };
  };
}

function taskDelete(id) {
  const taskListTransaction = taskDb.transaction(transactionStore, "readwrite");
  const taskObjectStore = taskListTransaction.objectStore(transactionStore);
  const taskRequest = taskObjectStore.delete(id);

  taskRequest.onsuccess = (event) => {
    getAllTask();
  };

}


// Notifications


function askNotificationPermission() {
  // Function to actually ask the permissions
  function handlePermission(permission) {
    // Whatever the user answers, we make sure Chrome stores the information
    if (!Reflect.has(Notification, 'permission')) {
      Notification.permission = permission;
    }

    // Set the button to shown or hidden, depending on what the user answers
    if (Notification.permission === 'denied' || Notification.permission === 'default') {
      notificationBtn.style.display = 'block';
    } else {
      notificationBtn.style.display = 'block';
    }
  };

  // Check if the browser supports notifications
  if (!Reflect.has(window, 'Notification')) {
    console.log('This browser does not support notifications.');
  } else {
    if (checkNotificationPromise()) {
      Notification.requestPermission().then(handlePermission);
    } else {
      Notification.requestPermission(handlePermission);
    }
  }
};

// Check whether browser supports the promise version of requestPermission()
// Safari only supports the old callback-based version
function checkNotificationPromise() {
  try {
    Notification.requestPermission().then();
  } catch(e) {
    return false;
  }

  return true;
};


notificationBtn.addEventListener('click', notifyMe);


  // Check whether the deadline for each task is up or not, and responds appropriately
  function checkDeadlines() {
   
    // First of all check whether notifications are enabled or denied
    if (Notification.permission === 'denied' || Notification.permission === 'default') {
      notificationBtn.style.display = 'block';
    } else {
      notificationBtn.style.display = 'block';
    }

    // Grab the current time and date
    const now = new Date();

    // From the now variable, store the current minutes, hours, day of the month, month, year and seconds
    const minuteCheck = now.getMinutes();
    const hourCheck = now.getHours();
    const dayCheck = now.getDate(); // Do not use getDay() that returns the day of the week, 1 to 7
    const monthCheck = now.getMonth();
    const yearCheck = now.getFullYear(); // Do not use getYear() that is deprecated.

    // Open a new transaction
    const objectStore = taskDb.transaction(transactionStore, 'readwrite').objectStore(transactionStore);
    
    // Open a cursor to iterate through all the data items in the IndexedDB
    objectStore.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;
      if (!cursor) return;
      const { hour, mins, day, month, year, isNotified, title } = cursor.value;
      // convert the month names we have installed in the IDB into a month number that JavaScript will understand.
      // The JavaScript date object creates month values as a number between 0 and 11.
      const monthNumber = MONTHS.indexOf(month);
      if (monthNumber === -1) throw new Error('Incorrect month entered in database.');

      // Check if the current hours, minutes, day, month and year values match the stored values for each task.
      // The parseInt() function transforms the value from a string to a number for comparison
      // (taking care of leading zeros, and removing spaces and underscores from the string).
      let matched = parseInt(hour) === hourCheck;
      matched &&= parseInt(mins) === minuteCheck;
      matched &&= parseInt(day) === dayCheck;
      matched &&= parseInt(monthNumber) === monthCheck;
      matched &&= parseInt(year) === yearCheck;
      if (matched && isNotified === 'no') {
        // If the numbers all do match, run the createNotification() function to create a system notification
        // but only if the permission is set
        if (Notification.permission === 'granted') {
          createNotification(title);
        }
      }

      // Move on to the next cursor item
      cursor.continue();
    };
  };

  setInterval(checkDeadlines, 10000);


  function createNotification(title) {
    // Create and show the notification
    const text = `HEY! Your task "${title || "tuedon"}" is now overdue.`;
    const notification = new Notification('To do list', { body: text });
    console.log(title)

  }

  if (Notification.permission === 'granted') {
    createNotification(title);
  }
  function notifyMe() {
    if (!("Notification" in window)) {
      // Check if the browser supports notifications
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      // Check whether notification permissions have already been granted;
      // if so, create a notification
      console.log("test")
      const notification = new Notification("Hi there!");
      // …
    } else if (Notification.permission !== "denied") {
      // We need to ask the user for permission
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          const notification = new Notification("Hi there!");
          // …
        }
      });
    }
  
    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them anymore.
  }