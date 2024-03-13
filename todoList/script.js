let db;

document.addEventListener("DOMContentLoaded", () => {
  // Open database
  const request = window.indexedDB.open("todos", 1);

  request.onerror = function (event) {
    console.error("Database error: ", event.target.error);
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    displayTodos();
  };

  request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("todos", {
      keyPath: "id",
      autoIncrement: true,
    });
  };
});

function addTodo() {
  const todoInput = document.getElementById("todoInput");
  const todoText = todoInput.value.trim();

  if (todoText === "") {
    alert("Please enter a todo!");
    return;
  }

  const transaction = db.transaction(["todos"], "readwrite");
  const objectStore = transaction.objectStore("todos");

  const todo = {
    text: todoText,
    completed: false,
  };

  const request = objectStore.add(todo);

  request.onsuccess = function (event) {
    displayTodos();
    todoInput.value = "";
  };

  request.onerror = function (event) {
    console.error("Error adding todo: ", event.target.error);
  };
}

function displayTodos() {
  const todoList = document.getElementById("todoList");
  todoList.innerHTML = "";

  const transaction = db.transaction(["todos"], "readonly");
  const objectStore = transaction.objectStore("todos");

  objectStore.openCursor().onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const todo = cursor.value;

      const div = document.createElement("div");
      div.innerHTML = `
<div class="flex items-center gap-4">
<button onclick="toggleCompleted(${
        todo.id
      })" type="button" role="checkbox" aria-checked="false" data-state="${
        todo.completed ? "checked" : "unchecked"
      }" value="on"
    class="peer shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4"
    id="todo1">
    <span class="sr-only">Check</span>
</button>
<div class="flex-1">
    <label
        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
          todo.completed ? "line-through" : ""
        }
        for="todo1">
       ${todo.text}
    </label>
</div>
<button
onclick="editTodo(${todo.id})"
    class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-full">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="w-4 h-4">
        <path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z"></path>
    </svg><span class="sr-only">Edit task</span></button><button
    onclick="deleteTodo(${todo.id})"
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

      todoList.appendChild(div);

      cursor.continue();
    }
  };
}

function editTodo(id) {
  const newText = prompt("Edit todo:");
  if (newText === null) return;

  const transaction = db.transaction(["todos"], "readwrite");
  const objectStore = transaction.objectStore("todos");

  const request = objectStore.get(id);

  request.onsuccess = function (event) {
    const todo = request.result;
    todo.text = newText;

    const updateRequest = objectStore.put(todo);

    updateRequest.onsuccess = function (event) {
      displayTodos();
    };

    updateRequest.onerror = function (event) {
      console.error("Error updating todo: ", event.target.error);
    };
  };
}

function deleteTodo(id) {
  const transaction = db.transaction(["todos"], "readwrite");
  const objectStore = transaction.objectStore("todos");

  const request = objectStore.delete(id);

  request.onsuccess = function (event) {
    displayTodos();
  };

  request.onerror = function (event) {
    console.error("Error deleting todo: ", event.target.error);
  };
}

function toggleCompleted(id) {
  const transaction = db.transaction(["todos"], "readwrite");
  const objectStore = transaction.objectStore("todos");

  const request = objectStore.get(id);

  request.onsuccess = function (event) {
    const todo = request.result;
    todo.completed = !todo.completed;

    const updateRequest = objectStore.put(todo);

    updateRequest.onsuccess = function (event) {
      displayTodos();
    };

    updateRequest.onerror = function (event) {
      console.error("Error updating todo: ", event.target.error);
    };
  };
}
