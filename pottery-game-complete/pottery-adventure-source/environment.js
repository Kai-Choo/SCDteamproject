import * as THREE from 'three';
export function createMeadow(scene){
 scene.background=new THREE.Color(0xb9d8de);scene.fog=new THREE.Fog(0xb9d8de,16,55);
 let seed=741;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const elevation=(x,z)=>-.12+Math.max(0,Math.min(1,(Math.hypot(x,z)-2)/5))*(.35*Math.sin(x*.23)*Math.cos(z*.3)+.18*Math.sin(z*.6));
 const geo=new THREE.PlaneGeometry(120,120,100,100);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position,colors=[],color=new THREE.Color();
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,elevation(x,z));color.set(Math.hypot(x,z)<1.65?0x8a7750:0x647847).multiplyScalar(.82+rnd()*.28);colors.push(color.r,color.g,color.b);}
 geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const ground=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));ground.receiveShadow=true;scene.add(ground);
 const verts=[],col=[];
 for(let i=0;i<21000;i++){const a=rnd()*Math.PI*2,r=1.7+Math.sqrt(rnd())*32,x=Math.cos(a)*r,z=Math.sin(a)*r,y=elevation(x,z),h=.10+rnd()*.32,w=.018+rnd()*.025,b=rnd()*Math.PI,dx=Math.cos(b)*w,dz=Math.sin(b)*w;verts.push(x-dx,y,z-dz,x+dx,y,z+dz,x+(rnd()-.5)*.14,y+h,z+.025);color.setHSL(.20+rnd()*.07,.3+rnd()*.2,.2+rnd()*.16);for(let k=0;k<3;k++){const v=k===2?1.35:.82;col.push(color.r*v,color.g*v,color.b*v);}}
 const blades=new THREE.BufferGeometry();blades.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));blades.setAttribute('color',new THREE.Float32BufferAttribute(col,3));blades.computeVertexNormals();const grassMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});
 grassMat.onBeforeCompile=s=>{s.uniforms.meadowTime={value:0};grassMat.userData.shader=s;s.vertexShader='uniform float meadowTime;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x += sin(position.x * 2.0 + position.z + meadowTime) * 0.016 * max(0.0, position.y + 0.12);');};
 const grass=new THREE.Mesh(blades,grassMat);grass.receiveShadow=true;scene.add(grass);
 const rockGeo=new THREE.IcosahedronGeometry(1,1),rockMat=new THREE.MeshStandardMaterial({color:0x788078,roughness:1,flatShading:true});
 for(let i=0;i<33;i++){const a=rnd()*Math.PI*2,r=2.8+rnd()*18,rock=new THREE.Mesh(rockGeo,rockMat);rock.position.set(Math.cos(a)*r,0,Math.sin(a)*r);rock.position.y=elevation(rock.position.x,rock.position.z);const s=.12+rnd()*.4;rock.scale.set(s*1.6,s*.8,s);rock.rotation.set(rnd(),rnd()*6,rnd());rock.castShadow=true;rock.receiveShadow=true;scene.add(rock);}
 const bark=new THREE.MeshStandardMaterial({color:0x66533c,roughness:1}),leaves=new THREE.MeshStandardMaterial({color:0x466747,roughness:1,flatShading:true}),trunkGeo=new THREE.CylinderGeometry(.09,.17,1,7),leafGeo=new THREE.IcosahedronGeometry(1,1);
 for(let i=0;i<40;i++){const a=i/40*Math.PI*2+rnd()*.1,r=11+rnd()*16,x=Math.cos(a)*r,z=Math.sin(a)*r,y=elevation(x,z),h=2.3+rnd()*3;const trunk=new THREE.Mesh(trunkGeo,bark);trunk.position.set(x,y+h*.5,z);trunk.scale.y=h;trunk.castShadow=true;scene.add(trunk);for(let j=0;j<3;j++){const crown=new THREE.Mesh(leafGeo,leaves);crown.position.set(x+(rnd()-.5)*1.2,y+h-.1+j*.2,z+(rnd()-.5)*1.2);crown.scale.set(1+rnd()*.7,1.1+rnd()*.7,1+rnd()*.7);crown.rotation.y=rnd()*6;crown.castShadow=true;scene.add(crown);}}
 const hillMat=new THREE.MeshStandardMaterial({color:0x819a86,roughness:1,flatShading:true});for(let i=0;i<15;i++){const a=i/15*Math.PI*2,r=39+rnd()*8,hill=new THREE.Mesh(rockGeo,hillMat);hill.position.set(Math.cos(a)*r,-1,Math.sin(a)*r);hill.scale.set(9+rnd()*9,3+rnd()*5,8+rnd()*8);scene.add(hill);}
 const stone=new THREE.Mesh(new THREE.CylinderGeometry(1.04,1.1,.12,15),new THREE.MeshStandardMaterial({color:0x9b927a,roughness:1,flatShading:true}));stone.position.y=-.065;stone.castShadow=true;stone.receiveShadow=true;scene.add(stone);
 return {update(t){if(grassMat.userData.shader)grassMat.userData.shader.uniforms.meadowTime.value=t;}};
}
