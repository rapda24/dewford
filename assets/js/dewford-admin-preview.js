/* Isolated sample data for reviewing the admin UI without a running API. */
(function () {
  'use strict';
  const key = 'dewford-admin-preview-v1';
  const copy = value => JSON.parse(JSON.stringify(value));
  const today = new Date();
  const date = day => `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  const seed = {
    posts: (window.DEWFORD_EVENTS || []).map((p,i) => ({...copy(p),board:'event',position:i})).concat([
      {id:'preview-preschool-1',board:'preschool',title:'가을 자연 탐구 활동',date:date(15),description:'계절의 변화를 관찰하고 자연 속에서 발견한 이야기를 나눕니다. (미리보기 예시)',position:0},
      {id:'preview-preschool-2',board:'preschool',title:'학부모 오픈 클래스',date:date(22),description:'아이들의 배움의 순간을 함께 만나는 시간입니다. (미리보기 예시)',position:1},
      {id:'preview-elementary-1',board:'elementary',title:'프로젝트 발표회',date:date(25),description:'탐구한 주제를 친구들과 함께 발표합니다. (미리보기 예시)',position:0}
    ]),
    inquiries: [
      {id:'preview-inquiry-1',parent:'샘플 학부모 A',email:'parent-a@example.com',phone:'',grade:'유아 / 유치부',program:'International Early Learning Program',topic:'입학 상담',message:'방문 상담이 가능한 요일과 입학 절차를 알고 싶습니다.\n실제 신청이 아닌 화면 확인용 예시입니다.',source:'admissions-inquiry.html',created:new Date().toISOString(),status:'new'},
      {id:'preview-inquiry-2',parent:'샘플 학부모 B',email:'parent-b@example.com',phone:'',grade:'초등 2학년',program:'Primary ESL Program',topic:'교육 과정 상담',message:'초등 영어 프로그램의 수업 시간을 문의합니다.\n실제 신청이 아닌 화면 확인용 예시입니다.',source:'contact.html',created:new Date().toISOString(),status:'reviewing'}
    ]
  };
  let state=copy(seed);
  try {const saved=JSON.parse(sessionStorage.getItem(key));if(saved&&Array.isArray(saved.posts)&&Array.isArray(saved.inquiries))state=saved;}catch{}
  function persist(){try{sessionStorage.setItem(key,JSON.stringify(state));}catch{}}
  window.DEWFORD_ADMIN_PREVIEW = {
    reset(){state=copy(seed);persist();},
    async request(path,method='GET',data={}){
      if(path==='session')return {authenticated:true,username:'미리보기',csrf:''};
      if(path==='logout')return {ok:true};
      if(path==='posts'&&method==='GET')return copy(state.posts.slice().sort((a,b)=>a.position-b.position));
      if(path==='inquiries'&&method==='GET')return copy(state.inquiries);
      if(path==='posts'&&method==='POST'){
        const post={...copy(data),id:'preview-'+Date.now()+'-'+Math.random().toString(16).slice(2),position:Math.min(0,...state.posts.map(p=>p.position))-1};
        post.image=post.image||'assets/images/dewford/events/event-01.png';state.posts.push(post);persist();return copy(post);
      }
      const match=path.match(/^(posts|inquiries)\/([\w-]+)(\/reorder)?$/);
      if(!match)throw Error('미리보기에서 지원하지 않는 작업입니다.');
      const rows=state[match[1]],index=rows.findIndex(p=>p.id===match[2]);
      if(index<0)throw Error('항목을 찾을 수 없습니다.');
      if(match[3]){
        const ordered=rows.filter(p=>p.board===rows[index].board).sort((a,b)=>a.position-b.position);
        const i=ordered.findIndex(p=>p.id===match[2]),j=i+(data.direction==='up'?-1:1);
        if(j>=0&&j<ordered.length){[ordered[i],ordered[j]]=[ordered[j],ordered[i]];ordered.forEach((p,n)=>{p.position=n;});}
      }else if(method==='DELETE')rows.splice(index,1);
      else if(method==='PUT'){rows[index]={...rows[index],...copy(data),id:match[2]};if(match[1]==='posts')rows[index].image=rows[index].image||'assets/images/dewford/events/event-01.png';}
      else throw Error('미리보기에서 지원하지 않는 작업입니다.');
      persist();return {ok:true};
    }
  };
})();
