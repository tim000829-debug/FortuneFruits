window.GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz9JGXYGwrDCXr96WssJeCz4eK3mXPiXImWEld-bCjEjA20-EM5f_t3VZQcyY1VGTFu/exec";

const form = document.querySelector(".contact-form");
const formStatus = document.querySelector("#formStatus");
const navLinks = document.querySelectorAll('a[href^="#"]');

const messages = {
  required: "\u8acb\u586b\u5beb\u9019\u500b\u6b04\u4f4d",
  contactTooShort:
    "\u8acb\u7559\u4e0b\u53ef\u806f\u7e6b\u7684\u96fb\u8a71\u3001LINE \u6216 email",
  invalid:
    "\u8acb\u78ba\u8a8d\u5fc5\u586b\u8cc7\u8a0a\u5f8c\u518d\u9001\u51fa\u3002",
  missingUrl:
    "\u5c1a\u672a\u8a2d\u5b9a Google \u8a66\u7b97\u8868\u9023\u7d50\uff0c\u8acb\u5148\u586b\u5165 Apps Script Web App URL\u3002",
  sending: "\u9001\u51fa\u4e2d\uff0c\u8acb\u7a0d\u5019\u2026",
  success:
    "\u5df2\u6536\u5230\u8a62\u554f\uff0c\u6211\u5011\u5c07\u76e1\u5feb\u8207\u60a8\u806f\u7e6b\u3002",
  failed:
    "\u9001\u51fa\u5931\u6557\uff0c\u8acb\u7a0d\u5f8c\u518d\u8a66\uff0c\u6216\u76f4\u63a5\u900f\u904e LINE \u806f\u7e6b\u6211\u5011\u3002",
};

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

function getInquiryPayload(formElement) {
  const data = new FormData(formElement);

  return {
    type: "inquiry",
    name: String(data.get("name") || "").trim(),
    contact: String(data.get("contact") || "").trim(),
    eventDate: String(data.get("eventDate") || "").trim(),
    quantity: String(data.get("quantity") || "").trim(),
    occasion: String(data.get("occasion") || "").trim(),
    notes: String(data.get("notes") || "").trim(),
    source: window.location.href,
  };
}

function validateForm(formElement) {
  const payload = getInquiryPayload(formElement);
  const requiredFields = ["name", "contact", "eventDate", "quantity", "occasion"];
  let isValid = true;

  clearFieldErrors(formElement);

  requiredFields.forEach((fieldName) => {
    if (!payload[fieldName]) {
      showFieldError(formElement, fieldName, messages.required);
      isValid = false;
    }
  });

  if (payload.contact && payload.contact.length < 6) {
    showFieldError(formElement, "contact", messages.contactTooShort);
    isValid = false;
  }

  return isValid;
}

async function submitInquiry(payload) {
  const endpoint = String(window.GOOGLE_SCRIPT_URL || "").trim();

  if (!endpoint) {
    return { ok: false, reason: "missing-url" };
  }

  try {
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, reason: "network-error" };
  }
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
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm(form)) {
      if (formStatus) {
        formStatus.textContent = messages.invalid;
      }
      return;
    }

    const payload = getInquiryPayload(form);
    if (formStatus) {
      formStatus.textContent = messages.sending;
    }

    const result = await submitInquiry(payload);

    if (!result.ok) {
      if (formStatus) {
        formStatus.textContent =
          result.reason === "missing-url" ? messages.missingUrl : messages.failed;
      }
      return;
    }

    form.reset();
    clearFieldErrors(form);
    if (formStatus) {
      formStatus.textContent = messages.success;
    }
  });
}
