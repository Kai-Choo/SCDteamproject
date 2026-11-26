import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createMeadow } from './environment.js';
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

const $=id=>document.getElementById(id);
const stage=$('stage'),canvas=$('world'),tray=$('tray');
const state={pieces:[],selected:null,solved:0,angle:.55,elevation:.28,zoom:1,ready:false,drag:null,snapping:null};
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(39,1,.05,140);
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});}catch(e){fail('이 브라우저에서 3D 화면을 시작할 수 없어요. 최신 Chrome 또는 Edge에서 다시 열어 주세요.');throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
scene.add(new THREE.HemisphereLight(0xe6f5ff,0x50482a,1.45));
const key=new THREE.DirectionalLight(0xffe6bb,3.1);key.position.set(-4,7,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:25});key.shadow.normalBias=.025;key.shadow.bias=-.0002;key.shadow.radius=3;scene.add(key);
const rim=new THREE.DirectionalLight(0xc8e4ff,.55);rim.position.set(3,2,-3);scene.add(rim);
const assembly=new THREE.Group();scene.add(assembly);
const meadow=createMeadow(scene);
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),plane=new THREE.Plane(),temp=new THREE.Vector3();
const effects=[];
let width=1,height=1,thumbRenderer,thumbnailTimer;

function fail(message){$('loading').hidden=true;$('error').hidden=false;$('error-text').textContent=message;}
function say(message){$('toast').textContent=message;}
function resize(){const r=stage.getBoundingClientRect();width=r.width;height=r.height;renderer.setSize(width,height,false);camera.aspect=width/height;updateCamera();clearTimeout(thumbnailTimer);if(state.ready)thumbnailTimer=setTimeout(makeThumbnails,150);}
function updateCamera(){const distance=(width<600?4.7:4.1)/state.zoom;state.elevation=THREE.MathUtils.clamp(state.elevation,.03,1.28);const horizontal=Math.cos(state.elevation)*distance;camera.position.set(Math.sin(state.angle)*horizontal,.74+Math.sin(state.elevation)*distance,Math.cos(state.angle)*horizontal);camera.lookAt(0,.74,0);camera.updateProjectionMatrix();camera.updateMatrixWorld();}
function pointer(event){const r=canvas.getBoundingClientRect();mouse.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);}
function updateGuides(){for(const p of state.pieces){p.guide.visible=!p.solved;p.guideMaterial.opacity=p===state.selected?.10:.075;p.guideMaterial.color.setHex(p===state.selected?0xffdf8c:0xe4f5ed);p.edgeMaterial.opacity=p===state.selected?.20:.13;}}
function cancelDrag(){const id=state.drag?.id;state.drag=null;if(id!==undefined&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);canvas.classList.remove('dragging');}
function recolor(piece,on){piece.object.traverse(m=>{if(m.isMesh){const materials=Array.isArray(m.material)?m.material:[m.material];materials.forEach(mat=>{if(mat.emissive){mat.emissive.setHex(on?0x6d3512:0);mat.emissiveIntensity=on?.28:0;}});}});}
function updateUI(){
 $('count').innerHTML=`${state.solved+1} <small>/ 7</small>`;$('progress-fill').style.width=`${(state.solved+1)/7*100}%`;
 document.querySelector('.progress').setAttribute('aria-valuenow',state.solved+1);$('remaining').textContent=6-state.solved;
 for(const p of state.pieces){p.button.classList.toggle('selected',p===state.selected);p.button.classList.toggle('solved',p.solved);p.button.disabled=p.solved||!!state.snapping;p.button.setAttribute('aria-pressed',String(p===state.selected));p.button.querySelector('.card-label').textContent=p.solved?'✓ 복원 완료':'';}updateGuides();
}
function returnPiece(){if(state.snapping)return;cancelDrag();if(!state.selected)return;state.selected.object.visible=false;state.selected.growStart=0;recolor(state.selected,false);state.selected=null;updateUI();say('아래에서 다른 조각을 선택해 주세요.');}
function selectPiece(piece){
 if(!state.ready||piece.solved||state.snapping)return;
 returnPiece();state.selected=piece;piece.object.visible=true;piece.object.scale.setScalar(reducedMotion?1:.5);
 const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);
 piece.object.position.copy(piece.target).addScaledVector(right,width<600?-.68:-1.03).addScaledVector(up,.12);
 piece.growStart=reducedMotion?0:performance.now();recolor(piece,true);updateUI();say('조각을 끌어서 위치를 맞춰 주세요.');stage.focus({preventScroll:true});
}
function finishSnap(p){
 p.object.position.copy(p.target);p.object.scale.setScalar(1);p.solved=true;recolor(p,false);state.solved++;state.selected=null;state.snapping=null;updateUI();
 const material=new THREE.MeshBasicMaterial({color:0xffe2a2,transparent:true,opacity:.8,depthWrite:false});const ring=new THREE.Mesh(new THREE.TorusGeometry(.11,.008,6,44),material);ring.position.copy(p.target);ring.quaternion.copy(camera.quaternion);scene.add(ring);effects.push({object:ring,start:performance.now()});
 say(state.solved===6?'복원 완료! 완성된 토기를 상하좌우로 돌려 보세요.':'조각을 맞췄어요! 다음 조각을 골라 보세요.');if(state.solved===6)$('complete').hidden=false;
}
function trySnap(){
 const p=state.selected;if(!p||state.snapping)return false;
 if(p.object.position.distanceTo(p.target)<.24){p.growStart=0;state.snapping={piece:p,start:performance.now(),from:p.object.position.clone(),scale:p.object.scale.x};updateUI();if(reducedMotion)finishSnap(p);return true;}
 return false;
}
function shuffle(list){for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;}
function reset(){
 state.snapping=null;returnPiece();cancelDrag();state.solved=0;state.angle=.55;state.elevation=.28;state.zoom=1;$('complete').hidden=true;updateCamera();shuffle(state.pieces);tray.replaceChildren();
 state.pieces.forEach((p,i)=>{p.solved=false;p.growStart=0;p.object.visible=false;p.object.position.copy(p.target);p.object.scale.setScalar(1);recolor(p,false);p.slot=i+1;p.button.querySelector('.number').textContent=String(i+1).padStart(2,'0');p.button.setAttribute('aria-label',`조각 ${i+1} 선택`);tray.append(p.button);});updateUI();say('아래에서 조각 하나를 선택해 주세요.');
}

canvas.addEventListener('pointerdown',e=>{
 if(!state.ready||e.button!==0||state.drag||state.snapping)return;pointer(e);const p=state.selected;let moving=false;
 if(p){p.object.updateMatrixWorld(true);moving=ray.intersectObject(p.object,true).length>0;}
 if(moving){camera.getWorldDirection(temp);plane.setFromNormalAndCoplanarPoint(temp,p.target);
  // After orbiting, reproject the center to the target depth without changing its screen position.
  const centerNdc=p.object.position.clone().project(camera);ray.setFromCamera(new THREE.Vector2(centerNdc.x,centerNdc.y),camera);const center=ray.ray.intersectPlane(plane,new THREE.Vector3());pointer(e);const hit=ray.ray.intersectPlane(plane,new THREE.Vector3());if(!center||!hit)return;
  p.object.position.copy(center);state.drag={id:e.pointerId,type:'piece',offset:center.clone().sub(hit)};p.object.scale.setScalar(1);p.growStart=0;}
 else state.drag={id:e.pointerId,type:'orbit',x:e.clientX,y:e.clientY};
 canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');
});
canvas.addEventListener('pointermove',e=>{
 const d=state.drag;if(!d||d.id!==e.pointerId)return;
 if(d.type==='orbit'){state.angle-=(e.clientX-d.x)*.007;state.elevation+=(e.clientY-d.y)*.006;d.x=e.clientX;d.y=e.clientY;updateCamera();}
 else if(state.selected){pointer(e);const hit=ray.ray.intersectPlane(plane,new THREE.Vector3());if(hit){state.selected.object.position.copy(hit.add(d.offset));say('조각을 끌어서 위치를 맞춰 주세요.');}}
});
function endDrag(e){if(!state.drag||state.drag.id!==e.pointerId)return;if(state.drag.type==='piece'&&e.type!=='pointercancel')trySnap();state.drag=null;canvas.classList.remove('dragging');if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}
canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
canvas.addEventListener('wheel',e=>{e.preventDefault();if(state.drag)return;state.zoom=THREE.MathUtils.clamp(state.zoom*Math.exp(-e.deltaY*.001),.65,1.65);updateCamera();},{passive:false});
stage.addEventListener('keydown',e=>{
 if(e.target.tagName==='BUTTON'||state.snapping)return;
 if(e.key==='Escape'){returnPiece();return;}
 if(e.key==='Enter'){trySnap();return;}
 if(e.key==='+'||e.key==='='){state.zoom=Math.min(1.65,state.zoom*1.08);updateCamera();return;}
 if(e.key==='-'){state.zoom=Math.max(.65,state.zoom/1.08);updateCamera();return;}
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();
 if(state.selected){const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1),step=e.shiftKey?.012:.045;state.selected.object.position.addScaledVector(e.key==='ArrowLeft'||e.key==='ArrowRight'?right:up,(e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:1)*step);}
 else{state.angle+=(e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0);state.elevation+=(e.key==='ArrowUp'?.08:e.key==='ArrowDown'?-.08:0);updateCamera();}
});
$('restart').onclick=reset;$('admire').onclick=()=>{$('complete').hidden=true;stage.focus();};

function makeThumbnails(){
 if(!thumbRenderer){thumbRenderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});thumbRenderer.setPixelRatio(1.5);thumbRenderer.outputColorSpace=THREE.SRGBColorSpace;thumbRenderer.toneMapping=THREE.ACESFilmicToneMapping;thumbRenderer.toneMappingExposure=1.25;}
 const card=state.pieces[0]?.button;if(!card?.clientWidth)return;
 // Reserve 34px for the number; CSS raises the remaining image area by 5px.
 const w=card.clientWidth,h=Math.max(1,card.clientHeight-34);thumbRenderer.setSize(w,h,false);
 // Same pixels-per-world-unit as the main camera, at half the assembled scale.
 const pxPerUnit=height/(2*4.1*Math.tan(THREE.MathUtils.degToRad(19.5)));const halfH=h/(2*pxPerUnit);
 const cam=new THREE.OrthographicCamera(-halfH*w/h,halfH*w/h,halfH,-halfH,.01,20);
 const thumbScene=new THREE.Scene();thumbScene.add(new THREE.HemisphereLight(0xe5f2ff,0x5d3e28,2.4));const thumbLight=key.clone();thumbLight.castShadow=false;thumbScene.add(thumbLight,rim.clone());
 for(const p of state.pieces){const obj=p.object.clone(true);obj.position.set(0,0,0);obj.scale.setScalar(.5);obj.visible=true;obj.traverse(m=>{if(m.isMesh){m.material=Array.isArray(m.material)?m.material.map(v=>v.clone()):m.material.clone();const mm=Array.isArray(m.material)?m.material:[m.material];mm.forEach(v=>{v.emissive?.setHex(0);});}});
  thumbScene.add(obj);obj.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(obj),center=box.getCenter(new THREE.Vector3());obj.position.sub(center);
  const radial=new THREE.Vector3(p.target.x,0,p.target.z).normalize();cam.position.set(radial.x*4,2,radial.z*4);cam.lookAt(0,0,0);cam.updateMatrixWorld(true);obj.updateMatrixWorld(true);
  // Center the visible silhouette in camera space, rather than its world-space box.
  const bounds=new THREE.Box3(),point=new THREE.Vector3();
  obj.traverse(mesh=>{if(!mesh.isMesh)return;const positions=mesh.geometry.attributes.position;const matrix=new THREE.Matrix4().multiplyMatrices(cam.matrixWorldInverse,mesh.matrixWorld);for(let i=0;i<positions.count;i++){point.fromBufferAttribute(positions,i).applyMatrix4(matrix);bounds.expandByPoint(point);}});
  const viewCenter=bounds.getCenter(new THREE.Vector3()),viewSize=bounds.getSize(new THREE.Vector3());
  obj.position.addScaledVector(new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0),-viewCenter.x).addScaledVector(new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1),-viewCenter.y);
  // Keep the entire piece inside its card, including on narrow screens.
  const fittedHalfH=Math.max(halfH,viewSize.y*.575,viewSize.x*.575*h/w);
  cam.left=-fittedHalfH*w/h;cam.right=fittedHalfH*w/h;cam.top=fittedHalfH;cam.bottom=-fittedHalfH;cam.updateProjectionMatrix();
  thumbRenderer.render(thumbScene,cam);p.button.querySelector('img').src=thumbRenderer.domElement.toDataURL('image/png');thumbScene.remove(obj);obj.traverse(m=>{if(m.isMesh)(Array.isArray(m.material)?m.material:[m.material]).forEach(v=>v.dispose());});
 }
}

async function load(){try{
 const gltf=await new GLTFLoader().loadAsync('./assets/pottery.glb');
 const objects=gltf.scene.children;if(objects.length!==7)throw new Error('Expected seven pieces');
 for(const object of [...objects]){
  const target=object.position.clone();assembly.add(object);object.traverse(m=>{if(m.isMesh){m.material=Array.isArray(m.material)?m.material.map(v=>v.clone()):m.material.clone();m.castShadow=true;m.receiveShadow=true;}});
  if(object.name==='Pottery_Base')continue;
  const guideMaterial=new THREE.MeshStandardMaterial({color:0xe4f5ed,transparent:true,opacity:.075,roughness:.75,depthWrite:false,side:THREE.FrontSide});
  const guide=object.clone(true);guide.position.copy(target);guide.traverse(m=>{if(m.isMesh){m.material=guideMaterial;m.castShadow=false;m.receiveShadow=false;}});scene.add(guide);
  const edgeMaterial=new THREE.LineBasicMaterial({color:0xffedc1,transparent:true,opacity:.13,depthWrite:false});const edges=[];
  guide.traverse(m=>{if(m.isMesh){const edge=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry,28),edgeMaterial);edge.position.copy(m.position);edge.quaternion.copy(m.quaternion);edges.push(edge);}});edges.forEach(e=>guide.add(e));
  const button=document.createElement('button');button.dataset.piece=object.name;button.className='piece-card';button.innerHTML='<span class="number"></span><img alt=""><span class="card-label"></span>';
  const p={object,target,guide,guideMaterial,edgeMaterial,button,solved:false,slot:0,growStart:0};button.onclick=()=>{if(state.selected===p)returnPiece();else selectPiece(p);};state.pieces.push(p);
 }
 state.ready=true;$('loading').hidden=true;$('restart').disabled=false;reset();makeThumbnails();registerTools();
}catch(e){console.error(e);fail('모델 파일을 읽지 못했어요. 연결을 확인하고 다시 불러와 주세요.');}}

function snapshot(){return {ready:state.ready,total:7,placed:state.solved+1,selectedSlot:state.selected?.slot??null,remainingSlots:state.pieces.filter(p=>!p.solved).map(p=>p.slot),guideCount:state.pieces.filter(p=>p.guide.visible).length,azimuth:state.angle,elevation:state.elevation,zoom:state.zoom,snapping:!!state.snapping,selectedScale:state.selected?.object.scale.x??null};}
function registerTools(){const context=document.modelContext;if(!context?.registerTool)return;const tools=[
 {name:'read_pottery_progress',description:'Read the current pottery restoration progress.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>snapshot()},
 {name:'select_pottery_piece',description:'Select and enlarge an unplaced tray piece; does not place it.',inputSchema:{type:'object',properties:{slot:{type:'integer',minimum:1,maximum:6}},required:['slot'],additionalProperties:false},execute:({slot})=>{const p=state.pieces.find(p=>p.slot===slot);if(!Number.isInteger(slot)||!p||p.solved)throw new Error('Choose an available slot from 1 to 6');selectPiece(p);return snapshot();}}
 ];for(const tool of tools){try{Promise.resolve(context.registerTool(tool)).catch(console.warn);}catch(e){console.warn(e);}}}
// Read-only status is useful to embedding pages; all interactions use the UI above.
window.potteryGame={getState:snapshot};
new ResizeObserver(resize).observe(stage);resize();load();
renderer.setAnimationLoop(()=>{
 const now=performance.now();
 if(state.selected?.growStart){const p=state.selected,t=(now-p.growStart)/760;let scale;
  if(t<.42){const k=Math.max(0,t/.42);scale=.5+.84*(1-(1-k)**3);}else{const k=Math.min(1,(t-.42)/.58);scale=1+.34*(1-k)**3;}
  p.object.scale.setScalar(scale);if(t>=1){p.object.scale.setScalar(1);p.growStart=0;}}
 if(state.snapping){const s=state.snapping,t=Math.min(1,(now-s.start)/340),eased=1-(1-t)**3;s.piece.object.position.lerpVectors(s.from,s.piece.target,eased);s.piece.object.scale.setScalar(THREE.MathUtils.lerp(s.scale,1,eased));if(t===1)finishSnap(s.piece);}
 for(let i=effects.length-1;i>=0;i--){const e=effects[i],t=(now-e.start)/650;e.object.quaternion.copy(camera.quaternion);e.object.scale.setScalar(1+t*4);e.object.material.opacity=Math.max(0,.8*(1-t));if(t>=1){scene.remove(e.object);e.object.geometry.dispose();e.object.material.dispose();effects.splice(i,1);}}
 if(!reducedMotion)meadow.update(now*.001);renderer.render(scene,camera);
});
