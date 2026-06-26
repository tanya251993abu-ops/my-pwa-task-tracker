let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let selectedCategory = "all";
let editingId = null;

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = new Date().toISOString().split("T")[0];

const today = new Date().toISOString().split("T")[0];

/* =====================
   STORAGE
===================== */

function saveStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* =====================
   MODAL
===================== */

const modal = document.getElementById("taskModal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");
const saveTaskBtn = document.getElementById("saveTask");

const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const categorySelect = document.getElementById("categorySelect");

openModalBtn.addEventListener("click", () => {
  editingId = null;
  taskInput.value = "";
  taskDate.value = selectedDate || today;
  modal.classList.add("show");
});

closeModalBtn.addEventListener("click", () => {
  modal.classList.remove("show");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("show");
});

/* =====================
   SAVE TASK
===================== */

saveTaskBtn.addEventListener("click", () => {
  const title = taskInput.value.trim();
  if (!title) return alert("Введите название задачи");

  const taskData = {
    title,
    category: categorySelect.value,
    date: taskDate.value,
    completed: false
  };

  if (editingId) {
    const i = tasks.findIndex(t => t.id === editingId);
    tasks[i] = { ...tasks[i], ...taskData };
  } else {
    tasks.push({
      id: Date.now(),
      ...taskData
    });
  }

  saveStorage();
  renderAll();
  updateStats();

  modal.classList.remove("show");
});

/* =====================
   CATEGORY (RU)
===================== */

function categoryLabel(cat) {
  if (cat === "personal") return "Личное";
  if (cat === "work") return "Работа";
  if (cat === "study") return "Учёба";
  return cat;
}

/* =====================
   TODAY
===================== */

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  // FIX: применяем фильтр категории
  const todayTasks = tasks.filter(t => {
    return t.date === today && (
      selectedCategory === "all" || t.category === selectedCategory
    );
  });

  if (!todayTasks.length) {
    list.innerHTML = `
      <div class="task-card">
        <div class="task-info">
          <h4>Нет задач на сегодня</h4>
        </div>
      </div>
    `;
    return;
  }

  todayTasks.forEach(task => {
    const card = document.createElement("div");

    card.className =
      "task-card " + (task.completed ? "completed-task" : "");

    card.innerHTML = `
      <div class="task-left">

        <button class="check-btn ${task.completed ? "done" : ""}" 
          onclick="toggleTask(${task.id})">
          <i class="fa-solid fa-check"></i>
        </button>

        <div class="task-info">
          <h4>${task.title}</h4>
          <span>${categoryLabel(task.category)}</span>
        </div>

      </div>

      <div class="task-actions">
        <button class="action-btn" onclick="editTask(${task.id})">
          <i class="fa-solid fa-pen"></i>
        </button>

        <button class="action-btn" onclick="deleteTask(${task.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    list.appendChild(card);
  });
}

/* =====================
   TASK ACTIONS
===================== */

window.toggleTask = function(id) {
  const task = tasks.find(t => t.id === id);
  task.completed = !task.completed;

  saveStorage();
  renderAll();
  updateStats();
};

window.deleteTask = function(id) {
  tasks = tasks.filter(t => t.id !== id);

  saveStorage();
  renderAll();
  updateStats();
};

window.editTask = function(id) {
  const task = tasks.find(t => t.id === id);

  editingId = id;

  taskInput.value = task.title;
  taskDate.value = task.date;
  categorySelect.value = task.category;

  modal.classList.add("show");
};

/* =====================
   CALENDAR + MONTH TASKS
===================== */

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  const title = document.getElementById("monthTitle");

  grid.innerHTML = "";

  const months = [
    "Янв","Фев","Мар","Апр","Май","Июн",
    "Июл","Авг","Сен","Окт","Ноя","Дек"
  ];

  title.textContent = months[currentMonth] + " " + currentYear;

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  let start = firstDay.getDay();
  start = start === 0 ? 6 : start - 1;

  for (let i = 0; i < start; i++) {
    grid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {

    const dateString =
      `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = day;

    if (tasks.some(t => t.date === dateString)) {
      cell.classList.add("has-task");
    }

    if (dateString === selectedDate) {
      cell.classList.add("active-day");
    }

    cell.addEventListener("click", () => {
      selectedDate = dateString;
      renderCalendar();
      renderSelectedDay();
    });

    grid.appendChild(cell);
  }

  renderSelectedDay();
}

/* =====================
   SELECTED DAY (MONTH PAGE)
===================== */

function renderSelectedDay() {
  const container = document.getElementById("selectedDayTasks");

  const list = tasks.filter(t => t.date === selectedDate);

  let html = `
    <button id="addForDay" class="add-task-day-btn">
      Добавить задачу
    </button>
  `;

  if (!list.length) {
    html += `<p style="margin-top:10px;color:#888;">Нет задач на этот день</p>`;
  } else {
    html += list.map(task => `
      <div class="task-card ${task.completed ? "completed-task" : ""}">

        <div class="task-left">
          <button class="check-btn ${task.completed ? "done" : ""}" 
            onclick="toggleTask(${task.id})">
            <i class="fa-solid fa-check"></i>
          </button>

          <div class="task-info">
            <h4>${task.title}</h4>
            <span>${categoryLabel(task.category)}</span>
          </div>
        </div>

        <div class="task-actions">
          <button class="action-btn" onclick="editTask(${task.id})">
            <i class="fa-solid fa-pen"></i>
          </button>

          <button class="action-btn" onclick="deleteTask(${task.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>

      </div>
    `).join("");
  }

  container.innerHTML = html;

  document.getElementById("addForDay").onclick = () => {
    editingId = null;
    taskInput.value = "";
    taskDate.value = selectedDate;
    modal.classList.add("show");
  };
}

/* =====================
   STATS
===================== */

function updateStats() {

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const todayTasks = tasks.filter(t => t.date === today);
  const todayDone = todayTasks.filter(t => t.completed).length;

  const todayPercent =
    todayTasks.length === 0 ? 0 :
    Math.round((todayDone / todayTasks.length) * 100);

  document.getElementById("todayTotal").textContent = todayTasks.length;
  document.getElementById("todayDone").textContent = todayDone;
  document.getElementById("todayPercent").textContent = todayPercent + "%";

  document.getElementById("globalPercent").textContent = percent + "%";
  document.getElementById("allTasks").textContent = total;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("activeTasks").textContent = active;

  document.getElementById("progressBar").style.width = todayPercent + "%";

  categoryStats();
  drawChart();
}

/* =====================
   CATEGORY STATS
===================== */

function categoryStats() {

  const total = tasks.length || 1;

  const personal = tasks.filter(t => t.category === "personal").length;
  const work = tasks.filter(t => t.category === "work").length;
  const study = tasks.filter(t => t.category === "study").length;

  document.getElementById("personalBar").style.width = (personal / total) * 100 + "%";
  document.getElementById("workBar").style.width = (work / total) * 100 + "%";
  document.getElementById("studyBar").style.width = (study / total) * 100 + "%";
}

/* =====================
   CHART
===================== */

function drawChart() {
  const canvas = document.getElementById("activityChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  canvas.width = canvas.offsetWidth;
  canvas.height = 180;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const days = 7;
  let data = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const key = d.toISOString().split("T")[0];

    const count = tasks.filter(
      t => t.completed && t.date === key
    ).length;

    data.push(count);
  }

  const max = Math.max(...data, 1);
  const width = canvas.width / days;

  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#b97cf3";

  data.forEach((value, index) => {
    const x = index * width + width / 2;
    const y = canvas.height - (value / max) * 130 - 20;

    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

/* =====================
   NAVIGATION
===================== */

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(n => n.classList.remove("active-nav"));

    document.getElementById(btn.dataset.page).classList.add("active");
    btn.classList.add("active-nav");

    if (btn.dataset.page === "statsPage") {
      drawChart();
      updateStats();
    }
  });
});

/* =====================
   CATEGORY FILTER (FIX)
===================== */

document.querySelectorAll(".category").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach(b =>
      b.classList.remove("active-category")
    );

    btn.classList.add("active-category");

    selectedCategory = btn.dataset.category || "all";

    renderTasks();
  });
});

/* =====================
   MONTH NAV FIX
===================== */

document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

/* =====================
   INIT
===================== */

function renderAll() {
  renderTasks();
  renderCalendar();
  renderSelectedDay();
  updateStats();
  drawChart();
}

renderAll();

/* =====================
   TODAY BUTTON
===================== */

document.getElementById("addTodayTask").addEventListener("click", () => {
  editingId = null;
  taskInput.value = "";
  taskDate.value = today;
  modal.classList.add("show");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("SW зарегистрирован"))
      .catch(err => console.log("Ошибка SW:", err));
  });
}
