/* ===== NAV SCROLL ===== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ===== REVEAL ON SCROLL ===== */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
revealEls.forEach(el => revealObs.observe(el));

/* ===== CHATBOT KNOWLEDGE BASE ===== */
const KB = [
  {
    keys: ['education', 'degree', 'university', 'study', 'studied', 'msc', 'bsc', 'chandigarh', 'cgpa'],
    answer: 'Beerpal holds an M.Sc. in Data Science from Chandigarh University (CGPA 7.61) and a B.Sc. in AI & Machine Learning from IK Gujral Punjab Technical University (CGPA 8.3).'
  },
  {
    keys: ['experience', 'work', 'job', 'intern', 'internship', 'apprenticeship', 'makes360', 'acme'],
    answer: 'Beerpal worked as an Apprenticeship Trainee at Makes360 (Jun–Jul 2024), where he won the Super Achiever Award, and as a Data Science Intern at Acme Grade (Jul–Sep 2022).'
  },
  {
    keys: ['project', 'medical', 'rag', 'agent', 'clinical', 'faiss', 'duckdb'],
    answer: 'His flagship project is the Medical AI Agent — a RAG-based clinical assistant using DuckDB SQL + FAISS hybrid retrieval, integrated with Qwen and Groq LLMs, deployed on Railway via Docker. See it on GitHub: github.com/beerpalsinghyolo/Medical-AI-Agent-RAG'
  },
  {
    keys: ['dashboard', 'analytics', 'etl', 'healthcare', 'pipeline'],
    answer: 'He also built a Clinical Analytics Dashboard — an ETL pipeline that analyzed 750K+ healthcare records across 100K patients, with 20+ visualizations covering disease trends and medication adherence.'
  },
  {
    keys: ['skill', 'technology', 'tech', 'python', 'llm', 'genai', 'langchain', 'stack', 'tools'],
    answer: "Beerpal's core skills: LLM & GenAI (RAG, embeddings, FAISS, prompt engineering), Python, SQL, FastAPI, GCP, Docker, Pandas, NumPy, Tableau, and deep NLP experience."
  },
  {
    keys: ['contact', 'email', 'phone', 'reach', 'hire', 'available', 'open', 'opportunity'],
    answer: 'You can reach Beerpal at ibeerpalsingh@gmail.com or +91-7837783001. He is open to full-time roles, freelance projects, and research collaborations — including relocation and remote work.'
  },
  {
    keys: ['linkedin', 'github', 'social', 'profile', 'link'],
    answer: 'LinkedIn: linkedin.com/in/beerpalsingh | GitHub: github.com/beerpalsinghyolo'
  },
  {
    keys: ['ieee', 'paper', 'research', 'publication', 'emotion', 'sentiment', 'nlp', 'deep learning'],
    answer: 'Beerpal published "Optimizing Emotion Detection: An NLP-Driven Deep Learning Approach to Sentiment Encoding" at IEEE ICDSBS 2025. Read it at ieeexplore.ieee.org/document/11031712'
  },
  {
    keys: ['cuda', 'society', 'founder', 'club', 'community', 'member'],
    answer: 'Beerpal founded and served as Secretary of CUDA — the Chandigarh University Data Analytics Society, with 500+ members.'
  },
  {
    keys: ['location', 'based', 'where', 'live', 'from', 'mohali', 'india', 'punjab'],
    answer: 'Beerpal is based in Mohali, Punjab, India and is open to relocation and remote work globally.'
  },
  {
    keys: ['certification', 'certificate', 'google', 'coursera', 'nptel', 'johns hopkins'],
    answer: 'Certifications: Google Data Analytics Professional, Python for Data Science (NPTEL), Agile with Atlassian Jira, and Data Scientist\'s Toolbox from Johns Hopkins.'
  },
  {
    keys: ['award', 'prize', 'achievement', 'expo', 'recognition', 'achiever'],
    answer: 'Achievements include: Super Achiever Award at Makes360, Third Prize at Chandigarh University Project Expo, IEEE research publication, and founding CUDA with 500+ members.'
  },
  {
    keys: ['interest', 'hobby', 'hobbies', 'outside', 'personal'],
    answer: 'Outside of tech, Beerpal enjoys photography, Sikh history, and basketball.'
  },
  {
    keys: ['hello', 'hi', 'hey', 'greet', 'good morning', 'good evening'],
    answer: "Hello! I'm Beerpal's assistant. You can ask me about his education, skills, projects, experience, or how to get in touch."
  },
  {
    keys: ['who', 'about', 'beerpal', 'yourself', 'introduce'],
    answer: "Beerpal Singh is an AI Developer from Mohali, Punjab, specialising in LLM-powered applications, RAG systems, and NLP. He's an M.Sc. Data Science graduate and published IEEE researcher open to exciting opportunities."
  },
];

function getBotReply(input) {
  const lower = input.toLowerCase();
  for (const entry of KB) {
    if (entry.keys.some(k => lower.includes(k))) {
      return entry.answer;
    }
  }
  return "I'm not sure about that — but you can reach Beerpal directly at ibeerpalsingh@gmail.com or connect on LinkedIn at linkedin.com/in/beerpalsingh.";
}

/* ===== CHATBOT UI ===== */
const chatbot = document.getElementById('chatbot');
const chatToggle = document.getElementById('chatToggle');
const chatClose = document.getElementById('chatClose');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

chatToggle.addEventListener('click', () => {
  chatbot.classList.toggle('hidden');
  if (!chatbot.classList.contains('hidden')) chatInput.focus();
});
chatClose.addEventListener('click', () => chatbot.classList.add('hidden'));

function appendMsg(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const p = document.createElement('p');
  p.textContent = text;
  div.appendChild(p);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return p;
}

function typeMsg(text) {
  const div = document.createElement('div');
  div.className = 'msg bot';
  const p = document.createElement('p');
  p.textContent = '';
  div.appendChild(p);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  let i = 0;
  const interval = setInterval(() => {
    p.textContent += text[i];
    i++;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    if (i >= text.length) clearInterval(interval);
  }, 18);
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  appendMsg('user', text);

  setTimeout(() => {
    const reply = getBotReply(text);
    typeMsg(reply);
  }, 350);
});

/* ===== CONTACT FORM ===== */
function handleContact(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const msg = document.getElementById('contactMsg').value.trim();
  const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
  const body = encodeURIComponent(`Hi Beerpal,\n\n${msg}\n\nFrom: ${name}\nReply to: ${email}`);
  window.location.href = `mailto:ibeerpalsingh@gmail.com?subject=${subject}&body=${body}`;
  document.getElementById('contactConfirm').classList.remove('hidden');
  document.getElementById('contactForm').reset();
}

/* ===== SMOOTH ANCHOR ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
