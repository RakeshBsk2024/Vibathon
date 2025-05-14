(function () {
  // Create floating button
  function createFloatingButton() {
  const button = document.createElement("button");
  button.innerText = "Generate Test Cases";
  button.id = "floating-btn";
  Object.assign(button.style, {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  padding: "12px 20px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  zIndex: 9999,
  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
  fontSize: "14px",
  });
  document.body.appendChild(button);
  button.addEventListener("click", showSidebarWithLoader);
  }
  
  // Show sidebar with loader immediately
  function showSidebarWithLoader() {
  createSidebarUI();
  generateTestCases().then((testCases) => {
  renderTestCases(testCases);
  });
  }
  
  // Build sidebar structure immediately
  function createSidebarUI() {
  if (document.getElementById("test-case-sidebar")) {
  document.getElementById("test-case-sidebar").remove();
  }
  const sidebar = document.createElement("div");
sidebar.id = "test-case-sidebar";
Object.assign(sidebar.style, {
  position: "fixed",
  top: 0,
  right: 0,
  width: "400px",
  height: "100vh",
  backgroundColor: "#f9f9f9",
  borderLeft: "1px solid #ccc",
  zIndex: 9998,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  boxShadow: "-4px 0 8px rgba(0,0,0,0.1)",
});

sidebar.innerHTML = `
  <div id="sidebar-header" style="display:flex; justify-content:space-between; align-items:center; padding:10px 16px; background:#007bff; color:white;">
    <span><strong>Suggested Test Cases</strong></span>
    <button id="close-sidebar" style="background:none; border:none; color:white; font-size:18px; cursor:pointer;">✖</button>
  </div>
  <div id="sidebar-controls" style="padding:8px 12px; background:#e9ecef;">
    <input type="text" id="search-input" placeholder="Search..." style="width:98%; padding:6px; margin-bottom:6px;">
    <div style="display:flex; gap:6px;">
      <select id="priority-filter" style="flex:1;">
        <option value="">All Priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
      <select id="type-filter" style="flex:1;">
        <option value="">All Types</option>
        <option value="button">Button</option>
        <option value="input">Input</option>
        <option value="link">Link</option>
        <option value="logo">Logo</option>
        <option value="text">Text</option>
        <option value="security">Security</option>
      </select>
    </div>
  </div>
  <div id="test-case-list" style="flex:1; overflow-y:auto; padding:10px;">
    <div id="loader" style="text-align:center; color:#555; margin-top:40px;">
      <div class="spinner" style="border:4px solid #f3f3f3; border-top:4px solid #007bff; border-radius:50%; width:30px; height:30px; animation:spin 1s linear infinite; margin:auto;"></div>
      <p>Please wait, generating test cases...</p>
    </div>
  </div>
  <div id="sidebar-footer" style="padding:10px; background:#e9ecef; border-top:1px solid #ccc; display:flex; flex-wrap:wrap; gap:6px; justify-content:center;">
    <button id="copy-btn">📋 Copy</button>
    <button id="download-txt">⬇️ TXT</button>
    <button id="download-csv">📄 CSV</button>
    <button id="download-xlsx">📘 XLSX</button>
    <button id="toggle-theme">🌓 Theme</button>
  </div>
`;

document.body.appendChild(sidebar);

// Close event
document.getElementById("close-sidebar").onclick = () => sidebar.remove();
}

// Fetch test cases from backend
async function generateTestCases() {
const elements = [];
document.querySelectorAll("button").forEach((el, i) =>
  elements.push({ type: "button", label: el.innerText || `Button ${i + 1}` }));
document.querySelectorAll("input").forEach((el, i) =>
  elements.push({ type: "input", label: el.placeholder || el.name || `Input ${i + 1}` }));
document.querySelectorAll("a").forEach((el, i) =>
  elements.push({ type: "link", label: el.innerText || el.href || `Link ${i + 1}` }));

// Additional components
const logo = document.querySelector("img[alt*='logo'], img[src*='logo']");
if (logo) elements.push({ type: "logo", label: "Portal Logo" });

const welcome = document.querySelector("h1, h2, h3");
if (welcome && welcome.innerText.toLowerCase().includes("welcome")) {
  elements.push({ type: "text", label: welcome.innerText });
}

const navs = document.querySelectorAll("nav ul li, nav a");
navs.forEach((el, i) => elements.push({ type: "nav", label: el.innerText || `Nav ${i + 1}` }));

// Placeholder security field
if (document.querySelector("input[type='password']")) {
  elements.push({ type: "security", label: "Password Field" });
}

try {
  const res = await fetch("http://localhost:3000/generate-test-cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ elements })
  });
  const data = await res.json();
  return data.testCases;
} catch (err) {
  console.error("Error:", err);
  return [];
}
}

// Render test cases into sidebar
function renderTestCases(testCases) {
const list = document.getElementById("test-case-list");
if (!list) return;
list.innerHTML = "";
testCases.forEach(tc => {
  const item = document.createElement("div");
  item.className = "test-case";
  item.style = "margin-bottom:16px; padding:10px; background:white; border:1px solid #ddd; border-radius:6px;";
  item.innerHTML = `
    <div style="display:flex; justify-content:space-between; font-size:13px;">
      <span><strong>${tc.id}</strong></span>
      <span style="color:${tc.priority === "High" ? "red" : tc.priority === "Medium" ? "#ff9800" : "green"};">${tc.priority}</span>
    </div>
    <div style="font-weight:bold; margin-top:4px;">${tc.title}</div>
    <div style="font-size:13px; margin-top:4px;">${tc.description}</div>
    <div style="font-size:13px; margin-top:6px;"><strong>Steps:</strong><ol style="margin:0; padding-left:18px;">${tc.steps.map(s => `<li>${s}</li>`).join("")}</ol></div>
    <div style="font-size:13px; margin-top:4px;"><strong>Expected:</strong> ${tc.expected_result}</div>
  `;
  list.appendChild(item);
});

// Add filters and search functionality
document.getElementById("search-input").oninput = function () {
  const val = this.value.toLowerCase();
  document.querySelectorAll(".test-case").forEach(el =>
    el.style.display = el.innerText.toLowerCase().includes(val) ? "block" : "none"
  );
};

document.getElementById("priority-filter").onchange = function () {
  const val = this.value;
  document.querySelectorAll(".test-case").forEach(el =>
    el.style.display = !val || el.innerHTML.includes(`>${val}<`) ? "block" : "none"
  );
};

document.getElementById("type-filter").onchange = function () {
  const val = this.value;
  document.querySelectorAll(".test-case").forEach(el =>
    el.style.display = !val || el.innerText.toLowerCase().includes(val) ? "block" : "none"
  );
};

// Copy
document.getElementById("copy-btn").onclick = () => {
  const flat = testCases.map(tc =>
    `ID: ${tc.id}\nTitle: ${tc.title}\n${tc.description}\nSteps:\n${tc.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\nExpected: ${tc.expected_result}`
  ).join('\n\n');
  navigator.clipboard.writeText(flat);
};

// TXT Download
document.getElementById("download-txt").onclick = () => {
  const content = testCases.map(tc =>
    `ID: ${tc.id}\nTitle: ${tc.title}\n${tc.description}\nSteps:\n${tc.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\nExpected: ${tc.expected_result}`
  ).join('\n\n');
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "test-cases.txt";
  link.click();
};

// CSV Download
document.getElementById("download-csv").onclick = () => {
  const csv = ["ID,Title,Description,Steps,Expected Result"].concat(
    testCases.map(tc =>
      `"${tc.id}","${tc.title.replace(/"/g, '""')}","${tc.description.replace(/"/g, '""')}","${tc.steps.join(" | ").replace(/"/g, '""')}","${tc.expected_result.replace(/"/g, '""')}"`
    )
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "test-cases.csv";
  link.click();
};

// XLSX Download (TSV trick)
document.getElementById("download-xlsx").onclick = () => {
  const header = "ID\tTitle\tDescription\tSteps\tExpected Result";
  const rows = testCases.map(tc =>
    `${tc.id}\t${tc.title}\t${tc.description}\t${tc.steps.join(" | ")}\t${tc.expected_result}`
  ).join("\n");
  const blob = new Blob([header + "\n" + rows], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "test-cases.xlsx";
  link.click();
};

// Theme toggle
document.getElementById("toggle-theme").onclick = () => {
  const sidebar = document.getElementById("test-case-sidebar");
  const isDark = sidebar.style.backgroundColor === "rgb(33, 37, 41)";
  sidebar.style.backgroundColor = isDark ? "#f9f9f9" : "#212529";
  sidebar.style.color = isDark ? "black" : "white";
  document.querySelectorAll(".test-case").forEach(div =>
    div.style.backgroundColor = isDark ? "white" : "#343a40"
  );
};
}

// Initialize after page load
window.addEventListener("load", createFloatingButton);
})();