import * as THREE from 'three'

export class Environment {
  constructor(experience) {
    this.experience = experience
    this.scene = experience.scene
    this.createSky()
    this.createLights()
    this.createGround()
    this.createOcean()
    this.scene.fog = new THREE.FogExp2('#D4A574', 0.012)
  }

  createSky() {
    const skyGeo = new THREE.SphereGeometry(100, 32, 32)
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color('#5B4A6E') },
        midColor: { value: new THREE.Color('#E8926A') },
        bottomColor: { value: new THREE.Color('#FFD89B') }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPosition = wp.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 topColor; uniform vec3 midColor; uniform vec3 bottomColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + 20.0).y;
          float t = max(pow(max(h, 0.0), 0.5), 0.0);
          vec3 c = t < 0.5 ? mix(bottomColor, midColor, t*2.0) : mix(midColor, topColor, (t-0.5)*2.0);
          gl_FragColor = vec4(c, 1.0);
        }`
    })
    this.scene.add(new THREE.Mesh(skyGeo, skyMat))

    // Sun disc
    const sunMat = new THREE.MeshBasicMaterial({ color: '#FFE4B5', transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    const sun = new THREE.Mesh(new THREE.CircleGeometry(4, 32), sunMat)
    sun.position.set(-30, 8, -80)
    sun.lookAt(0, 8, 0)
    this.scene.add(sun)
  }

  createLights() {
    this.scene.add(new THREE.AmbientLight('#FFF0D4', 0.5))
    const key = new THREE.DirectionalLight('#FFD89B', 1.2)
    key.position.set(-15, 12, 8)
    key.castShadow = this.experience.performanceTier !== 'LOW'
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 1; key.shadow.camera.far = 50
    key.shadow.camera.left = -15; key.shadow.camera.right = 15
    key.shadow.camera.top = 15; key.shadow.camera.bottom = -5
    key.shadow.normalBias = 0.05
    this.scene.add(key)
    const fill = new THREE.DirectionalLight('#FFB88C', 0.4)
    fill.position.set(10, 6, -5)
    this.scene.add(fill)
    this.scene.add(new THREE.HemisphereLight('#E8926A', '#C4956A', 0.3))
  }

  createGround() {
    const geo = new THREE.PlaneGeometry(120, 120, 80, 80)
    const pos = geo.getAttribute('position')
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i)
      const dist = Math.sqrt(x*x + y*y)
      let z = Math.sin(x*0.15+1)*0.6 + Math.sin(y*0.12+2)*0.4 + Math.sin(x*0.3+y*0.2)*0.2
      if (dist < 8) z *= (dist/8)*(dist/8)
      if (dist > 40) z -= (dist-40)*0.08
      pos.setZ(i, z)
    }
    geo.computeVertexNormals()
    const mat = new THREE.MeshStandardMaterial({ color: '#E8CFA8', roughness: 0.95, flatShading: true })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = -Math.PI*0.5; mesh.position.y = -0.5; mesh.receiveShadow = true
    this.scene.add(mesh)
  }

  createOcean() {
    this.oceanGeo = new THREE.PlaneGeometry(120, 60, 64, 32)
    const mat = new THREE.MeshStandardMaterial({ color: '#4BA8A8', roughness: 0.3, transparent: true, opacity: 0.85, flatShading: true })
    this.ocean = new THREE.Mesh(this.oceanGeo, mat)
    this.ocean.rotation.x = -Math.PI*0.5; this.ocean.position.set(0, -0.8, -45)
    this.scene.add(this.ocean)
  }

  update(t) {
    if (!this.ocean) return
    const pos = this.oceanGeo.getAttribute('position')
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i)
      pos.setZ(i, Math.sin(x*0.3+t*0.8)*0.15 + Math.sin(y*0.5+t*1.2)*0.1)
    }
    pos.needsUpdate = true
    this.oceanGeo.computeVertexNormals()
  }
}
