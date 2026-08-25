/*
 * Michigan Home Jobs
 *
 * Frontend questionnaire.
 * n8n is intentionally left unconnected until the client confirms
 * the desired workflow.
 */

//const N8N_WEBHOOK_URL = "https://covalign.app.n8n.cloud/webhook-test/michigan-home-jobs"; //test
const N8N_WEBHOOK_URL = "https://covalign.app.n8n.cloud/webhook/michigan-home-jobs";  //live



const state = {
  path: null,
  answers: {},
  currentStep: 0,
  submitted: false
};

const app = document.getElementById("app");
const progressLabel = document.getElementById("progress-label");
const progressCount = document.getElementById("progress-count");
const progressBar = document.getElementById("progress-bar");

const branches = {
  caregiver: [
    {
      id: "michiganResident",
      question: "Are you currently a Michigan resident?",
      helper: "Home Help services are only available to Michigan residents.",
      options: [
        { label: "Yes", value: true, next: "continue" },
        { label: "No", value: false, next: "ineligible" }
      ]
    },
    {
      id: "lovedOneCondition",
      question:
        "Does your loved one have a disability or medical condition that affects their ability to perform daily activities?",
      options: [
        { label: "Yes", value: true, next: "continue" },
        { label: "No", value: false, next: "ineligible" }
      ]
    },
    {
      id: "needsADL",
      question:
        "Do they need assistance with daily activities, like bathing, dressing, eating, mobility, toileting, or taking medications?",
      helper: "These are examples of Activities of Daily Living (ADLs).",
      options: [
        { label: "Yes", value: true, next: "continue" },
        { label: "No", value: false, next: "ineligible" }
      ]
    }
  ],

  provider: [
    {
      id: "michiganResident",
      question: "Are you currently a Michigan resident?",
      helper: "Home Help services are only available to Michigan residents.",
      options: [
        { label: "Yes", value: true, next: "continue" },
        { label: "No", value: false, next: "ineligible" }
      ]
    }
  ],

  recipient: [
    {
      id: "michiganResident",
      question: "Are you currently a Michigan resident?",
      helper: "Home Help services are only available to Michigan residents.",
      options: [
        { label: "Yes", value: true, next: "continue" },
        { label: "No", value: false, next: "ineligible" }
      ]
    },
    {
      id: "hasCondition",
      question:
        "Do you have a disability or medical condition that affects your ability to perform daily activities?",
      options: [
        { label: "Yes", value: true, next: "continue" },
        { label: "No", value: false, next: "ineligible" }
      ]
    },
    {
      id: "needsADL",
      question:
        "Do you need assistance with daily activities, like bathing, dressing, eating, mobility, toileting, or taking medications?",
      helper: "These are examples of Activities of Daily Living (ADLs).",
      options: [
        { label: "Yes", value: true, next: "continue" },
        { label: "No", value: false, next: "continue" }
      ]
    },
    {
      id: "livingSituation",
      question:
        "Do you live in your own home or an unlicensed residential setting?",
      helper:
        "Individuals in nursing homes or licensed facilities are not eligible.",
      options: [
        { label: "At home", value: "at_home", next: "continue" },
        {
          label: "Nursing home or medical facility",
          value: "facility",
          next: "ineligible"
        }
      ]
    },
    {
      id: "doctorVisit",
      question: "Have you visited a doctor in the past year?",
      helper:
        "This might include a doctor or nurse verifying your need for assistance.",
      options: [
        { label: "Yes", value: true, next: "continue" },
        { label: "No", value: false, next: "continue" }
      ]
    }
  ]
};

const findingClients = [
  "Family & Friends – Start with loved ones, neighbors, anyone on Medicaid.",
  "Hospitals – Ask discharge planners & social workers.",
  "Clinics – Doctors & geriatricians can refer patients.",
  "Senior Centers – Connect with coordinators & families.",
  "Agencies on Aging – Main hub for senior support services.",
  "Community Groups – Leaders can connect you with seniors.",
  "Services – Meal & transport providers know who needs care."
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setProgress(current, total, label) {
  progressLabel.textContent = label;
  progressCount.textContent = total ? `${current} of ${total}` : "";
  progressBar.style.width = total
    ? `${Math.max(4, (current / total) * 100)}%`
    : "0%";
}

function goHome() {
  // If the submission was already completed successfully,
  // return directly to Home without showing the confirmation.
  if (state.submitted) {
    renderStart();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const hasProgress =
    state.path !== null && Object.keys(state.answers).length > 0;

  if (!hasProgress) {
    renderStart();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  showHomeConfirmation();
}

function showHomeConfirmation() {
  const existingModal = document.getElementById("home-confirm-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "home-confirm-modal";
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div
      class="confirmation-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <div class="confirmation-icon" aria-hidden="true">?</div>

      <h2 id="confirmation-title">Return to Home?</h2>

      <p>
        Your current answers will be cleared if you return to the home screen.
      </p>

      <div class="confirmation-actions">
        <button type="button" class="secondary-button" id="cancel-home">
          Cancel
        </button>

        <button type="button" class="primary-button" id="confirm-home">
          Return to Home
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("cancel-home").addEventListener("click", () => {
    modal.remove();
  });

  document.getElementById("confirm-home").addEventListener("click", () => {
    modal.remove();
    renderStart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  modal.addEventListener("click", event => {
    if (event.target === modal) modal.remove();
  });

  const escapeHandler = event => {
    if (event.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", escapeHandler);
    }
  };

  document.addEventListener("keydown", escapeHandler);

  document.getElementById("cancel-home").focus();
}

function bindHomeLinks() {
  document.querySelectorAll(".home-link").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      goHome();
    });
  });
}

function renderStart() {
state.path = null;
state.answers = {};
state.currentStep = 0;
state.submitted = false;

  setProgress(0, 0, "Getting started");

  app.innerHTML = `
    <p class="eyebrow">Get started</p>

    <h2 class="question">Which one best describes you?</h2>

    <p class="helper">
      Choose the option that best matches your situation.
    </p>

    <div class="option-list">
      <button class="option-button" data-path="caregiver">
        <span class="option-key">1</span>
        <span>
          I'm a caregiver for my loved one who has Medicaid,
          and I want to get paid by Medicaid for providing their care
        </span>
      </button>

      <button class="option-button" data-path="provider">
        <span class="option-key">2</span>
        <span>
          I'm a provider – I can connect with a client who has
          Medicaid that I can care for
        </span>
      </button>

      <button class="option-button" data-path="recipient">
        <span class="option-key">3</span>
        <span>
          I have a family member already taking care of me –
          Medicaid will pay for it
        </span>
      </button>
    </div>
  `;

  document.querySelectorAll("[data-path]").forEach(button => {
    button.addEventListener("click", () => {
      state.path = button.dataset.path;
      state.answers = {};
      state.currentStep = 0;
      renderQuestion();
    });
  });

  bindHomeLinks();
}

function renderQuestion() {
  const questions = branches[state.path];
  const question = questions[state.currentStep];
  const savedAnswer = state.answers[question.id];

  setProgress(
    state.currentStep + 1,
    questions.length + 1,
    state.path === "caregiver"
      ? "Caregiver screening"
      : state.path === "provider"
        ? "Provider screening"
        : "Home Help screening"
  );

  app.innerHTML = `
    <p class="eyebrow">Screening question</p>

    <h2 class="question">${escapeHtml(question.question)}</h2>

    ${
      question.helper
        ? `<p class="helper">${escapeHtml(question.helper)}</p>`
        : ""
    }

    <div id="answer-group" class="option-list">
      ${question.options
        .map(
          (option, index) => `
            <button
              type="button"
              class="option-button ${
                savedAnswer === option.value ? "selected" : ""
              }"
              data-option-index="${index}"
            >
              <span class="option-key">
                ${String.fromCharCode(65 + index)}
              </span>
              <span>${escapeHtml(option.label)}</span>
            </button>
          `
        )
        .join("")}
    </div>

    <p id="answer-error" class="answer-error" role="alert"></p>

    <div class="navigation-buttons">
      <button type="button" class="secondary-button" id="previous-button">
        Previous
      </button>

      <button type="button" class="primary-button" id="next-button">
        Next
      </button>
    </div>

    <p class="small-note">
      You can use the Home button at any time to return to the beginning.
    </p>
  `;

  document.querySelectorAll("[data-option-index]").forEach(button => {
    button.addEventListener("click", () => {
      const selected =
        question.options[Number(button.dataset.optionIndex)];

      state.answers[question.id] = selected.value;

      document.getElementById("answer-group")
        .classList.remove("answer-invalid");

      document.getElementById("answer-error").textContent = "";

      document.querySelectorAll("[data-option-index]").forEach(optionButton => {
        optionButton.classList.remove("selected");
      });

      button.classList.add("selected");
    });
  });

  document.getElementById("next-button").addEventListener("click", () => {
    const hasAnswer = Object.prototype.hasOwnProperty.call(
      state.answers,
      question.id
    );

    if (!hasAnswer) {
      document.getElementById("answer-group")
        .classList.add("answer-invalid");

      document.getElementById("answer-error").textContent =
        "Please select an answer before continuing.";

      return;
    }

    const selectedOption = question.options.find(
      option => option.value === state.answers[question.id]
    );

    if (selectedOption.next === "ineligible") {
      renderIneligible();
      return;
    }

    state.currentStep++;

    if (state.currentStep >= questions.length) {
      renderContactForm();
    } else {
      renderQuestion();
    }
  });

  document.getElementById("previous-button").addEventListener("click", () => {
    if (state.currentStep === 0) {
      goHome();
      return;
    }

    state.currentStep--;
    renderQuestion();
  });

  bindHomeLinks();
}

function renderContactForm() {
  setProgress(
    100,
    100,
    state.path === "provider" ? "Contact information" : "Final step"
  );

  progressCount.textContent = "";

  app.innerHTML = `
    <p class="eyebrow">Almost done</p>

    <h2 class="question">
      Can I get your full name, phone number and email address?
    </h2>

    <p class="helper">
      Please provide your contact information so we can process your submission.
    </p>

    <form id="lead-form" novalidate>
      <div class="form-grid">

        <div class="field">
          <label for="fullName">Full name *</label>
          <input id="fullName" name="fullName" type="text" autocomplete="name" required>
          <div id="fullName-error" class="error" role="alert"></div>
        </div>

        <div class="field">
          <label for="email">Email *</label>
          <input id="email" name="email" type="email" autocomplete="email" required>
          <div id="email-error" class="error" role="alert"></div>
        </div>

        <div class="field">
          <label for="phone">Phone *</label>
          <input id="phone" name="phone" type="tel" autocomplete="tel" required>
          <div id="phone-error" class="error" role="alert"></div>
        </div>

        <div class="field">
          <label for="others">
            Others <span class="optional">(optional)</span>
          </label>
          <textarea
            id="others"
            name="others"
            placeholder="Anything else you'd like us to know?"
          ></textarea>
        </div>
      </div>

      <div class="terms-field">
  <label class="terms-checkbox">
    <input
      id="terms"
      name="terms"
      type="checkbox"
      required
    >
   <span>
  I agree to receive calls and text messages about my application from the
  <strong>MichiganWorkFromHome.Com</strong> team
</span>
  </label>

  <div id="terms-error" class="error" role="alert"></div>
</div>

      <div class="navigation-buttons">
        <button type="button" class="secondary-button" id="previous-button">
          Previous
        </button>

        <button type="submit" class="primary-button">
          Submit
        </button>
      </div>
    </form>
  `;

  document.getElementById("lead-form")
    .addEventListener("submit", handleSubmit);

  document.getElementById("previous-button")
    .addEventListener("click", () => {
      state.currentStep = branches[state.path].length - 1;
      renderQuestion();
    });

  bindHomeLinks();
}

function validateContactForm(form) {
  let valid = true;

["fullName", "email", "phone"].forEach(id => {
  document.getElementById(`${id}-error`).textContent = "";
});

document.getElementById("terms-error").textContent = "";

const fullName = form.fullName.value.trim();
const email = form.email.value.trim();
const phone = form.phone.value.trim();
const termsAccepted = form.terms.checked;

  if (!fullName) {
    document.getElementById("fullName-error").textContent =
      "Please enter your full name.";
    valid = false;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("email-error").textContent =
      "Please enter a valid email address.";
    valid = false;
  }

  if (!phone || phone.replace(/\D/g, "").length < 7) {
    document.getElementById("phone-error").textContent =
      "Please enter a valid phone number.";
    valid = false;
  }

  if (!termsAccepted) {
  document.getElementById("terms-error").textContent =
    "Please agree to receive calls and text messages before submitting.";
  valid = false;
}

  return valid;
}

async function handleSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;

  if (!validateContactForm(form)) return;

  const payload = {
    submittedAt: new Date().toISOString(),
    path: state.path,
    answers: { ...state.answers },
    contact: {
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      others: form.others.value.trim(),
      termsAccepted: form.terms.checked
    }
  };

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
  await submitLead(payload);
state.submitted = true;
renderSubmissionSuccess();
  } catch (error) {
    console.error(error);

    submitButton.disabled = false;
    submitButton.textContent = "Submit";

    const errorBox = document.createElement("p");
    errorBox.className = "error";
    errorBox.setAttribute("role", "alert");
    errorBox.textContent =
      "We couldn't submit your information right now. Please try again.";

    form.appendChild(errorBox);
  }
}

async function submitLead(payload) {
  if (!N8N_WEBHOOK_URL) {
    console.log("n8n is not connected yet.", payload);
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`n8n returned HTTP ${response.status}`);
  }
}

function renderSubmissionSuccess() {
  setProgress(100, 100, "Submitted");

  const providerSection =
    state.path === "provider"
      ? `
        <p>Here are some ways to find clients for Home Help:</p>
        <ol class="info-list">
          ${findingClients.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
        </ol>
      `
      : `
        <p>Your information has been submitted successfully.</p>
      `;

  app.innerHTML = `
    <div class="result success">
      <h2>Thank you for your submission.</h2>
      ${providerSection}
    </div>
<div class="knowledge-link-card">
  <p class="knowledge-link-text">
    Interested in learning more about the Michigan Medicaid Home Help Program?
  </p>

  <div class="success-actions">

    <a class="knowledge-link-button" href="knowledge.html">
      Click here to learn more
    </a>

    <button
      type="button"
      class="home-button success-home-button"
      id="success-home-button"
    >
      Return to Home
    </button>

  </div>
</div>
  `;

  document.getElementById("success-home-button")
  .addEventListener("click", () => {
    renderStart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  bindHomeLinks();
}

function renderIneligible() {
  setProgress(100, 100, "Screening complete");

  app.innerHTML = `
    <div class="result">
      <h2>Unfortunately, you don't currently meet the requirements.</h2>

      <p>
        Home Help eligibility can depend on factors such as Michigan residency,
        Medicaid eligibility, medical need for assistance with daily living,
        and the person's living situation.
      </p>

      <p>
        Other program requirements may also apply, including state assessment
        and care plan requirements.
      </p>

      <p>Please reach out again if your circumstances change.</p>
    </div>

    <div class="result-actions">
      <button class="primary-button" id="restart-button">
        Start Over
      </button>
    </div>
  `;

  document.getElementById("restart-button")
    .addEventListener("click", () => {
      renderStart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

  bindHomeLinks();
}

renderStart();
bindHomeLinks();

document.querySelector(".back-to-top")?.addEventListener("click", event => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
