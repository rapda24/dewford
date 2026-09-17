/* Prepare an email draft. No inquiry is sent automatically or to the demo server. */
document.addEventListener('submit', function (event) {
  const form = event.target;
  if (!form.matches('.wpcf7-form[data-dewford-inquiry]')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (!form.reportValidity()) return;
  const lines = ['Dewford 입학 상담 문의', ''];
  const labels = {'your-name': '학부모 성함', 'your-email': '이메일', 'your-phone': '연락처', 'your-message': '문의 내용', 'program': '관심 과정', 'topic': '상담 주제'};
  for (const field of form.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), select, textarea')) {
    if (!field.value || field.disabled) continue;
    lines.push((labels[field.name] || field.getAttribute('placeholder') || (field.tagName === 'SELECT' ? '상담 선택' : '입력 내용')) + ': ' + field.value);
  }
  window.location.href = 'mailto:ADMIN@DEWFORD.COM?subject=' + encodeURIComponent('Dewford 입학 상담 문의') + '&body=' + encodeURIComponent(lines.join('\n'));
}, true);
