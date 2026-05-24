declare module 'react-simple-maps' {
  import type { ComponentType, ReactNode, CSSProperties } from 'react'

  export interface GeoFeature {
    rsmKey: string
    id:     number | string
    type:   string
    properties: Record<string, unknown>
    geometry:   unknown
  }

  export interface ComposableMapProps {
    projection?:       string
    projectionConfig?: Record<string, unknown>
    width?:            number
    height?:           number
    style?:            CSSProperties
    className?:        string
    children?:         ReactNode
  }
  export const ComposableMap: ComponentType<ComposableMapProps>

  export interface GeographiesProps {
    geography: string | object
    children:  (args: { geographies: GeoFeature[] }) => ReactNode
  }
  export const Geographies: ComponentType<GeographiesProps>

  export interface GeoStyle {
    fill?:        string
    stroke?:      string
    strokeWidth?: number
    outline?:     string
    cursor?:      string
  }

  export interface GeographyProps {
    geography:      GeoFeature
    fill?:          string
    stroke?:        string
    strokeWidth?:   number
    style?: {
      default?: GeoStyle
      hover?:   GeoStyle
      pressed?: GeoStyle
    }
    onClick?:       (geo: GeoFeature, evt: React.MouseEvent<SVGPathElement>) => void
    onMouseEnter?:  (geo: GeoFeature, evt: React.MouseEvent<SVGPathElement>) => void
    onMouseLeave?:  (geo: GeoFeature, evt: React.MouseEvent<SVGPathElement>) => void
    className?:     string
  }
  export const Geography: ComponentType<GeographyProps>

  export interface SphereProps {
    id?:          string
    fill?:        string
    stroke?:      string
    strokeWidth?: number
  }
  export const Sphere: ComponentType<SphereProps>

  export interface GraticuleProps {
    stroke?:      string
    strokeWidth?: number
  }
  export const Graticule: ComponentType<GraticuleProps>
}
