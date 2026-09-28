/* Render stored formatting using text nodes, never executable HTML. */
(function(){
  'use strict';
  function render(target,content){
    target.replaceChildren();target.classList.add('df-rich-content');
    let line=document.createDocumentFragment(),list=null;
    function flush(a={}){
      let block=document.createElement(a.list?'li':a.header===2?'h2':a.header===3?'h3':a.blockquote?'blockquote':'p');
      if(['center','right','justify'].includes(a.align))block.style.textAlign=a.align;
      if(!line.childNodes.length)line.append(document.createElement('br'));block.append(line);
      if(a.list){const tag=a.list==='ordered'?'OL':'UL';if(!list||list.tagName!==tag){list=document.createElement(tag);target.append(list);}list.append(block);}
      else{list=null;target.append(block);}line=document.createDocumentFragment();
    }
    for(const op of content?.ops||[]){
      if(typeof op.insert!=='string')continue;const a=op.attributes||{},parts=op.insert.split('\n');
      parts.forEach((text,i)=>{if(text){let n=document.createTextNode(text);for(const [key,tag] of [['bold','strong'],['italic','em'],['underline','u']])if(a[key]===true){const wrap=document.createElement(tag);wrap.append(n);n=wrap;}if(['small','large','huge'].includes(a.size)){const span=document.createElement('span');span.className='df-text-'+a.size;span.append(n);n=span;}line.append(n);}if(i<parts.length-1)flush(a);});
    }
    if(line.childNodes.length)flush();
  }
  window.DEWFORD_RICH_TEXT={render};
})();
