'use strict';
const items=[
 {name:'공렬토기',row:0,
  description:'청동기시대 전기에 주로 만들어 사용했어요. 토기의 입술 바로 아래에 안쪽에서 바깥쪽으로 일정한 간격의 작은 구멍을 뚫었어요.'},
 {name:'민무늬토기',row:1,
  description:'청동기시대의 대표적인 토기로, 표면에 무늬가 없어 민무늬토기라고 불러요. 납작한 바닥과 목이 있는 형태가 많고, 낮은 온도에서 구워 적갈색을 띠어요.'},
 {name:'점토대토기',row:2,
  description:'청동기시대 후기에 주로 만들어 사용했어요. 사진 속 토기는 입술 부분에 둥근 점토 띠를 붙인 형태예요.'},
 {name:'굽다리접시',row:3,
  description:'높은 굽다리 위에 접시를 올린 형태예요. 한자 두(豆)의 모습과 비슷해 두형 토기라고도 불리며, 주로 제기로 사용했던 것으로 추정해요.'}
];
const $=id=>document.getElementById(id);
function sentenceLines(text){return text.replace(/\.\s*/g,'.\n').trim();}
let state={order:[],index:0,answers:[],locked:false};
function screen(id){for(const p of ['start','play','finish'])$(p).hidden=p!==id;}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function begin(){state={order:shuffle([...items]),index:0,answers:[],locked:false};screen('play');render();}
function render(){
 state.locked=false;const item=state.order[state.index];
 $('mode').textContent='진짜 유물 찾기';$('round').textContent=(state.index+1)+' / 4';$('progress').value=state.index;
 const emphasis=document.createElement('span');emphasis.className='question-subject';emphasis.textContent='진짜 '+item.name;
 $('question').replaceChildren(emphasis);$('question').append('를 골라주세요.');
 // Give no answer-revealing clues until the player has chosen a vessel.
 $('answer').hidden=true;$('answer').replaceChildren();$('next').hidden=true;
 $('next').textContent=state.index===3?'결과 보기':'다음 토기';$('cards').replaceChildren();
 shuffle([true,false]).forEach((real,i)=>{
  const button=document.createElement('button');button.className='choice';button.setAttribute('aria-label',(i+1)+'번 토기 선택');
  const img=document.createElement('span');img.className='image';img.style.backgroundPosition=(real?'0%':'100%')+' '+(item.row*100/3)+'%';
  img.setAttribute('role','img');img.setAttribute('aria-label',item.name+' 관찰 그림 '+(i+1));
  const label=document.createElement('small');label.textContent=(i+1)+'번 토기';button.append(img,label);
  button.onclick=()=>answer(button,real);$('cards').append(button);
 });
}
function answer(button,real){
 if(state.locked)return;state.locked=true;const item=state.order[state.index],correct=real;
 state.answers.push({item,correct});for(const b of $('cards').children)b.disabled=true;
 button.classList.add('selected',correct?'correct':'wrong');
 const status=document.createElement('strong');status.className='feedback-title';status.textContent=correct?'정답!':'틀렸습니다!';
 const description=document.createElement('p');description.className='artifact-description';description.textContent=sentenceLines(item.description);
 $('answer').setAttribute('data-correct',String(correct));$('answer').replaceChildren(status,description);$('answer').hidden=false;$('next').hidden=false;$('progress').value=state.index+1;
}
$('next').onclick=()=>{
 if(!state.locked)return;
 if(++state.index<4){render();return;}
 screen('finish');$('score').textContent=state.answers.filter(a=>a.correct).length+' / 4';$('review').replaceChildren();
 for(const a of state.answers){
  const entry=document.createElement('div');entry.className='review';
  const title=document.createElement('strong');title.textContent=(a.correct?'O ':'X ')+a.item.name;
  const pair=document.createElement('div');pair.className='review-pair';
  for(const real of [true,false]){
   const figure=document.createElement('figure');figure.className='review-vessel '+(real?'is-real':'is-fake');
   const img=document.createElement('span');img.className='image';img.style.backgroundPosition=(real?'0%':'100%')+' '+(a.item.row*100/3)+'%';
   img.setAttribute('role','img');img.setAttribute('aria-label',a.item.name+' '+(real?'진짜':'가짜')+' 그림');
   const caption=document.createElement('figcaption');caption.textContent=real?'진짜 유물':'가짜 유물';
   figure.append(img,caption);pair.append(figure);
  }
  entry.append(title,pair);$('review').append(entry);
 }
};
document.querySelector('[data-mode="real"]').onclick=begin;$('again').onclick=begin;
window.artifactDetective={getState:()=>({mode:'real',round:state.index+1,answered:state.answers.length,locked:state.locked})};
