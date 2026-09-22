(function () {
 'use strict';
 const root=document.querySelector('[data-dewford-calendar]');
 if(!root)return;
 const today=new Date();today.setHours(0,0,0,0);
 let displayed=new Date(today.getFullYear(),today.getMonth(),1),selected=new Date(today),events=[];
 const grid=root.querySelector('.dewford-calendar-days'),heading=root.querySelector('[data-calendar-month]'),picker=root.querySelector('[data-calendar-picker]'),details=root.querySelector('[data-calendar-details]');
 const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const label=d=>new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(d);
 function showDetails(){
  details.replaceChildren();const title=document.createElement('h3');title.textContent=label(selected);details.append(title);
  const matches=events.filter(e=>e.date===key(selected));
  if(!matches.length){const p=document.createElement('p');p.textContent='등록된 일정이 없습니다. 확정된 학사 일정은 추후 안내합니다.';details.append(p);return;}
  const list=document.createElement('ul');matches.forEach(event=>{const li=document.createElement('li'),strong=document.createElement('strong');strong.textContent=event.title;li.append(strong);if(event.description){const p=document.createElement('p');p.textContent=event.description;li.append(p);}list.append(li);});details.append(list);
 }
 function render(focus=false){
  heading.textContent=`${displayed.getFullYear()}년 ${displayed.getMonth()+1}월`;
  picker.value=`${displayed.getFullYear()}-${String(displayed.getMonth()+1).padStart(2,'0')}`;
  grid.replaceChildren();const first=new Date(displayed.getFullYear(),displayed.getMonth(),1-displayed.getDay());
  for(let i=0;i<42;i++){
   const date=new Date(first);date.setDate(first.getDate()+i);
   const button=document.createElement('button');button.type='button';button.dataset.date=key(date);button.className='dewford-calendar-day';
   button.setAttribute('aria-label',label(date));button.setAttribute('aria-pressed',String(key(date)===key(selected)));
   if(date.getMonth()!==displayed.getMonth())button.classList.add('is-outside');
   if(key(date)===key(today)){button.classList.add('is-today');button.setAttribute('aria-current','date');}
   if(key(date)===key(selected))button.classList.add('is-selected');
   const number=document.createElement('span');number.className='dewford-calendar-number';number.textContent=date.getDate();button.append(number);
   const matches=events.filter(e=>e.date===key(date));
   if(matches.length){button.classList.add('has-events');button.setAttribute('aria-label',label(date)+`, 일정 ${matches.length}개`);const count=document.createElement('span');count.className='dewford-calendar-event';count.textContent=matches.length===1?matches[0].title:`일정 ${matches.length}개`;button.append(count);}
   button.addEventListener('click',()=>{selected=date;displayed=new Date(date.getFullYear(),date.getMonth(),1);render(true);});
   button.addEventListener('keydown',event=>{const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};if(!(event.key in offsets))return;event.preventDefault();selected=new Date(date);selected.setDate(selected.getDate()+offsets[event.key]);displayed=new Date(selected.getFullYear(),selected.getMonth(),1);render(true);});
   grid.append(button);
  }
  showDetails();if(focus)grid.querySelector(`[data-date="${key(selected)}"]`)?.focus({preventScroll:true});
 }
 function moveMonth(amount){displayed=new Date(displayed.getFullYear(),displayed.getMonth()+amount,1);selected=new Date(displayed);render();}
 root.querySelector('[data-calendar-prev]').addEventListener('click',()=>moveMonth(-1));
 root.querySelector('[data-calendar-next]').addEventListener('click',()=>moveMonth(1));
 root.querySelector('[data-calendar-today]').addEventListener('click',()=>{selected=new Date(today);displayed=new Date(today.getFullYear(),today.getMonth(),1);render();});
 picker.addEventListener('change',()=>{if(!/^\d{4}-\d{2}$/.test(picker.value))return;const [year,month]=picker.value.split('-').map(Number);displayed=new Date(year,month-1,1);selected=new Date(displayed);render();});
 render();
 fetch('assets/data/dewford-calendar.json').then(response=>{if(!response.ok)throw Error('calendar');return response.json();}).then(data=>{events=(data[root.dataset.dewfordCalendar]||[]).filter(e=>typeof e.date==='string'&&typeof e.title==='string');render();}).catch(()=>{root.querySelector('[data-calendar-notice]').textContent='일정 데이터를 불러오지 못했습니다. 학사 일정은 행정실로 문의해 주세요.';});
})();
