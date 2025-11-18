/* --- Configuration --- */
/* Replace these with your real values before going live */
const CONFIG = {
  // If you want to use Formspree: set FORMSPREE_ID to your form ID (e.g. "f/abcd1234")
  // Then set USE_FORMSPREE = true. If false, the script will open the user's mail app via mailto.
  USE_FORMSPREE: true,
  FORMSPREE_ID: "https://formspree.io/f/mnnwqqoa",
  // The email address that will receive booking requests when using mailto fallback:
  BOOKING_EMAIL: "itsmeishantyt@gmail.com"
};

/* --- Utilities: Smooth scroll for nav and hero button --- */
document.querySelectorAll('.nav a, .btn-primary[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* --- Footer year and contact link --- */
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('contact-email').href = `mailto:${CONFIG.BOOKING_EMAIL}`;
document.getElementById('contact-email').textContent = CONFIG.BOOKING_EMAIL;

/* --- Form handling --- */
const form = document.getElementById('booking-form');
const messageEl = document.getElementById('form-message');
const sendBtn = document.getElementById('send-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage();

  const formData = new FormData(form);
  const name = (formData.get('name') || '').toString().trim();
  const email = (formData.get('email') || '').toString().trim();
  const age = (formData.get('age') || '').toString().trim();
  const sessionType = (formData.get('sessionType') || '').toString();
  const availability = (formData.get('availability') || '').toString().trim();
  const notes = (formData.get('notes') || '').toString().trim();

  if (!name || !email || !age || !sessionType) {
    showMessage('Please fill in all required fields before sending.', 'error');
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending…';

  // Option A: Submit to Formspree (recommended for a real inbox copy)
  if (CONFIG.USE_FORMSPREE && CONFIG.FORMSPREE_ID && CONFIG.FORMSPREE_ID !== 'YOUR_FORM_ID') {
    try {
      const actionUrl = `https://formspree.io/${CONFIG.FORMSPREE_ID}`;
      const payload = {
        name, email, age, sessionType, availability, notes
      };
      const resp = await fetch(actionUrl, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        showMessage('Booking request sent. We will contact you by email.', 'success');
        form.reset();
      } else {
        showMessage('Submission failed — please try again or use the email link below.', 'error');
      }
    } catch (err) {
      showMessage('Network error — please try again or use the email link below.', 'error');
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send Booking Request';
    }
    return;
  }

  // Option B: mailto fallback — opens user's email client prefilled
  const subject = encodeURIComponent('InnerMindTherapy Booking Request');
  const bodyLines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Age: ${age}`,
    `Preferred session: ${sessionType}`,
    `Availability: ${availability || 'Not specified'}`,
    '',
    'Notes:',
    notes || 'No additional notes provided.'
  ];
  const body = encodeURIComponent(bodyLines.join('\n'));
  const mailto = `mailto:${CONFIG.BOOKING_EMAIL}?subject=${subject}&body=${body}`;

  // Try to open mail client:
  window.location.href = mailto;

  showMessage("We've opened your email app with the booking details. Please press Send to complete the request.", 'success');
  form.reset();
  sendBtn.disabled = false;
  sendBtn.textContent = 'Send Booking Request';
});

/* --- Helper functions --- */
function showMessage(text, type = '') {
  messageEl.textContent = text;
  messageEl.classList.remove('success', 'error');
  if (type) messageEl.classList.add(type);
}

function clearMessage() {
  messageEl.textContent = '';
  messageEl.classList.remove('success', 'error');
}
