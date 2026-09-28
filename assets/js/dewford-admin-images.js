/* File attachments are uploaded only when the administrator saves the post. */
(function () {
  'use strict';
  const $=s=>document.querySelector(s), form=$('#df-editor-form');
  if(!form)return;
  let cover=[], gallery=[], busy=false;
  const status=$('#df-editor-status');
  function release(item){if(item.file)URL.revokeObjectURL(item.url);}
  function sync(){form.elements.image.value=cover[0]?.url||'';form.elements.gallery.value=gallery.map(item=>item.url).join('\n');}
  function render(){
    sync();
    for(const [items,selector] of [[cover,'#df-image-preview'],[gallery,'#df-gallery-preview']]){
      const box=$(selector);box.replaceChildren();
      items.forEach((item,index)=>{
        const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption'),remove=document.createElement('button');
        img.src=item.url;img.alt=item.file?.name||'첨부 이미지';caption.textContent=item.file?.name||'저장된 이미지';
        remove.type='button';remove.textContent='삭제';remove.disabled=busy;remove.setAttribute('aria-label',`${caption.textContent} 삭제`);
        remove.onclick=()=>{release(item);items.splice(index,1);render();};figure.append(img,caption,remove);box.append(figure);
      });
    }
  }
  function select(input,main){
    const files=Array.from(input.files);input.value='';if(busy||!files.length)return;
    if(files.some(file=>!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)){
      status.textContent='20MB 이하의 JPG, PNG, WebP 파일을 선택해 주세요.';return;
    }
    if(!main&&gallery.length+files.length>30){status.textContent='추가 사진은 최대 30장까지 첨부할 수 있습니다.';return;}
    const added=files.map(file=>({file,url:URL.createObjectURL(file)}));
    if(main){cover.forEach(release);cover=added.slice(0,1);}else gallery.push(...added);
    status.textContent='';render();
  }
  $('#df-image-file').addEventListener('change',e=>select(e.target,true));
  $('#df-gallery-files').addEventListener('change',e=>select(e.target,false));
  async function prepare(item){
    const img=new Image();img.src=item.url;
    try{await img.decode();}catch{throw Error('이미지를 읽을 수 없습니다. 다른 이미지 파일을 선택해 주세요.');}
    const canvas=document.createElement('canvas');const scale=Math.min(1,1920/Math.max(img.naturalWidth,img.naturalHeight));
    canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const context=canvas.getContext('2d');if(!context)throw Error('이미지 처리를 지원하는 브라우저에서 다시 시도해 주세요.');
    context.drawImage(img,0,0,canvas.width,canvas.height);
    let blob;
    for(const quality of [.88,.75,.6,.45]){
      blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));
      if(blob&&blob.size<=1000000)break;
    }
    if(!blob||blob.size>1000000)throw Error('사진 용량이 큽니다. 사진 크기를 줄인 뒤 다시 선택해 주세요.');
    return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('이미지를 읽을 수 없습니다.'));reader.readAsDataURL(blob);});
  }
  window.DEWFORD_ADMIN_IMAGES={
    reset(){
      cover.forEach(release);gallery.forEach(release);
      cover=form.elements.image.value?[{url:form.elements.image.value}]:[];
      gallery=form.elements.gallery.value.split('\n').filter(Boolean).map(url=>({url}));render();
    },
    async upload(api,preview){
      busy=true;$('#df-image-file').disabled=true;$('#df-gallery-files').disabled=true;render();
      const pending=[...cover,...gallery].filter(item=>item.file);
      try{
        for(const [index,item] of pending.entries()){
          status.textContent=`사진 저장 중입니다. (${index+1}/${pending.length})`;
          const data=await prepare(item);
          const url=preview?data:(await api('media','POST',{content:data.split(',')[1]})).url;
          release(item);delete item.file;item.url=url;sync();
        }
      }finally{busy=false;$('#df-image-file').disabled=false;$('#df-gallery-files').disabled=false;render();}
    }
  };
})();
