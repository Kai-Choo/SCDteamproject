import * as THREE from 'three';
import { CropType } from '../types/game';
import { CROP_CONFIGS } from './cropConfigs';

/**
 * Creates the authentic Korean Bronze Age Semi-Lunar Stone Knife (반달돌칼) 3D Model
 */
export function createStoneKnifeMesh(): THREE.Group {
  const knifeGroup = new THREE.Group();

  // 1. Blade Body (Crescent / Semi-lunar shape)
  // Using ExtrudeGeometry with a curved crescent shape
  const shape = new THREE.Shape();
  const width = 2.4;
  const height = 1.3;

  // Draw semi-lunar contour (flat/gently curved back, curved cutting edge)
  shape.moveTo(-width / 2, 0);
  shape.bezierCurveTo(-width / 2, height * 0.9, width / 2, height * 0.9, width / 2, 0);
  // Bottom cutting blade arc
  shape.bezierCurveTo(width * 0.4, -height * 0.35, -width * 0.4, -height * 0.35, -width / 2, 0);

  // Perforations: 2 drilled holes (유공, 有孔) for the hemp string
  const holeRadius = 0.09;
  const holeSpacing = 0.55;

  const hole1 = new THREE.Path();
  hole1.absarc(-holeSpacing, height * 0.35, holeRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole1);

  const hole2 = new THREE.Path();
  hole2.absarc(holeSpacing, height * 0.35, holeRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole2);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.05,
    bevelSegments: 3,
  };

  const bladeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  bladeGeo.center();

  // Polished slate/shale stone material (마제 점판암 석기)
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x3E444B,
    roughness: 0.45,
    metalness: 0.15,
    flatShading: false,
  });

  const bladeMesh = new THREE.Mesh(bladeGeo, stoneMat);
  bladeMesh.castShadow = true;
  knifeGroup.add(bladeMesh);

  // 2. Chiseled Bevel Cutting Edge Highlight (연마된 날 부분)
  const edgeShape = new THREE.Shape();
  edgeShape.moveTo(-width / 2, 0);
  edgeShape.bezierCurveTo(-width * 0.4, -height * 0.35, width * 0.4, -height * 0.35, width / 2, 0);
  edgeShape.bezierCurveTo(width * 0.35, -height * 0.22, -width * 0.35, -height * 0.22, -width / 2, 0);

  const edgeGeo = new THREE.ExtrudeGeometry(edgeShape, {
    steps: 1,
    depth: 0.02,
    bevelEnabled: false,
  });
  edgeGeo.center();

  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x717A84, // lighter polished ground edge
    roughness: 0.25,
    metalness: 0.35,
  });
  const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
  edgeMesh.position.set(0, -0.06, 0.05);
  knifeGroup.add(edgeMesh);

  // 3. Braided Hemp Cord (삼끈 - threaded through holes)
  const cordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-holeSpacing, height * 0.35 - height * 0.4, -0.08),
    new THREE.Vector3(-holeSpacing, height * 0.35 - height * 0.4, 0.1),
    new THREE.Vector3(0, height * 0.55 - height * 0.4, 0.2),
    new THREE.Vector3(holeSpacing, height * 0.35 - height * 0.4, 0.1),
    new THREE.Vector3(holeSpacing, height * 0.35 - height * 0.4, -0.08),
    new THREE.Vector3(0, height * 0.25 - height * 0.4, -0.15),
    new THREE.Vector3(-holeSpacing, height * 0.35 - height * 0.4, -0.08),
  ]);

  const cordGeo = new THREE.TubeGeometry(cordCurve, 32, 0.045, 8, true);
  const cordMat = new THREE.MeshStandardMaterial({
    color: 0xBA9F76, // Natural hemp fiber color
    roughness: 0.9,
    metalness: 0.05,
  });
  const cordMesh = new THREE.Mesh(cordGeo, cordMat);
  knifeGroup.add(cordMesh);

  // Add subtle finger loop knot
  const knotGeo = new THREE.TorusGeometry(0.12, 0.04, 8, 16);
  const knotMesh = new THREE.Mesh(knotGeo, cordMat);
  knotMesh.position.set(0, height * 0.58 - height * 0.4, 0.22);
  knifeGroup.add(knotMesh);

  knifeGroup.scale.set(0.9, 0.9, 0.9);
  return knifeGroup;
}

/**
 * Creates 3D procedural crop mesh depending on crop type
 */
export function createCropMesh(type: CropType): THREE.Group {
  const config = CROP_CONFIGS[type];
  const group = new THREE.Group();

  switch (type) {
    case 'rice': {
      // Golden Rice Ear (벼이삭)
      // Curved stem
      const stemCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, -1.4, 0),
        new THREE.Vector3(0.2, 0.1, 0),
        new THREE.Vector3(0.8, 1.2, 0)
      );
      const stemGeo = new THREE.TubeGeometry(stemCurve, 16, 0.04, 6, false);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x937C34, roughness: 0.7 });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      group.add(stemMesh);

      // Plump rice kernels (낟알들)
      const grainGeo = new THREE.SphereGeometry(0.14, 8, 8);
      grainGeo.scale(1.4, 0.7, 0.7);

      const grainMat = new THREE.MeshStandardMaterial({
        color: config.baseColor,
        roughness: 0.35,
        metalness: 0.1,
      });

      // Distribute grains along the drooping stem
      const grainCount = 18;
      for (let i = 0; i < grainCount; i++) {
        const t = 0.2 + (i / grainCount) * 0.75;
        const pt = stemCurve.getPoint(t);
        const mesh = new THREE.Mesh(grainGeo, grainMat);
        const side = i % 2 === 0 ? 1 : -1;
        mesh.position.set(pt.x + side * (0.12 + Math.random() * 0.05), pt.y + (Math.random() * 0.08 - 0.04), (Math.random() - 0.5) * 0.15);
        mesh.rotation.z = (Math.PI / 4) * side + (Math.random() - 0.5) * 0.3;
        mesh.rotation.y = (Math.random() - 0.5) * 0.5;
        mesh.castShadow = true;
        group.add(mesh);
      }
      break;
    }

    case 'barley': {
      // Barley Ear (보리이삭 with long awns/까락)
      const stemCurve = new THREE.LineCurve3(
        new THREE.Vector3(0, -1.3, 0),
        new THREE.Vector3(0, 1.2, 0)
      );
      const stemGeo = new THREE.TubeGeometry(stemCurve, 8, 0.045, 6, false);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x7E7643, roughness: 0.7 });
      group.add(new THREE.Mesh(stemGeo, stemMat));

      const grainGeo = new THREE.ConeGeometry(0.12, 0.32, 6);
      const grainMat = new THREE.MeshStandardMaterial({ color: config.baseColor, roughness: 0.45 });
      const awnMat = new THREE.LineBasicMaterial({ color: 0xA3965E, linewidth: 2 });

      // Rows of barley grains with long awn spikes
      const rows = 10;
      for (let r = 0; r < rows; r++) {
        const y = -0.5 + (r / rows) * 1.5;
        [-1, 1].forEach((side) => {
          const gMesh = new THREE.Mesh(grainGeo, grainMat);
          gMesh.position.set(side * 0.12, y, 0);
          gMesh.rotation.z = side * -0.4;
          group.add(gMesh);

          // Long awn bristle (까락)
          const awnPoints = [
            new THREE.Vector3(side * 0.12, y + 0.15, 0),
            new THREE.Vector3(side * 0.45, y + 0.7, (Math.random() - 0.5) * 0.1),
          ];
          const awnGeo = new THREE.BufferGeometry().setFromPoints(awnPoints);
          const awnLine = new THREE.Line(awnGeo, awnMat);
          group.add(awnLine);
        });
      }
      break;
    }

    case 'millet': {
      // Foxtail Millet (조/기장) - Dense fuzzy cluster of hundreds of golden spherical beads
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.4, 6);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x8C742A, roughness: 0.8 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = -0.2;
      group.add(stem);

      const clusterMat = new THREE.MeshStandardMaterial({
        color: config.baseColor,
        roughness: 0.5,
      });

      // Cluster beads
      const beadGeo = new THREE.SphereGeometry(0.11, 6, 6);
      const beadCount = 36;
      for (let i = 0; i < beadCount; i++) {
        const t = (i / beadCount) * 1.5; // -0.4 to 1.1
        const y = -0.4 + t;
        const radius = Math.sin((i / beadCount) * Math.PI) * 0.28 + 0.12;
        const angle = i * 2.4;
        const bead = new THREE.Mesh(beadGeo, clusterMat);
        bead.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        group.add(bead);
      }
      break;
    }

    case 'sorghum': {
      // Red Sorghum (수수) - Branching bunch of red/amber spherical grains
      const stemGeo = new THREE.CylinderGeometry(0.05, 0.06, 2.2, 6);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x5C3A21, roughness: 0.8 });
      group.add(new THREE.Mesh(stemGeo, stemMat));

      const grainMat = new THREE.MeshStandardMaterial({
        color: config.baseColor,
        roughness: 0.4,
        metalness: 0.1,
      });
      const seedGeo = new THREE.SphereGeometry(0.13, 7, 7);

      const branchCount = 28;
      for (let i = 0; i < branchCount; i++) {
        const y = -0.3 + (i / branchCount) * 1.4;
        const angle = (i * 1.8);
        const dist = 0.2 + (Math.sin((i / branchCount) * Math.PI) * 0.26);
        const seed = new THREE.Mesh(seedGeo, grainMat);
        seed.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist);
        group.add(seed);
      }
      break;
    }

    case 'golden_sheaf': {
      // Special: Golden Sheaf of Rice (풍년의 황금 볏단)
      const sheafMat = new THREE.MeshStandardMaterial({
        color: 0xFFDE59,
        emissive: 0x553C00,
        roughness: 0.2,
        metalness: 0.4,
      });

      // Bundle of stalks
      for (let i = 0; i < 7; i++) {
        const stalkGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.2, 6);
        const stalk = new THREE.Mesh(stalkGeo, sheafMat);
        const angle = (i / 7) * Math.PI * 2;
        stalk.position.set(Math.cos(angle) * 0.12, 0, Math.sin(angle) * 0.12);
        stalk.rotation.z = Math.sin(angle) * 0.15;
        stalk.rotation.x = Math.cos(angle) * 0.15;
        group.add(stalk);
      }

      // Bound cord around sheaf
      const ringGeo = new THREE.TorusGeometry(0.18, 0.05, 8, 16);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xC2821B, roughness: 0.6 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      // Golden particle sparkle halo
      const haloGeo = new THREE.OctahedronGeometry(0.55, 1);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xFFFBEB,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      group.add(new THREE.Mesh(haloGeo, haloMat));
      break;
    }

    case 'frost_ear': {
      // Frost-covered grain (서리 맺힌 이삭)
      const frostMat = new THREE.MeshStandardMaterial({
        color: 0x67E8F9,
        emissive: 0x0891B2,
        roughness: 0.1,
        metalness: 0.5,
        transparent: true,
        opacity: 0.85,
      });
      const iceStemGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.0, 6);
      group.add(new THREE.Mesh(iceStemGeo, frostMat));

      const crystalGeo = new THREE.DodecahedronGeometry(0.13, 0);
      for (let i = 0; i < 20; i++) {
        const crystal = new THREE.Mesh(crystalGeo, frostMat);
        const y = -0.6 + (i / 20) * 1.5;
        const angle = i * 2.3;
        crystal.position.set(Math.cos(angle) * 0.22, y, Math.sin(angle) * 0.22);
        crystal.rotation.set(Math.random(), Math.random(), Math.random());
        group.add(crystal);
      }
      break;
    }

    case 'stone': {
      // Rough Slate Stone / Hazard (잡석)
      const stoneGeo = new THREE.DodecahedronGeometry(0.7, 1);
      // Deform vertices for natural rock shape
      const posAttr = stoneGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        const vz = posAttr.getZ(i);
        const noise = (Math.sin(vx * 5) + Math.cos(vy * 5) + Math.sin(vz * 5)) * 0.08;
        posAttr.setXYZ(i, vx + noise, vy + noise, vz + noise);
      }
      stoneGeo.computeVertexNormals();

      const rockMat = new THREE.MeshStandardMaterial({
        color: 0x64748B,
        roughness: 0.85,
        metalness: 0.1,
        flatShading: true,
      });
      const rockMesh = new THREE.Mesh(stoneGeo, rockMat);
      group.add(rockMesh);
      break;
    }

    case 'pest': {
      // Pest Locust / Bomb Hazard (병충해 메뚜기)
      const pestGroup = new THREE.Group();
      
      // Insect thorax & abdomen
      const bodyGeo = new THREE.CapsuleGeometry(0.24, 0.6, 6, 8);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x365314, // dark pest green
        roughness: 0.5,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.z = Math.PI / 4;
      pestGroup.add(body);

      // Insect head & glowing red eyes (danger signal!)
      const headGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0.35, 0.35, 0);
      pestGroup.add(head);

      const eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
      const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
      eye1.position.set(0.45, 0.45, 0.12);
      const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
      eye2.position.set(0.45, 0.45, -0.12);
      pestGroup.add(eye1);
      pestGroup.add(eye2);

      // Insect wings
      const wingGeo = new THREE.BoxGeometry(0.8, 0.02, 0.3);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x84CC16,
        transparent: true,
        opacity: 0.6,
        roughness: 0.3,
      });
      const wing = new THREE.Mesh(wingGeo, wingMat);
      wing.position.set(-0.1, 0.1, 0);
      pestGroup.add(wing);

      // Warning pulsating aura
      const auraGeo = new THREE.RingGeometry(0.65, 0.75, 16);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xEF4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      pestGroup.add(aura);

      group.add(pestGroup);
      break;
    }
  }

  // Adjust scale and ensure shadows
  group.scale.set(0.85, 0.85, 0.85);
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return group;
}

/**
 * Creates split half meshes for a sliced crop (top half and bottom half)
 */
export function createSplitCropMeshes(type: CropType): { top: THREE.Group; bottom: THREE.Group } {
  const topGroup = new THREE.Group();
  const bottomGroup = new THREE.Group();
  const config = CROP_CONFIGS[type];

  // Base materials
  const mainMat = new THREE.MeshStandardMaterial({
    color: config.baseColor,
    roughness: 0.4,
  });
  const cutSurfaceMat = new THREE.MeshStandardMaterial({
    color: 0xFFFBEB, // Fresh pale crop flesh/stalk cut
    roughness: 0.3,
    metalness: 0.1,
  });

  if (type === 'stone') {
    // Split rock
    const rockGeo = new THREE.DodecahedronGeometry(0.6, 0);
    const m1 = new THREE.Mesh(rockGeo, mainMat);
    m1.scale.set(1, 0.5, 1);
    topGroup.add(m1);

    const m2 = new THREE.Mesh(rockGeo, mainMat);
    m2.scale.set(1, 0.5, 1);
    bottomGroup.add(m2);
  } else if (type === 'pest') {
    // Sliced insect
    const halfGeo = new THREE.SphereGeometry(0.35, 8, 8);
    topGroup.add(new THREE.Mesh(halfGeo, mainMat));
    bottomGroup.add(new THREE.Mesh(halfGeo, mainMat));
  } else {
    // Sliced grain ear
    // Top portion (drooping tip with golden kernels)
    const topStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.9, 6), mainMat);
    topStalk.position.y = 0.45;
    topGroup.add(topStalk);

    for (let i = 0; i < 8; i++) {
      const g = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), mainMat);
      g.position.set((Math.random() - 0.5) * 0.3, 0.2 + (i / 8) * 0.7, (Math.random() - 0.5) * 0.2);
      topGroup.add(g);
    }
    // Cut cap on bottom of top half
    const cutCap1 = new THREE.Mesh(new THREE.CircleGeometry(0.09, 8), cutSurfaceMat);
    cutCap1.rotation.x = Math.PI / 2;
    topGroup.add(cutCap1);

    // Bottom portion (stalk with lower grains)
    const botStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.9, 6), mainMat);
    botStalk.position.y = -0.45;
    bottomGroup.add(botStalk);

    for (let i = 0; i < 6; i++) {
      const g = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), mainMat);
      g.position.set((Math.random() - 0.5) * 0.25, -0.7 + (i / 6) * 0.5, (Math.random() - 0.5) * 0.2);
      bottomGroup.add(g);
    }
    // Cut cap on top of bottom half
    const cutCap2 = new THREE.Mesh(new THREE.CircleGeometry(0.09, 8), cutSurfaceMat);
    cutCap2.rotation.x = -Math.PI / 2;
    bottomGroup.add(cutCap2);
  }

  return { top: topGroup, bottom: bottomGroup };
}

/**
 * Creates 3D burst grain particles (쌀알/보리 낱알들이 사방으로 튀어나감)
 */
export function createGrainBurstParticles(type: CropType, count: number = 24): {
  mesh: THREE.InstancedMesh;
  velocities: THREE.Vector3[];
  rotations: THREE.Vector3[];
} {
  const config = CROP_CONFIGS[type];
  const geo = new THREE.SphereGeometry(0.07, 6, 6);
  geo.scale(1.4, 0.8, 0.8);

  const mat = new THREE.MeshStandardMaterial({
    color: config.baseColor,
    roughness: 0.35,
    metalness: 0.1,
  });

  const instMesh = new THREE.InstancedMesh(geo, mat, count);
  const velocities: THREE.Vector3[] = [];
  const rotations: THREE.Vector3[] = [];
  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    dummy.position.set(0, 0, 0);
    dummy.updateMatrix();
    instMesh.setMatrixAt(i, dummy.matrix);

    // Random burst velocity in 3D
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.5 + Math.random() * 4.5;
    const upward = 1.5 + Math.random() * 4.0;
    const zSpeed = (Math.random() - 0.5) * 3.0;

    velocities.push(new THREE.Vector3(Math.cos(angle) * speed, upward, Math.sin(angle) * speed + zSpeed));
    rotations.push(new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10));
  }

  instMesh.instanceMatrix.needsUpdate = true;
  return { mesh: instMesh, velocities, rotations };
}
