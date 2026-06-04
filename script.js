const form = document.querySelector(".contact-form");
const formStatus = document.querySelector("#formStatus");
const navLinks = document.querySelectorAll('a[href^="#"]');

function showFieldError(formElement, fieldName, message) {
  const target = formElement.querySelector(`[data-error-for="${fieldName}"]`);
  if (target) {
    target.textContent = message;
  }
}

function clearFieldErrors(formElement) {
  formElement.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
}

function validateForm(formElement) {
  const data = new FormData(formElement);
  const requiredFields = ["name", "contact", "eventDate", "quantity", "occasion"];
  let isValid = true;

  clearFieldErrors(formElement);

  requiredFields.forEach((fieldName) => {
    const value = String(data.get(fieldName) || "").trim();
    if (!value) {
      showFieldError(formElement, fieldName, "請填寫這個欄位");
      isValid = false;
    }
  });

  const contact = String(data.get("contact") || "").trim();
  if (contact && contact.length < 6) {
    showFieldError(formElement, "contact", "請留下可聯繫的電話、LINE 或 email");
    isValid = false;
  }

  return isValid;
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm(form)) {
      if (formStatus) {
        formStatus.textContent = "請確認必填資訊後再送出。";
      }
      return;
    }

    form.reset();
    clearFieldErrors(form);
    if (formStatus) {
      formStatus.textContent = "已收到詢問，我們將盡快與您聯繫。";
    }
  });
}
