(function(){
  'use strict';
  const box=document.querySelector('#df-rich-editor');if(!box)return;
  const editor=new Quill(box,{theme:'snow',placeholder:'내용을 입력하고 글자나 문단을 선택해 서식을 적용하세요.',formats:['header','size','bold','italic','underline','list','blockquote','align'],modules:{toolbar:[[{header:[2,3,false]}],[{size:['small',false,'large','huge']}],['bold','italic','underline'],[{list:'ordered'},{list:'bullet'}],['blockquote',{align:[]}],['clean']]}});
  editor.root.setAttribute('aria-label','게시글 내용');editor.root.setAttribute('role','textbox');editor.root.setAttribute('aria-multiline','true');
  const names={bold:'굵게',italic:'기울임',underline:'밑줄',blockquote:'인용문',clean:'서식 지우기',list:'목록',align:'정렬',header:'문단 제목',size:'글자 크기'};
  box.previousElementSibling.querySelectorAll('button,select').forEach(el=>{const key=Object.keys(names).find(k=>el.classList.contains('ql-'+k));if(key){el.setAttribute('aria-label',names[key]);el.title=names[key];}});
  box.previousElementSibling.querySelectorAll('.ql-picker').forEach(el=>{const key=Object.keys(names).find(k=>el.classList.contains('ql-'+k));if(key)el.querySelector('.ql-picker-label')?.setAttribute('aria-label',names[key]);});
  window.DEWFORD_EDITOR={
    load(post){if(post.content?.ops)editor.setContents(post.content);else{
      const ops=[];const paragraphs=post.paragraphs?.length?post.paragraphs:(post.description||'').split('\n');
      // Preserve legacy subheadings when an existing plain-text article is first edited.
      const headings=post.headings||[];
      paragraphs.forEach((text,i)=>{if(headings[i])ops.push({insert:headings[i]},{insert:'\n',attributes:{header:2}});ops.push({insert:text+'\n'});});
      headings.slice(paragraphs.length).forEach(text=>ops.push({insert:text},{insert:'\n',attributes:{header:2}}));
      editor.setContents({ops:ops.length?ops:[{insert:'\n'}]});
    }editor.history.clear();},
    read(){return {content:editor.getContents(),text:editor.getText().trim()};}
  };
})();
