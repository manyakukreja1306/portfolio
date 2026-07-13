import * as THREE from 'three'
import { aboutMeData } from '../../sections/AboutMe.js'
import { projectsData } from '../../sections/Projects.js'
import { experienceData } from '../../sections/Experience.js'
import { skillsData } from '../../sections/Skills.js'
import { contactData } from '../../sections/Contact.js'
import gsap from 'gsap'

export class SurfShop {
  constructor(experience) {
    this.experience = experience
    this.scene = experience.scene
    this.group = new THREE.Group()
    this.buildShack()
    this.buildRoof()
    this.buildSigns()
    this.buildTable()
    this.buildPlant()
    this.group.position.set(0, -0.5, 0)
    this.scene.add(this.group)
    
    this.boards = {}
    this._ghButtons = {}
    this._activeSection = null

    // Async load boards to ensure fonts are ready
    this.buildSurfboardsAsync()

    // GitHub button click detection
    this._setupGithubClickListener()
  }

  _setupGithubClickListener() {
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const getHitBtn = (e) => {
      if (!this._activeSection || !this._ghButtons[this._activeSection]) return null

      const canvas = this.experience.renderer?.instance?.domElement
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()

      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      const camera = this.experience.camera?.instance
      if (!camera) return null
      raycaster.setFromCamera(mouse, camera)

      const board = this.boards[this._activeSection]
      if (!board || !board.userData.decal) return null

      const hits = raycaster.intersectObject(board.userData.decal)
      if (!hits.length) return null

      const uv = hits[0].uv
      if (!uv) return null

      const canvasU = uv.x
      const canvasV = 1 - uv.y   // canvas y=0 is top; uv y=0 is bottom

      for (const btn of this._ghButtons[this._activeSection]) {
        if (canvasU >= btn.x0 && canvasU <= btn.x1 && canvasV >= btn.y0 && canvasV <= btn.y1) {
          return btn
        }
      }
      return null
    }

    window.addEventListener('mousemove', (e) => {
      const btn = getHitBtn(e)
      document.body.style.cursor = btn ? 'pointer' : ''
    })

    window.addEventListener('click', (e) => {
      const btn = getHitBtn(e)
      if (btn) window.open(btn.url, '_blank')
    })
  }

  mat(color, opts = {}) {
    const r = opts.r || 0.8;
    const m = opts.m || 0;
    const cleanOpts = { ...opts };
    delete cleanOpts.r;
    delete cleanOpts.m;
    return new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m, flatShading: true, ...cleanOpts })
  }

  buildShack() {
    const body = new THREE.Mesh(new THREE.BoxGeometry(5, 3.75, 4), this.mat('#B8864E'))
    body.position.set(0, 1.875, 0)
    body.castShadow = true; body.receiveShadow = true
    this.group.add(body)

    const front = new THREE.Mesh(new THREE.BoxGeometry(5.05, 3.75, 0.05), this.mat('#C4956A'))
    front.position.set(0, 1.875, 2.025)
    this.group.add(front)

    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.1), this.mat('#4A3520'))
    door.position.set(0.8, 1.1, 2.08)
    this.group.add(door)

    const win = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.08), this.mat('#87CEEB', { r: 0.2, m: 0.1 }))
    win.position.set(-1.2, 2.2, 2.08)
    this.group.add(win)
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.95, 0.06), this.mat('#5C4A1E'))
    winFrame.position.set(-1.2, 2.2, 2.06)
    this.group.add(winFrame)

    for (let i = 0; i < 6; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 4.1), this.mat('#A07840'))
      plank.position.set(2.525, 0.5 + i * 0.6, 0)
      this.group.add(plank)
      const plank2 = plank.clone()
      plank2.position.x = -2.525
      this.group.add(plank2)
    }
  }

  buildRoof() {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.15, 5), this.mat('#7A8B9A', { r: 0.4, m: 0.3 }))
    roof.position.set(0, 3.6, -0.2)
    roof.rotation.x = -0.08
    roof.castShadow = true
    this.group.add(roof)

    const support1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8), this.mat('#5C4A1E'))
    support1.position.set(-2.3, 3.35, 2.05)
    support1.rotation.z = 0.0
    this.group.add(support1)
    const support2 = support1.clone()
    support2.position.x = 2.3
    support2.rotation.z = 0.0
    this.group.add(support2)

    const ridge = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.08, 0.3), this.mat('#6A7B8A', { r: 0.4, m: 0.3 }))
    ridge.position.set(0, 3.7, -0.2)
    this.group.add(ridge)
  }

  buildSigns() {
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.8, 0.15), this.mat('#F5F0E0'))
    signBoard.position.set(0, 4.2, 0.3)
    this.group.add(signBoard)

    const border = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.95, 0.1), this.mat('#4A6B8A'))
    border.position.set(0, 4.2, 0.25)
    this.group.add(border)

    this.addCanvasText('SURF SHOP', 3.3, 0.6, signBoard.position.clone().add(new THREE.Vector3(0, 0, 0.08)), {
      font: '60px "Permanent Marker", sans-serif', color: '#2C3E50', bg: 'transparent'
    })

    const ovalGeo = new THREE.CircleGeometry(0.9, 32)
    ovalGeo.scale(1.4, 1, 1)
    const oval = new THREE.Mesh(ovalGeo, this.mat('#E8D5B8'))
    oval.position.set(0, 2.8, 2.1)
    this.group.add(oval)

    const ringGeo = new THREE.RingGeometry(0.85, 0.95, 32)
    ringGeo.scale(1.4, 1, 1)
    const ring = new THREE.Mesh(ringGeo, this.mat('#5BBFBF'))
    ring.position.set(0, 2.8, 2.11)
    this.group.add(ring)

    this.addCanvasText("Manya's\nSurf Shack", 2.2, 1.2, new THREE.Vector3(0, 2.8, 2.12), {
      font: '44px "Permanent Marker", sans-serif', color: '#2C3E50', bg: 'transparent', lineHeight: 50
    })
  }

  getSurfboardShape() {
    const shape = new THREE.Shape()
    shape.moveTo(0, -1.5)
    shape.bezierCurveTo(0.25, -1.4, 0.3, -0.5, 0.28, 0)
    shape.bezierCurveTo(0.26, 0.5, 0.2, 1.2, 0, 1.5)
    shape.bezierCurveTo(-0.2, 1.2, -0.26, 0.5, -0.28, 0)
    shape.bezierCurveTo(-0.3, -0.5, -0.25, -1.4, 0, -1.5)
    return shape
  }

  async buildSurfboardsAsync() {
    await document.fonts.ready

    // 5 boards, exact colors to match signpost
    const colors = ['#F2C94C', '#F2994A', '#5BBFBF', '#EB5757', '#2D9CDB']
    const rackPos = new THREE.Vector3(0, 0, 2.5)

    const rackBar = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.08, 0.08), this.mat('#8B6914'))
    rackBar.position.set(rackPos.x, 1.8, rackPos.z + 0.8)
    this.group.add(rackBar)
    const rackBar2 = rackBar.clone()
    rackBar2.position.y = 0.5
    this.group.add(rackBar2)

    const shape = this.getSurfboardShape()
    const extrudeSettings = { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }
    const boardGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    
    // Create decal geometry for fading text in/out, matching the exact shape so it clips properly!
    const decalGeo = new THREE.ShapeGeometry(shape)
    const pos = decalGeo.attributes.position
    const uvs = []
    for(let i=0; i<pos.count; i++) {
       uvs.push((pos.getX(i) + 0.3) / 0.6, (pos.getY(i) + 1.5) / 3.0)
    }
    decalGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

    const sections = [aboutMeData, projectsData, experienceData, skillsData, contactData]
    const sectionNames = ['about', 'projects', 'experience', 'skills', 'contact']

    for (let i = 0; i < 5; i++) {
      // Solid board
      const board = new THREE.Mesh(boardGeo, this.mat(colors[i]))
      
      const x = -1.8 + i * 0.5
      board.position.set(rackPos.x + x, 0, rackPos.z + 0.6)
      board.rotation.x = -0.15
      board.rotation.z = (Math.random() - 0.5) * 0.04
      board.castShadow = true
      this.group.add(board)

      // Text Decal
      const tex = this.createBoardTexture(sections[i], 'transparent')
      const decalMat = new THREE.MeshBasicMaterial({ 
        map: tex, 
        transparent: true, 
        opacity: 0,
        depthWrite: false 
      })
      const decal = new THREE.Mesh(decalGeo, decalMat)
      // Extrude front face is at Z = depth (0.06) + bevelThickness (0.02) = 0.08. 
      // Place decal at 0.082 so it sits perfectly on the surface!
      decal.position.set(0, 0, 0.082) 
      board.add(decal)

      // Store original transforms and references
      board.userData.originalPos = board.position.clone()
      board.userData.originalRot = new THREE.Vector3(board.rotation.x, board.rotation.y, board.rotation.z)
      board.userData.decal = decal
      this.boards[sectionNames[i]] = board

      // Add 3D back button to each board
      this.addBackButtonToBoard(board, sectionNames[i], colors[i])
    }
  }

  launchBoard(sectionName) {
    const board = this.boards[sectionName]
    if (!board) return

    this._activeSection = sectionName

    // Launch it up and forward to display position
    // y: 3.0 compensates for the SurfShop group being at y=-0.5 so world position = 2.5
    gsap.to(board.position, {
      duration: 3.0,
      ease: 'power2.inOut',
      x: 0,
      y: 3.0,
      z: 6
    })

    gsap.to(board.rotation, {
      duration: 3.0,
      ease: 'power2.inOut',
      x: 0,
      y: 0,
      z: 0
    })

    if (board.userData.decal) {
      gsap.to(board.userData.decal.material, {
        duration: 1.5,
        delay: 1.0,
        opacity: 1,
        ease: 'power2.out'
      })
    }
    
    if (board.userData.backBtnMat) {
      gsap.to(board.userData.backBtnMat, {
        duration: 1.5,
        delay: 1.0,
        opacity: 1,
        ease: 'power2.out'
      })
    }
  }

  returnBoard(sectionName) {
    const board = this.boards[sectionName]
    if (!board) return

    this._activeSection = null

    // Return to original rack position
    gsap.to(board.position, {
      duration: 3.0,
      ease: 'power2.inOut',
      x: board.userData.originalPos.x,
      y: board.userData.originalPos.y,
      z: board.userData.originalPos.z
    })

    gsap.to(board.rotation, {
      duration: 3.0,
      ease: 'power2.inOut',
      x: board.userData.originalRot.x,
      y: board.userData.originalRot.y,
      z: board.userData.originalRot.z
    })

    if (board.userData.decal) {
      gsap.to(board.userData.decal.material, {
        duration: 1.0,
        opacity: 0,
        ease: 'power2.inOut'
      })
    }
    
    if (board.userData.backBtnMat) {
      gsap.to(board.userData.backBtnMat, {
        duration: 1.0,
        opacity: 0,
        ease: 'power2.inOut'
      })
    }

    if (board.userData.decal) {
      gsap.to(board.userData.decal.material, {
        duration: 1.0,
        opacity: 0,
        ease: 'power2.inOut'
      })
    }
  }

  addBackButtonToBoard(boardGroup, sectionName, boardColor) {
    const w = 0.2; const h = 0.06
    const backBtnGeo = new THREE.PlaneGeometry(w, h)
    
    // Create texture for back button
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 256, 64) 
    
    // Try to match the exact font and style from the image
    ctx.font = 'bold 38px "Times New Roman", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    const text = 'BACK'
    const x = 128
    const y = 32

    // 1. Drop shadow (bottom-right)
    ctx.fillStyle = '#000000'
    ctx.fillText(text, x + 3, y + 3)

    // 2. Black outline
    ctx.lineWidth = 1.5
    ctx.strokeStyle = '#000000'
    ctx.strokeText(text, x, y)
    
    // 3. Dynamic inner fill matching board color
    ctx.fillStyle = boardColor || '#F5C642'
    ctx.fillText(text, x, y)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    const backBtnMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true })

    const backBtn = new THREE.Mesh(backBtnGeo, backBtnMat)
    // Position it at the bottom middle of the visible area
    backBtn.position.set(0, -0.32, 0.083)
    
    // We can also create a slightly larger invisible hitbox so it's easy to click
    const hitbox = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.1), new THREE.MeshBasicMaterial({ visible: false }))
    hitbox.position.copy(backBtn.position)
    
    // The button should fade in just like the decal text
    backBtn.material.opacity = 0
    boardGroup.add(backBtn)
    boardGroup.add(hitbox)
    
    // Save reference for fading
    boardGroup.userData.backBtnMat = backBtn.material

    // Register with raycaster
    this.experience.raycaster.register(hitbox, `back_${sectionName}`, {
      onClick: () => this.experience.navigateToHome(),
      onHover: () => {
        document.body.style.cursor = 'pointer'
        // Add a hover effect by tinting it slightly brighter
        backBtnMat.color.set('#FFFFDD')
      },
      onUnhover: () => {
        document.body.style.cursor = 'default'
        backBtnMat.color.set('#FFFFFF') 
      }
    })
  }


  drawAboutMeBoard(ctx, w, h, data, tex) {
    const marginX = 100
    const bodyFont = '22px Outfit, sans-serif'
    const boldFont = 'bold 22px Outfit, sans-serif'
    const italicFont = 'italic 22px Outfit, sans-serif'

    const drawAsyncImg = (url, x, y, width, height) => {
      const img = new window.Image()
      img.src = url
      img.onload = () => {
        ctx.drawImage(img, x, y, width, height)
        if (tex) tex.needsUpdate = true
      }
    }

    const wrapRichText = (text, startX, y, maxWidth, lineHeight, draw = true) => {
      let currentX = startX
      let currentY = y
      
      const words = text.split(' ')
      let isBold = false
      let isItalic = false
      
      for (let word of words) {
        let post = ''
        if (word.startsWith('**')) { isBold = true; word = word.slice(2) }
        else if (word.startsWith('*')) { isItalic = true; word = word.slice(1) }
        
        if (word.includes('**')) {
          const idx = word.indexOf('**')
          post = word.slice(idx + 2) 
          word = word.slice(0, idx)
        } else if (word.includes('*')) {
          const idx = word.indexOf('*')
          post = word.slice(idx + 1)
          word = word.slice(0, idx)
        }

        ctx.font = isBold ? boldFont : (isItalic ? italicFont : bodyFont)
        const wordWidth = ctx.measureText(word).width
        const spaceWidth = ctx.measureText(' ').width
        const postWidth = post ? ctx.measureText(post).width : 0

        if (currentX + wordWidth + postWidth > startX + maxWidth && currentX > startX) {
          currentX = startX
          currentY += lineHeight
        }
        
        if (draw) ctx.fillText(word, currentX, currentY)
        currentX += wordWidth
        
        if (post) {
           isBold = false
           isItalic = false
           ctx.font = bodyFont
           if (draw) ctx.fillText(post, currentX, currentY)
           currentX += postWidth
        }
        
        currentX += spaceWidth
      }
      return currentY + lineHeight
    }

    const layout = (draw, startY) => {
      let y = startY

      // ── TITLE ROW ──
      ctx.font = '90px "Caveat", cursive'
      ctx.fillStyle = '#1A365D'
      if (draw) {
        ctx.save()
        ctx.translate(w/2, y + 40)
        ctx.rotate(-0.05)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText("About Me", 0, 0)
        ctx.restore()
        // Evil eye to the left of title, not overlapping
        drawAsyncImg('/evil_eye.png', marginX, y, 80, 80)
      }
      y += 110

      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#111111'

      // ── PARAGRAPH 1 + PROFILE PICTURE ──
      // Text wraps around the right-side profile circle
      const p1TextWidth = w - marginX * 2 - 160  // leave 160px gap for picture
      y = wrapRichText(data.bio[0], marginX, y, p1TextWidth, 32, draw)

      // Profile picture circle – right side, vertically centred with p1
      if (draw) {
        const picCx = w - marginX - 90
        const picCy = y - 100
        const picR = 80
        ctx.beginPath()
        ctx.arc(picCx, picCy, picR, 0, Math.PI * 2)
        ctx.lineWidth = 4
        ctx.strokeStyle = '#2C3E50'
        ctx.stroke()
        ctx.fillStyle = 'rgba(0,0,0,0.12)'
        ctx.fill()
        // silhouette head
        ctx.beginPath()
        ctx.arc(picCx, picCy - 28, 32, 0, Math.PI * 2)
        ctx.fill()
        // silhouette shoulders
        ctx.beginPath()
        ctx.arc(picCx, picCy + 40, 52, Math.PI, 0)
        ctx.fill()
      }

      y += 30

      // ── SQUIGGLY LINE ──
      if (draw) {
        ctx.beginPath()
        ctx.moveTo(marginX, y)
        for (let i = 0; i < 8; i++) {
          ctx.bezierCurveTo(
            marginX + i*28 + 14, y - 12,
            marginX + i*28 + 14, y + 12,
            marginX + i*28 + 28, y
          )
        }
        ctx.strokeStyle = '#5BBFBF'
        ctx.lineWidth = 4
        ctx.stroke()
      }
      y += 35

      // ── PARAGRAPH 2 + HIBISCUS ──
      if (draw) ctx.fillStyle = '#111111'
      const p2TextWidth = w - marginX * 2 - 120
      y = wrapRichText(data.bio[1], marginX, y, p2TextWidth, 32, draw)

      if (draw) {
        drawAsyncImg('/hibiscus.png', w - marginX - 110, y - 120, 120, 120)
      }
      y += 40

      // ── PARAGRAPH 3 (indented right like reference) ──
      const p3Width = w - marginX * 2 - 120
      const p3Start = marginX + 80   // slight indent to mirror reference
      if (draw) ctx.fillStyle = '#111111'
      y = wrapRichText(data.bio[2], p3Start, y, p3Width, 32, draw)
      y += 50

      // ── FOOTER: ALOHA IMAGE + "Thanks for visiting!" ──
      if (draw) {
        drawAsyncImg('/aloha.png', w - marginX - 150, y - 30, 160, 110)
      }

      ctx.font = '55px "Caveat", cursive'
      ctx.fillStyle = '#1A365D'
      if (draw) {
        ctx.save()
        ctx.translate(marginX + 10, y + 10)
        ctx.rotate(-0.03)
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(data.footer, 0, 0)
        ctx.restore()
      }
      y += 70

      return y - startY
    }

    const totalHeight = layout(false, 0)
    // Center the entire layout vertically in the canvas
    const startY = Math.max(100, (h - totalHeight) / 2)
    layout(true, startY)
  }

  createBoardTexture(data, bgColor) {
    const canvas = document.createElement('canvas')
    const w = 1024
    const h = 4096
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    // Solid background or transparent decal
    if (bgColor === 'transparent') {
      ctx.clearRect(0, 0, w, h)
    } else {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, w, h)
    }
    
    if (data.isAbout) {
      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.wrapS = THREE.ClampToEdgeWrapping
      tex.wrapT = THREE.ClampToEdgeWrapping
      this.drawAboutMeBoard(ctx, w, h, data, tex)
      return tex
    }

    const marginX = 128
    const textWidth = w - marginX * 2
    const textColor = '#111111'

    // Helper for wrapping text
    const wrapText = (text, x, y, maxWidth, lineHeight, font, draw = true) => {
      ctx.font = font
      const words = text.split(' ')
      let line = ''
      let currentY = y

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width
        if (testWidth > maxWidth && n > 0) {
          if (draw) ctx.fillText(line, x, currentY)
          line = words[n] + ' '
          currentY += lineHeight
        } else {
          line = testLine
        }
      }
      if (draw) ctx.fillText(line, x, currentY)
      return currentY + lineHeight
    }

    const layoutContent = (draw = true, startY = 0) => {
      let y = startY

      // 1. Hand-painted Header — smaller for projects to give content room
      const headerSize = data.items && data.items[0] && data.items[0].bullets ? '70px' : '96px'
      const headerGap  = data.items && data.items[0] && data.items[0].bullets ? 100 : 150
      ctx.font = `${headerSize} "Permanent Marker", sans-serif`
      if (draw) {
        ctx.fillStyle = textColor
        ctx.globalAlpha = 0.95
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(data.title, w / 2, y)
      }
      y += headerGap

      if (draw) {
        ctx.globalAlpha = 0.85
        ctx.textAlign = 'left'
      }

      const bodyFont = '36px Outfit, sans-serif'
      const smallFont = '30px Outfit, sans-serif'
      const boldFont = 'bold 36px Outfit, sans-serif'

      if (data.bio) { // About Me
        data.bio.forEach(para => {
          if(para === "") { y += 30; return }
          y = wrapText(para, marginX, y, textWidth, 48, bodyFont, draw)
        })
        y += 60
        if (draw) ctx.fillStyle = '#333333'
        y = wrapText(data.tags.join('  '), marginX, y, textWidth, 40, smallFont, draw)
      } 
      else if (data.items && data.items[0] && data.items[0].github) { // Projects with github links
        const projTitleFont = 'bold 28px Outfit, sans-serif'
        const projBodyFont = '22px Outfit, sans-serif'

        if (!this._ghButtons['projects']) this._ghButtons['projects'] = []
        this._ghButtons['projects'] = []  // reset each render

        data.items.forEach(item => {
          // Title as a styled hyperlink
          if (draw) {
            ctx.font = projTitleFont
            ctx.fillStyle = '#1a0dab'   // classic link blue
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'

            // Measure title width for underline
            const titleW = ctx.measureText(item.title).width
            ctx.fillText(item.title, marginX, y)

            // Underline
            ctx.beginPath()
            ctx.moveTo(marginX, y + 30)
            ctx.lineTo(marginX + titleW, y + 30)
            ctx.strokeStyle = '#1a0dab'
            ctx.lineWidth = 2
            ctx.stroke()

            // Store hit region (normalised 0–1) for click detection
            this._ghButtons['projects'].push({
              url: item.github,
              x0: marginX / w,
              y0: y / h,
              x1: (marginX + titleW) / w,
              y1: (y + 34) / h
            })
          }
          y += 38

          // Bullet points
          if (draw) {
            ctx.fillStyle = '#222222'
            ctx.font = projBodyFont
          }
          item.bullets.forEach(b => {
            y = wrapText('• ' + b, marginX, y, textWidth, 32, projBodyFont, draw)
          })
          y += 28
        })
      }
      else if (data.items && data.items[0] && data.items[0].role) { // Experience
        const expRoleFont   = 'bold 26px Outfit, sans-serif'
        const expMetaFont   = 'italic 20px Outfit, sans-serif'
        const expBodyFont   = '20px Outfit, sans-serif'
        const expStackFont  = 'bold 20px Outfit, sans-serif'

        data.items.forEach(item => {
          // Role — bold title
          if (draw) { ctx.fillStyle = textColor; ctx.globalAlpha = 1 }
          y = wrapText(item.role + ' — ' + item.company, marginX, y, textWidth, 34, expRoleFont, draw)

          // Date + location — italic grey
          if (draw) ctx.fillStyle = '#555555'
          y = wrapText(item.date + ' · ' + item.location, marginX, y, textWidth, 28, expMetaFont, draw)

          // Optional project description line
          if (item.project) {
            if (draw) ctx.fillStyle = '#444444'
            y = wrapText(item.project, marginX, y, textWidth, 28, expMetaFont, draw)
          }

          // Bullet points
          if (draw) ctx.fillStyle = '#222222'
          item.bullets.forEach(b => {
            y = wrapText('• ' + b, marginX + 8, y, textWidth - 8, 30, expBodyFont, draw)
          })

          y += 30  // gap between items
        })
      }
      else if (data.groups) { // Skills
        const skillNameFont = 'bold 24px Outfit, sans-serif'
        const skillValFont  = '20px Outfit, sans-serif'

        data.groups.forEach(group => {
          // Category name
          if (draw) {
            ctx.fillStyle = '#111111'
            ctx.font = skillNameFont
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            ctx.fillText(group.name, marginX, y)
          }
          y += 30

          // Skills list
          y = wrapText(group.skills, marginX + 8, y, textWidth - 8, 28, skillValFont, draw)
          y += 14  // tight gap between groups
        })
      }
      else if (data.items && data.items[0].value) { // Contact
        if (draw) ctx.fillStyle = '#111111'
        y = wrapText(data.subtitle, marginX, y, textWidth, 48, bodyFont, draw)
        y += 90
        
        data.items.forEach(item => {
          if (draw) ctx.fillStyle = textColor
          y = wrapText(item.type, marginX, y, textWidth, 48, boldFont, draw)
          if (draw) ctx.fillStyle = '#333333'
          y = wrapText(item.value, marginX, y, textWidth, 48, bodyFont, draw)
          y += 60
        })
      }

      return y - startY
    }

    // Pass 1: Calculate total height
    const totalHeight = layoutContent(false, 0)

    // Calculate vertical centering
    let startY = (h - totalHeight) / 2
    
    // Ensure we don't go too close to the top edge due to the board curve
    if (startY < 320) startY = 320
    
    // Pass 2: Draw the content at the centered position
    layoutContent(true, startY)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    
    // We let the UV map natively to the ShapeGeometry bounds [0,1]
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping

    return tex
  }

  buildTable() {
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.6), this.mat('#A08050'))
    top.position.set(-3, 0.7, 2.5)
    top.castShadow = true
    top.receiveShadow = true
    this.group.add(top)

    for (const [dx, dz] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), this.mat('#8B6914'))
      leg.position.set(-3 + dx, 0.35, 2.5 + dz)
      leg.castShadow = true
      leg.receiveShadow = true
      this.group.add(leg)
    }

    const board = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.04), this.mat('#2C3C2C'))
    board.position.set(-3, 1.0, 2.5)
    board.rotation.x = -0.2
    this.group.add(board)
    const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.56, 0.03), this.mat('#5C4A1E'))
    boardFrame.position.copy(board.position).add(new THREE.Vector3(0, 0, -0.01))
    boardFrame.rotation.x = -0.2
    this.group.add(boardFrame)

    this.addCanvasText('GOOD VIBES\nONLY', 0.55, 0.45, board.position.clone().add(new THREE.Vector3(0, 0.02, 0.025)), {
      font: '32px "Permanent Marker", sans-serif', color: '#FFFFFF', bg: 'transparent', lineHeight: 40, rotation: -0.2
    })
  }

  buildPlant() {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.35, 8), this.mat('#4A7FB5'))
    pot.position.set(-1.8, 0.17, 2.8)
    pot.castShadow = true
    this.group.add(pot)

    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8), this.mat('#5C4A1E'))
    soil.position.set(-1.8, 0.35, 2.8)
    this.group.add(soil)

    const leafMat = this.mat('#4A8B5C')
    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 4), leafMat)
      const angle = (i / 5) * Math.PI * 2
      leaf.position.set(
        -1.8 + Math.cos(angle) * 0.12,
        0.55 + Math.random() * 0.15,
        2.8 + Math.sin(angle) * 0.12
      )
      leaf.rotation.x = (Math.random() - 0.5) * 0.5
      leaf.rotation.z = (Math.random() - 0.5) * 0.5
      this.group.add(leaf)
    }
  }

  addCanvasText(text, w, h, pos, opts = {}) {
    const canvas = document.createElement('canvas')
    const scale = 256
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')

    if (opts.bg && opts.bg !== 'transparent') {
      ctx.fillStyle = opts.bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    ctx.fillStyle = opts.color || '#FFFFFF'
    ctx.font = opts.font || '48px Outfit, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const lines = text.split('\n')
    const lh = opts.lineHeight || 50
    const startY = canvas.height / 2 - ((lines.length - 1) * lh * (scale / 256)) / 2
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, startY + i * lh * (scale / 256))
    })

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
    mesh.position.copy(pos)
    if (opts.rotation) mesh.rotation.x = opts.rotation
    this.group.add(mesh)
  }
}
