#!/usr/bin/env python3
"""Generate responsive derivatives, preserving the original photography."""
from pathlib import Path
from PIL import Image, ImageOps
import re, json, hashlib
ROOT=Path(__file__).resolve().parents[1]
files=[p for p in ROOT.glob('*.html') if p.name!='index_bu.html']+list((ROOT/'assets/css').glob('dewford*.css'))+list((ROOT/'assets/data').glob('*'))+[ROOT/'cloudflare/seed.json']
refs=set()
for p in files:
    for name in re.findall(r'(?:assets/|\.\./)(images/dewford/[^\s\"\'()<>]+?\.(?:jpg|jpeg|png|webp))',p.read_text()):
        refs.add('assets/'+name)
manifest_path=ROOT/'assets/data/dewford-image-variants.json'
manifest=json.loads(manifest_path.read_text()) if manifest_path.exists() else {}; output=ROOT/'assets/images/dewford/responsive';output.mkdir(exist_ok=True)
for name in sorted(refs):
    path=ROOT/name
    if not path.exists() or path.stat().st_size<120000 or '/responsive/' in name or any(x in path.name.lower() for x in ['logo','symbol']):continue
    with Image.open(path) as raw:
        if getattr(raw,'is_animated',False):continue
        img=ImageOps.exif_transpose(raw).convert('RGB')
        if img.width<640:continue
        stem=path.stem+'-'+hashlib.sha256(name.encode()).hexdigest()[:8]
        variants=[]
        for width in sorted(set(min(w,img.width) for w in [768,1280,1920])):
            target=output/f'{stem}-{width}.webp'
            if not target.exists():img.resize((width,round(img.height*width/img.width)),Image.Resampling.LANCZOS).save(target,'WEBP',quality=82,method=5)
            variants.append((str(target.relative_to(ROOT)),width))
        manifest[name]={'src':variants[-1][0],'srcset':', '.join(f'{p} {w}w' for p,w in variants),'width':img.width,'height':img.height,'mobile':variants[0][0],'before':path.stat().st_size,'after':(ROOT/variants[-1][0]).stat().st_size}
(ROOT/'assets/data/dewford-image-variants.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')))
# Change image tags without reformatting exported HTML. Offscreen pictures remain lazy.
for p in [p for p in ROOT.glob('*.html') if p.name!='index_bu.html']+list((ROOT/'partials').glob('*.html')):
    text=p.read_text()
    def replace_image(m):
        tag=m.group();src=re.search(r'\bsrc=[\"\']([^\"\']+)[\"\']',tag)
        if not src:return tag
        data=manifest.get(src[1]);hero=bool(re.search(r'fetchpriority=[\"\']high',tag))
        if data:
            tag=tag.replace(src[1],data['src'])
            tag=re.sub(r'\s(?:srcset|sizes|width|height)=[\"\'][^\"\']*[\"\']','',tag)
            attrs=f' srcset="{data["srcset"]}" sizes="100vw" width="{data["width"]}" height="{data["height"]}"'
            tag=tag[:-2]+attrs+'/>' if tag.endswith('/>') else tag[:-1]+attrs+'>'
            if not hero:
                tag=re.sub(r'\sloading=[\"\'][^\"\']*[\"\']','',tag)
                tag=tag.replace('<img','<img loading="lazy"',1)
            if 'decoding=' not in tag:tag=tag.replace('<img','<img decoding="async"',1)
        return tag
    text=re.sub(r'<img\b[^>]*>',replace_image,text,flags=re.S)
    # Three overlaid slides should not compete for the initial network connection.
    def defer_slide(m):
        block=m.group()
        if 'is-active' not in block:
            block=re.sub(r'(?<![\w-])src=', 'data-src=',block);block=re.sub(r'(?<![\w-])srcset=','data-srcset=',block)
        return block
    text=re.sub(r'<div class="dewford-(?:hero|title)-slide[^\"]*">\s*<img\b[^>]*>\s*</div>',defer_slide,text,flags=re.S)
    p.write_text(text)
# CSS background images receive a bounded-size desktop WebP instead of camera originals.
for p in (ROOT/'assets/css').glob('dewford*.css'):
    text=p.read_text()
    for original,data in manifest.items():text=text.replace('../'+original.removeprefix('assets/'),'../'+data['src'].removeprefix('assets/'))
    p.write_text(text)
print(json.dumps({'images':len(manifest),'original_MB':round(sum(v['before'] for v in manifest.values())/1e6,2),'optimized_MB':round(sum(v['after'] for v in manifest.values())/1e6,2),'hero':{k:v for k,v in manifest.items() if '/hero/main-' in k}},ensure_ascii=False))
