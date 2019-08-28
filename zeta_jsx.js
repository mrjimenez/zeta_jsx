/*
 * Copyright (C) 2019 - Zeta Tecnologia Ltda <zetatecinf@gmail.com>
 */

// -------------------------------------------------------------------------------

/*
https://www.intmath.com/cg3/jsxgraph-coding-summary.php
*/

// -------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
class TranslatablePolygon {
  constructor(board, vertices, verticesProps, polygonProps) {
    const debugVertices = false
    const localVerticesProps = {
      visible: debugVertices,
      snapToGrid: true,
      snapSizeX: 1,
      snapSizeY: 1,
    }
    const mergedVerticesProps = {
      ...localVerticesProps, ...verticesProps,
    }
    let pointsArray = []
    for (let i = 0; i < vertices.length; ++i) {
      let p = board.create('point', vertices[i], mergedVerticesProps)
      pointsArray.push(p)
    }
    const localPolygonProps = {
      fillColor: '#00FF00',
      highlightFillColor: '#00FF00',
      fillOpacity: 1.0,
      highlightFillOpacity: 1.0,
      // As propriedades abaixo garantem que a gente consegue
      // transladar o polígono sem destruí-lo.
      hasInnerPoints: true,
      vertices: {
        visible: false,
      },
      withLines: false,
    }
    const mergedPolygonProps = {
      ...localPolygonProps, ...polygonProps,
    }
    this.vertices = pointsArray
    this.polygon = board.create('polygon', pointsArray, mergedPolygonProps)
  }
}

// -------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
class RotatablePolygon {
  constructor(board, vertices, verticesProps, polygonProps, centerProps) {
    const debugVertices = false
    this.board = board
    const localVerticesProps = {
      visible: debugVertices,
    }
    const mergedVerticesProps = {
      ...localVerticesProps,
      ...verticesProps,
      snapToGrid: false,
    }
    // Center
    const mergedCenterProps = {
      ...mergedVerticesProps,
      snapToGrid: true,
      snapSizeX: 1,
      snapSizeY: 1,
      visible: true,
      name: '',
      color: 'blue',
      ...centerProps,
    }
    this.center = board.create('point', vertices[0], mergedCenterProps)
    // Glider
    const dx = vertices[1][0] - vertices[0][0]
    const dy = vertices[1][1] - vertices[0][1]
    const radius = Math.sqrt(dx * dx + dy * dy)
    const circle = board.create('circle', [this.center, radius, ],
      { visible: debugVertices, })
    const gliderProps = {
      ...mergedVerticesProps,
      visible: true,
      face: 'plus',
      name: '',
    }
    this.glider = board.create('glider',
      [vertices[1][0], vertices[1][1], circle, ], gliderProps)
    this.angleCg = Math.atan2(
      this.glider.Y() - this.center.Y(),
      this.glider.X() - this.center.X())
    // All the other points
    this.origCenter = vertices[0]
    const translation = board.create('transform', [
      () => {
        var me = this
        return me.center.X() - me.origCenter[0]
      },
      () => {
        var me = this
        return me.center.Y() - me.origCenter[1]
      }, ],
      { type: 'translate', })
    const rotation = board.create('transform',
      [() => {
        var me = this
        const angle = Math.atan2(
          me.glider.Y() - me.center.Y(),
          me.glider.X() - me.center.X())
        // Rotation Snap code
        // const angleStep = 2 * Math.PI / me.rotSnap
        // const steps = angle / angleStep
        // angle = angleStep * Math.round(steps)
        return angle - me.angleCg
      }, this.center, ],
      { type: 'rotate', })
    let pointsArray = [this.center, this.glider, ]
    for (let i = 2; i < vertices.length; ++i) {
      let q = board.create('point', vertices[i], { visible: false, })
      let p = board.create('point', [q, [translation, rotation, ], ], mergedVerticesProps)
      pointsArray.push(p)
    }
    const localPolygonProps = {
      fillColor: '#00FF00',
      highlightFillColor: '#00FF00',
      fillOpacity: 1.0,
      highlightFillOpacity: 1.0,
      // As propriedades abaixo garantem que a gente consegue
      // transladar o polígono sem destruí-lo.
      hasInnerPoints: true,
      vertices: {
        visible: false,
      },
      withLines: false,
    }
    const mergedPolygonProps = {
      ...localPolygonProps, ...polygonProps,
    }
    this.vertices = pointsArray
    this.polygon = board.create('polygon', pointsArray, mergedPolygonProps)
  }
  /* moveTo(): Método para mover um polígono rodável
   *
   * Precisa apenas mover o centro e o glider.
   *
   * Parâmetros:
   * - position: Nova posição do centro de rotação.
   */
  moveTo(position) {
    const deltaX = position[0] - this.center.X()
    const deltaY = position[1] - this.center.Y()
    for (let i = 0; i < 2; ++i) {
      const q = this.vertices[i]
      const delta = [q.X() + deltaX, q.Y() + deltaY, ]
      q.moveTo(delta)
    }
  }
}

// -------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
class DiscreteRotationPolygon {
  constructor(board, numRotations, vertices, verticesProps, polygonProps, centerProps) {
    const debugVertices = false
    // const debugVertices = true
    this.board = board
    // Properties
    const localVerticesProps = {
      visible: debugVertices,
    }
    const mergedVerticesProps = {
      ...localVerticesProps,
      ...verticesProps,
      snapToGrid: false,
    }
    // Center
    const mergedCenterProps = {
      ...mergedVerticesProps,
      snapToGrid: true,
      snapSizeX: 1,
      snapSizeY: 1,
      visible: true,
      name: debugVertices ? 'center' : '',
      color: 'blue',
      ...centerProps,
    }
    let v = vertices
    // The center and the original position of the center
    this.center = board.create('point', v[0], mergedCenterProps)
    this.center.on('down', () => {
      var me = this
      me.phantom.setAttribute({ visible: false, })
    })
    this.center.on('drag', () => {
      var me = this
      me.phantom.moveTo([me.glider.X(), me.glider.Y(), ])
    })
    this.center.on('up', () => {
      var me = this
      me.phantom.moveTo([me.glider.X(), me.glider.Y(), ])
      me.phantom.setAttribute({ visible: true, })
    })
    this.origCenter = v[0]
    // The center translation
    const centerTranslation = board.create('transform', [
      () => {
        var me = this
        return me.center.X() - me.origCenter[0]
      },
      () => {
        var me = this
        return me.center.Y() - me.origCenter[1]
      }, ],
      { type: 'translate', })
    // Glider, phantom and reference points
    // - Glider is the point that belongs to the polygon that moves.
    // - Phantom is the point that is dragged.
    // - Reference points are the possible glider positions.
    const gliderProps = {
      ...mergedVerticesProps,
      visible: true,
      face: 'plus',
      name: debugVertices ? 'glider' : '',
    }
    const phantomProps = {
      ...mergedVerticesProps,
      visible: true,
      face: 'plus',
      name: debugVertices ? 'phantom' : '',
    }
    const referenceProps = {
      ...mergedVerticesProps,
      visible: debugVertices,
      face: 'plus',
      name: 'ref',
    }
    this.numRotations = numRotations
    this.phantom = board.create('point', vertices[1], phantomProps)
    this.phantom.on('up', () => {
      var me = this
      me.phantom.moveTo([me.glider.X(), me.glider.Y(), ])
    })
    this.reference0 = board.create('point', vertices[1],
      { ...phantomProps, name: 'ref0', visible: false, }
    )
    const discreteRotation = board.create('transform',
      [2 * Math.PI / numRotations, this.center, ],
      { type: 'rotate', })
    this.references = []
    //
    let p = this.reference0
    for (let i = 0; i < numRotations; ++i) {
      if (i === 0) {
        p = board.create('point', [p, [centerTranslation, ], ], referenceProps)
      } else {
        p = board.create('point', [p, [discreteRotation, ], ], referenceProps)
      }
      this.references.push(p)
    }
    // Which is the current reference point?
    let refIndex = function (me) {
      let ret = 0
      let dmin = 10000
      for (let i = 0; i < me.references.length; ++i) {
        let p = me.references[i]
        const dx = me.phantom.X() - p.X()
        const dy = me.phantom.Y() - p.Y()
        const d = dx * dx + dy * dy
        if (d < dmin) {
          dmin = d
          ret = i
        }
      }
      return ret
    }
    this.glider = board.create('point', [
      () => {
        var me = this
        return me.references[refIndex(me)].X()
      },
      () => {
        var me = this
        return me.references[refIndex(me)].Y()
      },
    ], gliderProps)
    this.angleCenterGlider = Math.atan2(
      this.glider.Y() - this.center.Y(),
      this.glider.X() - this.center.X())
    // All the other points
    const gliderRotation = board.create('transform',
      [() => {
        var me = this
        const angle = Math.atan2(
          me.glider.Y() - me.center.Y(),
          me.glider.X() - me.center.X())
        return angle - me.angleCenterGlider
      }, this.center, ],
      { type: 'rotate', })
    let pointsArray = [this.center, this.glider, ]
    for (let i = 2; i < vertices.length; ++i) {
      let q = board.create('point', vertices[i], { visible: false, })
      let p = board.create('point', [q, [centerTranslation, gliderRotation, ], ], mergedVerticesProps)
      pointsArray.push(p)
    }
    const localPolygonProps = {
      fillColor: '#00FF00',
      highlightFillColor: '#00FF00',
      fillOpacity: 1.0,
      highlightFillOpacity: 1.0,
      // As propriedades abaixo garantem que a gente consegue
      // transladar o polígono sem destruí-lo.
      hasInnerPoints: true,
      vertices: {
        visible: false,
      },
      withLines: false,
    }
    const mergedPolygonProps = {
      ...localPolygonProps, ...polygonProps,
    }
    this.vertices = pointsArray
    this.polygon = board.create('polygon', pointsArray, mergedPolygonProps)
  }
  /* moveTo(): Método para mover um polígono rodável discreto
   *
   * Precisa mover o centro, o glider e o phantom
   *
   * Parâmetros:
   * - position: Nova posição do centro de rotação.
   */
  moveTo(position) {
    const deltaX = position[0] - this.center.X()
    const deltaY = position[1] - this.center.Y()
    let p = this.center
    p.moveTo([p.X() + deltaX, p.Y() + deltaY, ])
    p = this.glider
    p.moveTo([p.X() + deltaX, p.Y() + deltaY, ])
    p = this.phantom
    p.moveTo([p.X() + deltaX, p.Y() + deltaY, ])
  }
  /* rotate(): Rotates a DiscreteRotationPolygon around the center.
   *           The value of n is an absolute position.
   *
   * Parameters:
   * - n: the number of discrete rotations to perform from the initial
   *      position.
   */
  rotate(n) {
    n = Math.round(n) % this.numRotations
    let p = this.references[n]
    let where = [p.X(), p.Y(), ]
    this.glider.moveTo(where)
    this.phantom.moveTo(where)
  }
  /* rotateRelative():  Rotates a DiscreteRotationPolygon around the center.
   *                    The value of n is a relative position.
   *
   * Parameters:
   * - n: the number of discrete rotations to perform from the current position.
   */
  rotateRelative(n) {
    let i = 0
    let found = false
    while (!found) {
      let p = this.references[i]
      found =
        this.glider.X() === p.X() &&
        this.glider.Y() === p.Y()
      if (found) {
        break
      }
      ++i
    }
    n += i
    this.rotate(n)
  }
}

// -------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
class Figura {
  constructor(board, local, xFig, yFig, lFig, aFig) {
    this.fig = board.create('image', [local, [xFig, yFig, ], [lFig, aFig, ], ],
      {
        fixed: true,
        highlightFillOpacity: 1.0,
        keepaspectratio: true,
      })
  }
}

// -------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
class Drawing {
  constructor(board, vertices, verticesProps, segmentProps) {
    const debugVertices = false
    const localVerticesProps = {
      visible: debugVertices,
      fixed: true,
    }
    const mergedVerticesProps = {
      ...localVerticesProps, ...verticesProps,
    }
    let pointsArray = []
    for (let i = 0; i < vertices.length; ++i) {
      let p = board.create('point', vertices[i], mergedVerticesProps)
      pointsArray.push(p)
    }
    const localSegmentProps = {
      fixed: true,
      vertices: {
        visible: false,
      },
      withLines: true,
      dash: 1,
      strokeColor: '#ed143d',
    }

    const mergedSegmentProps = {
      ...localSegmentProps, ...segmentProps,
    }

    let segmentsArray = []
    let l = board.create('segment', [vertices[vertices.length - 1], vertices[0], ], mergedSegmentProps)
    segmentsArray.push(l)
    for (let i = 1; i < vertices.length; ++i) {
      let l = board.create('segment', [vertices[i], vertices[i - 1], ], mergedSegmentProps)
      segmentsArray.push(l)
    }

    this.vertices = pointsArray
    this.segments = segmentsArray

    const corfundoDesenhos = '#dfe0e0'
    this.polygon = board.create('polygon', pointsArray, {
      withLines: false,
      fillColor: corfundoDesenhos,
      fillOpacity: 1.0,
    })
  }
}

// -------------------------------------------------------------------------------
