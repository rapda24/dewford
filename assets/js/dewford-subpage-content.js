(function () {
  'use strict';
  document.querySelectorAll('[data-calendar]').forEach(function (root) {
    var now = new Date();
    var month = new Date(now.getFullYear(), now.getMonth(), 1);
    var events = (window.DEWFORD_CALENDAR || {})[root.dataset.calendar] || [];
    function dateKey(year, m, day) { return year + '-' + String(m + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0'); }
    function render() {
      var year = month.getFullYear(), m = month.getMonth();
      root.querySelector('[data-calendar-label]').textContent = year + '년 ' + (m + 1) + '월';
      var days = root.querySelector('[data-calendar-days]');
      days.replaceChildren();
      var offset = month.getDay(), total = new Date(year, m + 1, 0).getDate();
      for (var row = 0; row < Math.ceil((offset + total) / 7); row++) {
        var tr = document.createElement('tr');
        for (var col = 0; col < 7; col++) {
          var td = document.createElement('td'), day = row * 7 + col - offset + 1;
          if (day > 0 && day <= total) {
            var key = dateKey(year, m, day);
            td.textContent = day;
            td.setAttribute('aria-label', year + '년 ' + (m + 1) + '월 ' + day + '일');
            if (key === dateKey(now.getFullYear(), now.getMonth(), now.getDate())) td.setAttribute('aria-current', 'date');
            events.filter(function (event) { return event.date === key; }).forEach(function (event) {
              var text = document.createElement('span'); text.className = 'dewford-calendar-event'; text.textContent = event.title; td.appendChild(text);
            });
          }
          tr.appendChild(td);
        }
        days.appendChild(tr);
      }
      var agenda = root.querySelector('[data-calendar-agenda]');
      agenda.replaceChildren();
      var upcoming = events.filter(function (event) { return event.date.slice(0, 7) === dateKey(year, m, 1).slice(0, 7); }).sort(function (a,b) { return a.date.localeCompare(b.date); });
      if (!upcoming.length) {
        var p = document.createElement('p'); p.textContent = '학사 일정 안내 예정입니다. 확정된 일정은 이곳에서 안내합니다.'; agenda.appendChild(p);
      } else {
        upcoming.forEach(function (event) { var p = document.createElement('p'); p.textContent = event.date + ' · ' + event.title; agenda.appendChild(p); });
      }
    }
    root.querySelector('[data-calendar-prev]').addEventListener('click', function () { month = new Date(month.getFullYear(), month.getMonth() - 1, 1); render(); });
    root.querySelector('[data-calendar-next]').addEventListener('click', function () { month = new Date(month.getFullYear(), month.getMonth() + 1, 1); render(); });
    root.querySelector('[data-calendar-today]').addEventListener('click', function () { month = new Date(now.getFullYear(), now.getMonth(), 1); render(); });
    render();
  });
  document.querySelectorAll('[data-consultation-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var body = ['학부모 성함: ' + data.get('parent'), '연락처: ' + data.get('phone'), '이메일: ' + data.get('email'), '아이의 연령 / 학년: ' + data.get('grade'), '관심 프로그램: ' + data.get('program'), '', '상담 내용', data.get('message')].join('\n');
      window.location.href = 'mailto:ADMIN@DEWFORD.COM?subject=' + encodeURIComponent('[Dewford] 개별 상담 신청') + '&body=' + encodeURIComponent(body);
      form.querySelector('[role="status"]').textContent = '이메일 앱에서 내용을 확인한 후 보내 주세요. 아직 상담 신청이 전송된 것은 아닙니다.';
    });
  });
})();
