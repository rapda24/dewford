/* Store inquiries on the server; never put personal information in browser storage. */
(function(){
  'use strict';
  function setup(){document.querySelectorAll('[data-native-consultation],[data-dewford-inquiry]').forEach(form=>{
    const consent=document.createElement('label');consent.className='df-consent';const check=document.createElement('input');check.type='checkbox';check.name='consent';check.required=true;
    consent.append(check,document.createTextNode('상담 답변을 위해 성함, 이메일 및 입력한 상담 내용을 수집·이용하는 데 동의합니다. 입력 내용은 상담 목적으로 저장되며, ADMIN@DEWFORD.COM으로 삭제를 요청할 수 있습니다. 동의하지 않으면 신청할 수 없습니다.'));
    const submit=form.querySelector('[type=submit]');submit.closest('p').before(consent);
    let status=form.querySelector('.wpcf7-response-output,[role=status]');if(!status){status=document.createElement('p');form.append(status);}status.removeAttribute('aria-hidden');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.classList.remove('wpcf7-response-output','df-consultation-status');status.classList.add('dewford-form-feedback');status.textContent='';
  });}
  document.addEventListener('submit',async event=>{
    const form=event.target;if(!form.matches('[data-native-consultation],[data-dewford-inquiry]'))return;
    event.preventDefault();event.stopImmediatePropagation();if(!form.reportValidity()||form.dataset.sending)return;
    const fields=new FormData(form),data={};const aliases={parent:'your-name',email:'your-email',phone:'your-phone',message:'your-message'};
    ['parent','email','phone','grade','program','topic','message'].forEach(k=>{data[k]=fields.get(k)||fields.get(aliases[k])||'';});data.consent=fields.get('consent')==='on';data.source=location.pathname;
    const button=form.querySelector('[type=submit]'),status=form.querySelector('[role=status]');button.disabled=true;form.dataset.sending='true';status.textContent='상담 신청을 접수하고 있습니다.';
    try{const res=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});let result;try{result=await res.json();}catch{throw Error('상담 서버에 연결할 수 없습니다. 잠시 후 다시 시도하거나 ADMIN@DEWFORD.COM으로 문의해 주세요.');}if(!res.ok)throw Error(result.error||'상담 신청에 실패했습니다.');form.reset();status.textContent='상담 신청이 접수되었습니다. 입력하신 이메일로 안내드리겠습니다.';}
    catch(e){status.textContent=e.message||'접수하지 못했습니다. 입력 내용은 유지됩니다. 다시 시도해 주세요.';}finally{button.disabled=false;delete form.dataset.sending;}
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
